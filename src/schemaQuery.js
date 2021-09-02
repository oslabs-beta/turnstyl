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
exports.schemaQuery = void 0;
var BigQuery = require('@google-cloud/bigquery').BigQuery;
var bigquery = new BigQuery();
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
// TODO: determine out to expose the yml file in user's directory (outside of node modules in final test platform)
var fileContents = fs.readFileSync(path.join(__dirname, '../turnstyl.config.yaml'), 'utf8');
// Load yaml into file
var data = yaml.load(fileContents);
// Function that queries the Big Query API and fetches the latest record from our event table
/**
 * @function schemaQuery
 * @param projectName <String> Name of the google Cloud Big Query project that form the table address
 * @param datasetName <String> Name of the dataset that has the table of interest
 * @param tableName <String> Table of interest
 * @param payloadName <string>Default:'payload' - Optional name of payload
 * @returns The most recent row form the select table
 */
var schemaQuery = function (projectName, datasetName, tableName, payloadName, orderByName) {
    if (payloadName === void 0) { payloadName = 'payload'; }
    if (orderByName === void 0) { orderByName = 'insertion_timestamp'; }
    return __awaiter(void 0, void 0, void 0, function () {
        var query, job, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "\n  SELECT " + payloadName + "\n  FROM " + projectName + "." + datasetName + "." + tableName + "\n  ORDER BY " + orderByName + "\n  DESC\n  LIMIT 1\n  ";
                    return [4 /*yield*/, bigquery.createQueryJob({
                            keyFilename: data['google_service_credentials'],
                            query: query
                        })];
                case 1:
                    job = (_a.sent())[0];
                    return [4 /*yield*/, job.getQueryResults()];
                case 2:
                    rows = (_a.sent())[0];
                    // return the first row from the table
                    return [2 /*return*/, rows[0]];
            }
        });
    });
};
exports.schemaQuery = schemaQuery;
