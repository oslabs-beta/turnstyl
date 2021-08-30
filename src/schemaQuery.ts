const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const fs = require('fs');
const yaml = require('js-yaml');
// TODO: determine out to expose the yml file in user's directory (outside of node modules in final test platform)
let fileContents = fs.readFileSync('../turnstyl.config.yaml', 'utf8');
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
const schemaQuery = async (
  projectName :string,
  datasetName: string,
  tableName: string,
  payloadName: string = 'payload',
  orderByName: string = 'insertion_timestamp'
) => {
 
  const query = 
  `
  SELECT ${payloadName}
  FROM ${projectName}.${datasetName}.${tableName}
  ORDER BY ${orderByName}
  DESC
  LIMIT 1
  `;

  // Run the query as a job
  const [job] = await bigquery.createQueryJob({
    keyFilename: data['google_service_credentials'],
    query: query
  });
  // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  // return the first row from the table
  return rows[0];
};

export { schemaQuery };
