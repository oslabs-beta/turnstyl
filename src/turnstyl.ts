const { schemaQuery } = require('./schemaQuery');
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
   * @returns nothing
   */
  this.compareProducerToDBSchema = async function (topicID: string) {
    // fetch updated schema from DB
    let producerSchema = this.schemaCache[topicID];
    let dbPayload = await schemaQuery(
      // Temporary fix semi-hardcoding until longer term strategy put in place
      userConfig['big_query_project_name'],
      userConfig['big_query_data_set_name'],
      topicID
    );
    try {
      // Stringify both the producer object and database payload
      if (JSON.stringify(producerSchema) !== JSON.stringify(dbPayload)) {
        throw 'The database payload and producer event do not match';
      } else {
        console.log('No issues detected');
      }
    } catch (err) {
      console.log('Mismatch detected: ', err);
    }
  };
};

export { Turnstyl };
