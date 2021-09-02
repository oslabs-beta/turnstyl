var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
/**
 *  Hooking in the producer to Turnstyl here
 *  > Ingest data schema from producer
 *  > store in an object in an accessible way (what is best way to accomplish this, by topic?)
 *  > will likely be home to the functions that check schema and detect errors
 */
const { schemaQuery } = require("./schemaQuery.js");
// How will user use our package?
/**
    * > install the npm package
    * > user to require in and invoke methods
    * > const turnstyle = require('kafka-turnstyle');
    *
    * How does the user subscribe to the producer
    * > turnstyl.record(msg); // before the message is sent

    *
    * How does Turnstyl operate in the code / event flow?
    * > in sequential / recurring block, run turnstyle.checkSchema(), which prints errors when mismatch occurs
    * > async function validate() {
    *   setTimeout(1000, turnstyle.checkSchema());
    * }
    */
// TODO - refactor to use prototype or class, whatever is best practice in TS
const Turnstyl = function () {
  this.schemas = {}; // save our existing message schemas here
  // TODO - list of databases - use database AddressLog, sign up each producer
  // hook in and record message before sending, do not check at call
  this.record = function (topicID, message) {
    return __awaiter(this, void 0, void 0, function* () {
      // set to overwrite by default, always takes most recent schema
      this.schemas[topicID] = this.extractSchema(message);
    });
  };
  this.checkMessage = function (topicID, message) {
    return __awaiter(this, void 0, void 0, function* () {
      // set to overwrite by default, always takes most recent schema
      this.schemas[topicID] = this.extractSchema(message);
      // now check for schema match
      yield this.checkSchema(); // add some logic after checking
    });
  };
  // traverse object and extract schema
  this.extractSchema = function (message) {
    // recursively traverse JSON and populate types for Schema object
    // TODO - check if we are getting a string, call JSON.parse();
    const schema = this.jsonHelper(message);
    return schema;
  };
  // traverse stringified object and extract schema
  this.extractSchemaFromString = function (message) {
    return;
  };
  // TODO - should we traverse arrays?
  this.jsonHelper = function (obj) {
    if (obj === null) return;
    let schema = {};
    for (let key in obj) {
      if (typeof obj[key] == "object") {
        schema[key] = this.jsonHelper(obj[key]);
      } else {
        schema[key] = typeof obj[key];
      }
    }
    return schema;
  };
  // run at interval by user to check for schema mismatches and pushes an error,
  this.checkSchema = function (topicID) {
    return __awaiter(this, void 0, void 0, function* () {
      //recursively traverse and compare schemas, may need to implement vs. using '==' for validation
      // fetch updated schema from DB
      let producerSchema = this.schemas[topicID];
      let dbSchema = {}; //await schemaQuery(); // TODO - this should take a database argument, specificed at initialization per the topic
      // simple approach - does this break?
      // console.log("This is the DB schema", dbSchema, typeof dbSchema);
      if (JSON.stringify(producerSchema) !== JSON.stringify(dbSchema)) {
        // might be slow
        console.log("There is a mismatch in your schemas");
      } else console.log("No data integrity issue");
      // otherwise recursively traverse both objects
    });
  };
};
module.exports = { Turnstyl };
