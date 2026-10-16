'use strict';

const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { AutoKeyError } = require('./errors.js');

function loadEnvironment(options = {}) {
  const envPath = path.resolve(
    options.envPath ?? path.join(process.cwd(), '.env'),
  );
  const missingFile = options.missingFile ?? 'ignore';

  if (!['ignore', 'error'].includes(missingFile)) {
    throw new AutoKeyError('Option "missingFile" must be "ignore" or "error".');
  }

  if (!fs.existsSync(envPath)) {
    if (missingFile === 'error') {
      throw new AutoKeyError(`Environment file not found: ${envPath}`);
    }
    return { path: envPath, loaded: false };
  }

  let result;
  try {
    result = dotenv.config({
      path: envPath,
      override: options.override ?? false,
      quiet: true,
    });
  } catch (cause) {
    throw new AutoKeyError(`Unable to load environment file: ${envPath}`, {
      cause,
    });
  }

  if (result.error) {
    throw new AutoKeyError(`Unable to load environment file: ${envPath}`, {
      cause: result.error,
    });
  }

  return { path: envPath, loaded: true };
}

module.exports = { loadEnvironment };
