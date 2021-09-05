require('dotenv').config();

function integrationTestingFlag() {
  return process.TRAVIS_BUILD_STAGE_NAME !== undefined;
}

export { integrationTestingFlag };
