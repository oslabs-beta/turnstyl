require('dotenv').config();

function integrationTestingFlag() {
  console.log(
    '🚧 Travis integration Test Flag: ',
    process.env.TRAVIS_BUILD_STAGE_NAME !== undefined
  );
  return process.env.TRAVIS_BUILD_STAGE_NAME !== undefined;
}

export { integrationTestingFlag };
