"use strict";
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
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
exports.__esModule = true;
exports.Turnstyl = void 0;
/**
 *  Hooking in the producer to Turnstyl here
 *  > Ingest data schema from producer
 *  > store in an object in an accessible way (what is best way to accomplish this, by topic?)
 *  > will likely be home to the functions that check schema and detect errors
 */
var schemaQuery = require("./schemaQuery.js").schemaQuery;
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
var Turnstyl = function () {
  this.schemas = {}; // save our existing message schemas here
  // TODO - list of databases - use database AddressLog, sign up each producer
  // hook in and record message before sending, do not check at call
  this.record = function (topicID, message) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // set to overwrite by default, always takes most recent schema
        this.schemas[topicID] = this.extractSchema(message);
        return [2 /*return*/];
      });
    });
  };
  this.checkMessage = function (topicID, message) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // set to overwrite by default, always takes most recent schema
            this.schemas[topicID] = this.extractSchema(message);
            // now check for schema match
            return [4 /*yield*/, this.checkSchema()];
          case 1:
            // now check for schema match
            _a.sent(); // add some logic after checking
            return [2 /*return*/];
        }
      });
    });
  };
  // traverse object and extract schema
  this.extractSchema = function (message) {
    // recursively traverse JSON and populate types for Schema object
    // TODO - check if we are getting a string, call JSON.parse();
    var schema = this.jsonHelper(message);
    return schema;
  };
  // traverse stringified object and extract schema
  this.extractSchemaFromString = function (message) {
    return;
  };
  // TODO - should we traverse arrays?
  this.jsonHelper = function (obj) {
    if (obj === null) return;
    var schema = {};
    for (var key in obj) {
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
    return __awaiter(this, void 0, void 0, function () {
      var producerSchema, dbSchema;
      return __generator(this, function (_a) {
        producerSchema = this.schemas[topicID];
        dbSchema = {};
        // simple approach - does this break?
        // console.log("This is the DB schema", dbSchema, typeof dbSchema);
        if (JSON.stringify(producerSchema) !== JSON.stringify(dbSchema)) {
          // might be slow
          console.log("There is a mismatch in your schemas");
        } else console.log("No data integrity issue");
        return [2 /*return*/];
      });
    });
  };
};
exports.Turnstyl = Turnstyl;
