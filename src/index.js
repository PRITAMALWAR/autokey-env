'use strict';

const { loadEnvironment } = require('./loader.js');
const { createConfig } = require('./config.js');
const { AutoKeyError, MissingConfigurationError } = require('./errors.js');

function autoKey(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new AutoKeyError('AutoKey options must be an object.');
  }

  loadEnvironment(options);
  return createConfig(options);
}

module.exports = { autoKey, AutoKeyError, MissingConfigurationError };
