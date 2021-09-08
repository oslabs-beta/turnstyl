require('dotenv').config();

function integrationTestingFlag() {
  return process.env.TRAVIS_BUILD_STAGE_NAME !== undefined;
}

export { integrationTestingFlag };
