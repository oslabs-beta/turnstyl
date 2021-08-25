const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();


const schemaQuery = async () => {

  const query = `SELECT TABLE_SCHEMA FROM ?.INFORMATION_SCHEMA.TABLES;`;

  const column = `SELECT TABLE_SCHEMA, DATA_TYPE FROM ?.INFORMATION_SCHEMA.COLUMNS`;

  const options = {
    query: query,
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  // Print the results
  console.log('Rows:');
  rows.forEach(row => console.log(row));
}

