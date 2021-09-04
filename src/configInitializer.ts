const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const appRoot = require('app-root-path');
// Input cache and error log bool
const cache: object = {};
let errorLogged: boolean = false;

// Function that fetches the YAML config file from root
/**
 * @function configInitializer
 * @returns The yaml config file
 */
function configInitializer() {
  try {
    // Check if the YAML has been cached
    if (!cache['yamlFileContents']) {
      // If not cache the YAML located at root
      cache['yamlFileContents'] = fs.readFileSync(
        path.join(appRoot.path, 'turnstyl.config.yaml'),
        'utf8'
      );
      console.log('✅ yml file found');
    }
    // Load yaml into file
    const userConfig: object = yaml.load(cache['yamlFileContents']);
    return userConfig;
  } catch {
    // Check if the error relating to the YAML not being found is false
    if (!errorLogged) {
      // If so set to true
      errorLogged = true;
      // Log error to console
      console.log(
        '😭 No config file found. Please initialise a yaml config file at the root of your directory. See https://github.com/oslabs-beta/turnstyl for more instructions on how to do this'
      );
    }
  }
}

export { configInitializer };
