'use strict';

const { validateRequired } = require('./validator.js');
const { AutoKeyError } = require('./errors.js');

const PROVIDERS = Object.freeze({
  openai: ['OPENAI_API_KEY'],
  gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
  nvidia: ['NVIDIA_API_KEY'],
});

function createConfig(options = {}) {
  const env = options.env ?? process.env;
  if (!env || typeof env !== 'object') {
    throw new AutoKeyError('Option "env" must be an environment-like object.');
  }

  validateRequired(options.required ?? [], env);

  return Object.freeze({
    get(name) {
      assertName(name);
      return env[name];
    },
    has(name) {
      assertName(name);
      const value = env[name];
      return typeof value === 'string' && value.trim() !== '';
    },
    detectProviders() {
      return Object.fromEntries(
        Object.entries(PROVIDERS).map(([provider, names]) => [
          provider,
          names.some(
            (name) => typeof env[name] === 'string' && env[name].trim() !== '',
          ),
        ]),
      );
    },
  });
}

function assertName(name) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new AutoKeyError(
      'Environment variable name must be a non-empty string.',
    );
  }
}

module.exports = { createConfig, PROVIDERS };
