'use strict';

const { MissingConfigurationError, AutoKeyError } = require('./errors.js');

function validateRequired(required = [], env = process.env) {
  if (
    !Array.isArray(required) ||
    required.some((name) => typeof name !== 'string' || name.trim() === '')
  ) {
    throw new AutoKeyError(
      'Option "required" must be an array of non-empty variable names.',
    );
  }

  const names = [...new Set(required.map((name) => name.trim()))];

  const missing = names.filter((name) => {
    const value = env[name];
    return typeof value !== 'string' || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new MissingConfigurationError(missing);
  }
}

module.exports = { validateRequired };
