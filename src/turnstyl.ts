import { TestResult } from "@jest/types";
import { object } from "is";

const { schemaQuery } = require('./schemaQuery');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
// TODO: determine out to expose the yml file in user's directory (outside of node modules in final test platform)
const yamlFileContents = fs.readFileSync(
  path.join(__dirname, '../turnstyl.config.yaml'),
  'utf8'
);
// Load yaml into file
const userConfig = yaml.load(yamlFileContents);

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
  this.compareProducerToDBSchema = async function (topicID: string, isTyped: boolean = false) {
    // fetch updated schema from DB
    let producerSchema = this.schemaCache[topicID];
    let dbPayload = await schemaQuery(
      // Temporary fix semi-hardcoding until longer term strategy put in place
      userConfig['big_query_project_name'],
      userConfig['big_query_data_set_name'],
      topicID
    );
    // extract msg data and parse into an object as appropriate
    isTyped ? dbPayload = dbPayload.payload : dbPayload = JSON.parse(dbPayload.payload);
    try {
      // Stringify both the producer object and database payload
      if (isTyped){
        if (JSON.stringify(producerSchema) !== dbPayload) {
          throw 'The database payload and producer event do not match on schema check';
        } else {
          console.log('No issues detected');
        }
      } else {
        // check the keys of each and note any mismatch 
        if (!this.deepCompareKeys(producerSchema, dbPayload)) {
          throw 'The database payload and producer event have a field (key) mistmatch';
        } else {
          console.log('No issues detected');
        }
      }
    } catch (err) {
      console.log('Mismatch detected: ', err);
    }
};

  //## Helper Methods ## 

  // traverse keys of both schemas and return false upon mismatch
  this.deepCompareKeys = function (object1: object, object2: object){
    // base case - nulls 
    if(object1 === null && object2 === null){
      return true;
    } 
    // get the keys at his level for both
    let keys1, keys2;
    object1 !== null ? keys1 = Object.keys(object1) : keys1 = [];
    object2 !== null ? keys2 = Object.keys(object2) : keys2 = [];

    //check if they have differing lengths
    if (keys1.length !== keys2.length ) return false;

    //since they have same length, iterate through
    for (let i = 0; i < keys1.length; i++){
      if (keys1[i] !== keys2[i]) {
        return false; // nesting mismatch
      }  
      if (typeof(object1[keys1[i]]) === 'object' && typeof(object2[keys2[i]]) === 'object'){
        if(!this.deepCompareKeys(object1[keys1[i]],object2[keys2[i]])){
          return false;
        }
      } else if ((typeof(object1[keys1[i]]) !== 'object' && typeof(object2[keys2[i]]) === 'object') 
      || (typeof(object1[keys1[i]]) !== 'object' && typeof(object2[keys2[i]]) === 'object')){
        return false;
      }
    }
  return true;
  };
};

export { Turnstyl };

// TESTING - DELETE
const projectName: string = 'probable-cove-323115';
const datasetName: string = 'turnstyl_test_events';
const tableName: string = 'bank_transfer_events';
const testMessage: object = {
  event_id: '7c9c6a64-2678-4589-90c2-fdb1d33c876c',
  eventTimstamp: '2062-08-08T03:53:23.563Z',
  eventName: 'bank_transfer_transactions',
  senderName: 'Dana Rohan',
  senderAccount: '77838202',
  senderAccountName: 'Home Loan Account',
  receiverName: 'Ms. Craig Smith',
  receiverAccount: '93915846',
  receiverAccountName: 'Money Market Account',
  transactionDesc:
    'deposit transaction at Barton - Brakus using card ending with ***0217 for STN 119.62 in account ***26941414',
  transaction_type: 'invoice',
  amount: '480.22',
  currency: 'Serbian Dinar',
  curencyCode: 'NPR',
  NEST: { 
    MATCH: 'true',
  },
};
const testNest: object =  {
  event_id: '7c9c6a64-2678-4589-90c2-fdb1d33c876c',
  eventTimstamp: '2062-08-08T03:53:23.563Z',
  eventName: 'bank_transfer_transactions',
  senderName: 'Dana Rohan',
  senderAccount: '77838202',
  senderAccountName: 'Home Loan Account',
  receiverName: 'Ms. Craig Smith',
  receiverAccount: '93915846',
  receiverAccountName: 'Money Market Account',
  transactionDesc:
    'deposit transaction at Barton - Brakus using card ending with ***0217 for STN 119.62 in account ***26941414',
  transaction_type: 'invoice',
  amount: '480.22',
  currency: 'Serbian Dinar',
  curencyCode: 'NPR',
  NEST: { 
    MATCH: 'true',
  },
};
const testNestBad: object =  {
  event_id: '7c9c6a64-2678-4589-90c2-fdb1d33c876c',
  eventTimstamp: '2062-08-08T03:53:23.563Z',
  eventName: 'bank_transfer_transactions',
  senderName: 'Dana Rohan',
  senderAccount: '77838202',
  senderAccountName: 'Home Loan Account',
  receiverName: 'Ms. Craig Smith',
  receiverAccount: '93915846',
  receiverAccountName: 'Money Market Account',
  transactionDesc:
    'deposit transaction at Barton - Brakus using card ending with ***0217 for STN 119.62 in account ***26941414',
  transaction_type: 'invoice',
  amount: '480.22',
  currency: 'Serbian Dinar',
  curencyCode: 'NPR',
  NEST: { 
    MATCH: 'false',
    EXTRA: 'this should fail now',
  },
};
const ts = new Turnstyl();
console.log('testing nesting - should be true: ',ts.deepCompareKeys(testMessage, testNest));
console.log('testing bad nest - should be false: ', ts.deepCompareKeys(testMessage, testNestBad));
const data = schemaQuery(projectName, datasetName, tableName)
.then (el => {
  console.log('resp.payload ', el.payload)
  const obj = JSON.parse(el.payload);
  console.log('bigquey after parse', obj);
  console.log("Schemas match? :",ts.deepCompareKeys(testMessage, obj));
});
