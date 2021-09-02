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
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
// TODO: determine out to expose the yml file in user's directory (outside of node modules in final test platform)
let fileContents = fs.readFileSync(
  path.join(__dirname, "../turnstyl.config.yaml"),
  "utf8"
);
// Load yaml into file
let data = yaml.load(fileContents);
// Function that queries the Big Query API and fetches the latest record from our event table
/**
 * @function schemaQuery
 * @param projectName <String> Name of the google Cloud Big Query project that form the table address
 * @param datasetName <String> Name of the dataset that has the table of interest
 * @param tableName <String> Table of interest
 * @param payloadName <string>Default:'payload' - Optional name of payload
 * @returns The most recent row form the select table
 */
const schemaQuery = (
  projectName,
  datasetName,
  tableName,
  payloadName = "payload",
  orderByName = "insertion_timestamp"
) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = `
  SELECT ${payloadName}
  FROM ${projectName}.${datasetName}.${tableName}
  ORDER BY ${orderByName}
  DESC
  LIMIT 1
  `;
    // Run the query as a job
    const [job] = yield bigquery.createQueryJob({
      keyFilename: data["google_service_credentials"],
      query: query,
    });
    // Wait for the query to finish
    const [rows] = yield job.getQueryResults();
    // return the first row from the table
    return rows[0];
  });
export { schemaQuery };
