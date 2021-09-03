const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
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

// Function that queries the Big Query API and fetches the latest record from our event table
/**
 * @function schemaQuery
 * @param projectName <String> Name of the google Cloud Big Query project that form the table address
 * @param datasetName <String> Name of the dataset that has the table of interest
 * @returns The most recent row form the select table
 */
const schemaQuery = async (
  projectName: string,
  datasetName: string,
  tableName: string
) => {
  try {
    if (!projectName || !datasetName || !tableName) throw 'undefined';
    if (datasetName === '' || datasetName === '' || tableName === '')
      throw 'an empty string';
    const query = `
      SELECT payload
      FROM ${projectName}.${datasetName}.${tableName}
      ORDER BY insertion_timestamp
      DESC
      LIMIT 1
      `;
    // Run the query as a job
    const [job] = await bigquery.createQueryJob({
      keyFilename: userConfig['google_service_credentials'],
      query: query,
    });
    // Wait for the query to finish
    const [rows] = await job.getQueryResults();
    // return the first row from the table
    return rows[0];
  } catch (err) {
    return 'Invalid Input: input is ' + err;
  }
};

export { schemaQuery };
