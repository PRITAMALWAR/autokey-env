'use strict';

class AutoKeyError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AutoKeyError';
  }
}

class MissingConfigurationError extends AutoKeyError {
  constructor(missing) {
    super(`Missing required environment variables: ${missing.join(', ')}`);
    this.name = 'MissingConfigurationError';
    this.missing = [...missing];
  }
}

module.exports = {
  AutoKeyError,
  MissingConfigurationError,
};
