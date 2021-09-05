import { TestResult } from '@jest/types';
import { object } from 'is';
const { schemaQuery } = require('./schemaQuery');
const { integrationTestingFlag } = require('./integrationTestingFlag');
const fs = require('fs');
const path = require('path');
const { configInitializer } = require('./configInitializer');

const userConfig = configInitializer();

const Turnstyl = function (this: typeof Turnstyl) {
  this.schemaCache = {};

  // Stores schema of producer event and the target topic
  /**
   * @method cacheProducerEvent
   * @param topicID <String> Name of reference Kafka topic in which an event is being checked
   * @param event <Object> event Object that is being sent to Kafka
   * @returns nothing
   */
  this.cacheProducerEvent = async function (topicID: string, event: object) {
    // set to overwrite by default, always takes most recent schema
    this.schemaCache[topicID] = this.extractSchema(event);
  };

  // Take evaluated result of jsonDatatypeParser and pass back to parent function
  // Note - I assume there was some strong logic regarding why don't call jsonDatatypeParser directly in the parent func
  /**
   * @method extractSchema
   * @param event <Object> event Object that is being sent to Kafka
   * @returns nothing
   */
  this.extractSchema = function (event: object) {
    const schema = this.jsonDatatypeParser(event);
    return schema;
  };

  // Method that converts a JSON object into a nested object
  /**
   * @method jsonDatatypeParser
   * @param obj <Object> raw event object
   * @returns <Object> event Object that is being sent to Kafka
   */
  this.jsonDatatypeParser = function (obj: object) {
    if (obj === null) console.log('Obj is undefined');
    let schema = {};
    for (let key in obj) {
      if (typeof obj[key] == 'object') {
        schema[key] = this.jsonDatatypeParser(obj[key]);
      } else {
        schema[key] = typeof obj[key];
      }
    }
    return schema;
  };

  // Recursively traverse and compare schemaCache, throws error if there is a mismatch
  /**
   * @method compareProducerToDBSchema
   * @param topicID <String> Name of reference Kafka topic in which an event is being checked
   * @param isTyped <boolean> True if topicID explicitly consists of typed schema, defaults to false for standard data request
   * @returns nothing
   */
  this.compareProducerToDBSchema = async function (
    topicID: string,
    isTyped: boolean = false
  ) {
    // fetch updated schema from DB
    const producerSchema = this.schemaCache[topicID];
    let dbPayload;
    console.log(integrationTestingFlag());
    if (integrationTestingFlag()) {
      dbPayload = userConfig['testPayload'];
    } else {
      dbPayload = await schemaQuery(
        // Temporary fix semi-hardcoding until longer term strategy put in place
        userConfig['big_query_project_name'],
        userConfig['big_query_dataset_name'],
        topicID
      );
      dbPayload = dbPayload.payload;
    }
    // extract msg data and parse into an object as appropriate
    isTyped ? (dbPayload = dbPayload) : (dbPayload = JSON.parse(dbPayload));
    try {
      // Stringify both the producer object and database payload
      if (isTyped) {
        if (JSON.stringify(producerSchema) !== dbPayload) {
          throw '❌ The database payload and producer event do not match on schema check';
        } else {
          console.log('✅ No issues detected');
        }
      } else {
        // check the keys of each and note any mismatch
        if (!this.deepCompareKeys(producerSchema, dbPayload)) {
          throw '❌ The database payload and producer event have a field (key) mistmatch';
        } else {
          console.log('✅ No issues detected');
        }
      }
    } catch (err) {
      console.log('❌ Mismatch detected: ', err);
    }
  };

  //## Helper Methods ##
  /**
   * @method deepCompareKeys
   * @param object1 <object> Schema pair for comparison
   * @param object2 <object> Second Schema for comparison
   * @returns <boolean>
   */
  // traverse keys of both schemas and return false upon mismatch
  this.deepCompareKeys = function (object1: object, object2: object) {
    // base case - nulls
    if (object1 === null && object2 === null) {
      return true;
    }
    // get the keys at his level for both
    let keys1, keys2;
    object1 !== null ? (keys1 = Object.keys(object1)) : (keys1 = []);
    object2 !== null ? (keys2 = Object.keys(object2)) : (keys2 = []);

    //check if they have differing lengths
    if (keys1.length !== keys2.length) return false;

    //since they have same length, iterate through
    for (let i = 0; i < keys1.length; i++) {
      if (
        keys1[i] !== keys2[i] ||
        typeof object1[keys1[i]] !== typeof object2[keys2[i]]
      ) {
        return false; // nesting mismatch
      }
      if (
        typeof object1[keys1[i]] === 'object' &&
        typeof object2[keys2[i]] === 'object'
      ) {
        if (!this.deepCompareKeys(object1[keys1[i]], object2[keys2[i]])) {
          return false;
        }
      }
    }
    return true;
  };
};

export { Turnstyl };
