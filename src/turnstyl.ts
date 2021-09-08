import { TestResult } from '@jest/types';
import { object } from 'is';
import { format } from 'path/posix';
const { schemaQuery } = require('./schemaQuery');
const { integrationTestingFlag } = require('./integrationTestingFlag');
const fs = require('fs');
const { configInitializer } = require('./configInitializer');
const winston = require('winston');

// Winston instance
let logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss MM-DD-YY' }),
    winston.format.printf((info) =>
      JSON.stringify({
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
      })
    )
  ),
  transports: [
    // Log routing & logging for level `error`
    new winston.transports.Console({
      level: 'error',
    }),
    new winston.transports.File({
      level: 'error',
      filename: './logs/error.log',
    }),
    // Log routing & logging for level `info`
    new winston.transports.Console({
      level: 'info',
    }),
    new winston.transports.File({
      level: 'info',
      filename: './logs/info.log',
    }),
  ],
});

const userConfig = configInitializer();

class Turnstyl {
  schemaCache = {};

  // Stores schema of producer event and the target topic
  /**
   * @method cacheProducerEvent
   * @param topicID <String> Name of reference Kafka topic in which an event is being checked
   * @param event <Object> event Object that is being sent to Kafka
   * @returns nothing
   */
  async cacheProducerEvent(topicID: string, event: object) {
    // set to overwrite by default, always takes most recent schema
    this.schemaCache[topicID] = this.extractSchema(event);
  }

  // Take evaluated result of jsonDatatypeParser and pass back to parent function
  // Note - I assume there was some strong logic regarding why don't call jsonDatatypeParser directly in the parent func
  /**
   * @method extractSchema
   * @param event <Object> event Object that is being sent to Kafka
   * @returns nothing
   */
  extractSchema(event: object) {
    const schema = this.jsonDatatypeParser(event);
    return schema;
  }

  // Method that converts a JSON object into a nested object
  /**
   * @method jsonDatatypeParser
   * @param obj <Object> raw event object
   * @returns <Object> event Object that is being sent to Kafka
   */
  jsonDatatypeParser(obj: object) {
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
  }

  // Recursively traverse and compare schemaCache, throws error if there is a mismatch
  /**
   * @method compareProducerToDBSchema
   * @param topicID <String> Name of reference Kafka topic in which an event is being checked
   * @param isTyped <boolean> True if topicID explicitly consists of typed schema, defaults to false for standard data request
   * @returns nothing
   */
  async compareProducerToDBSchema(topicID: string, isTyped: boolean = false) {
    // fetch updated schema from DB
    const producerSchema = this.schemaCache[topicID];
    let dbPayload;
    // Embed integration test flag so we draw a from config file during integration
    if (integrationTestingFlag()) {
      dbPayload = userConfig['testPayload'];
    } else {
      dbPayload = await schemaQuery(
        // Temporary fix semi-hardcoding until longer term strategy put in place
        userConfig['big_query_project_name'],
        userConfig['big_query_dataset_name'],
        topicID
      );
      // console.log(JSON.parse(dbPayload), 'dbPayload');
      dbPayload = dbPayload.payload;
      console.log(producerSchema, 'producerSchema');
      console.log(dbPayload, 'dbPayload');
    }
    // extract msg data and parse into an object as appropriate

    if (!isTyped) {
      dbPayload = JSON.parse(dbPayload);
    }
    try {
      // Stringify both the producer object and database payload
      if (isTyped) {
        if (JSON.stringify(producerSchema) !== dbPayload) {
          logger.error({
            message:
              'The database payload and producer event do not match on schema check' +
              ' for topic: ' +
              topicID,
          });
        } else {
          logger.info('✅ No issues detected');
        }
      } else {
        // check the keys of each and note any mismatch
        if (!this.deepCompareKeys(producerSchema, dbPayload)) {
          // add to log file when theres error
          logger.error(
            `The database payload and producer event have a field (key) mistmatch
               for topic: ${topicID}`
          );
        } else {
          logger.info('✅ No issues detected');
        }
      }
    } catch (err) {
      logger.error(`Mismatch detected: ${err}`);
    }
  }
  //## Helper Methods ##
  /**
   * @method deepCompareKeys
   * @param object1 <object> Schema pair for comparison
   * @param object2 <object> Second Schema for comparison
   * @returns <boolean>
   */
  // traverse keys of both schemas and return false upon mismatch
  deepCompareKeys(object1: object, object2: object) {
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
  }
}

export { Turnstyl };
