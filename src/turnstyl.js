"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Turnstyl = void 0;
var schemaQuery = require('./schemaQuery').schemaQuery;
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
// TODO: determine out to expose the yml file in user's directory (outside of node modules in final test platform)
var yamlFileContents = fs.readFileSync(path.join(__dirname, '../turnstyl.config.yaml'), 'utf8');
// Load yaml into file
var userConfig = yaml.load(yamlFileContents);
var Turnstyl = function () {
    this.schemaCache = {};
    // Stores schema of producer event and the target topic
    /**
     * @method cacheProducerEvent
     * @param topicID <String> Name of reference Kafka topic in which an event is being checked
     * @param event <Object> event Object that is being sent to Kafka
     * @returns nothing
     */
    this.cacheProducerEvent = function (topicID, event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // set to overwrite by default, always takes most recent schema
                this.schemaCache[topicID] = this.extractSchema(event);
                return [2 /*return*/];
            });
        });
    };
    // Take evaluated result of jsonDatatypeParser and pass back to parent function
    // Note - I assume there was some strong logic regarding why don't call jsonDatatypeParser directly in the parent func
    /**
     * @method extractSchema
     * @param event <Object> event Object that is being sent to Kafka
     * @returns nothing
     */
    this.extractSchema = function (event) {
        var schema = this.jsonDatatypeParser(event);
        return schema;
    };
    // Method that converts a JSON object into a nested object
    /**
     * @method jsonDatatypeParser
     * @param obj <Object> raw event object
     * @returns <Object> event Object that is being sent to Kafka
     */
    this.jsonDatatypeParser = function (obj) {
        if (obj === null)
            console.log('Obj is undefined');
        var schema = {};
        for (var key in obj) {
            if (typeof obj[key] == 'object') {
                schema[key] = this.jsonDatatypeParser(obj[key]);
            }
            else {
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
    this.compareProducerToDBSchema = function (topicID) {
        return __awaiter(this, void 0, void 0, function () {
            var producerSchema, dbPayload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        producerSchema = this.schemaCache[topicID];
                        return [4 /*yield*/, schemaQuery(
                            // Temporary fix semi-hardcoding until longer term strategy put in place
                            userConfig['big_query_project_name'], userConfig['big_query_data_set_name'], topicID)];
                    case 1:
                        dbPayload = _a.sent();
                        try {
                            // Stringify both the producer object and database payload
                            if (JSON.stringify(producerSchema) !== JSON.stringify(dbPayload)) {
                                throw 'The database payload and producer event do not match';
                            }
                            else {
                                console.log('No issues detected');
                            }
                        }
                        catch (err) {
                            console.log('Mismatch detected: ', err);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
};
exports.Turnstyl = Turnstyl;
