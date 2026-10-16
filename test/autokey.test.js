'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { autoKey, MissingConfigurationError } = require('../src/index.js');

function fixture(contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'autokey-test-'));
  const envPath = path.join(dir, '.env');
  if (contents !== undefined) {
    fs.writeFileSync(envPath, contents);
  }
  return {
    dir,
    envPath,
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}

function withEnv(changes, callback) {
  const previous = new Map();
  for (const [key, value] of Object.entries(changes)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  try {
    callback();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test('loads values from a valid .env file', () => {
  const f = fixture('AUTOKEY_TEST_VALUE=hello\n');
  withEnv({ AUTOKEY_TEST_VALUE: undefined }, () => {
    try {
      assert.equal(
        autoKey({ envPath: f.envPath }).get('AUTOKEY_TEST_VALUE'),
        'hello',
      );
    } finally {
      delete process.env.AUTOKEY_TEST_VALUE;
    }
  });
  f.cleanup();
});

test('ignores a missing file by default', () => {
  const f = fixture();
  assert.equal(autoKey({ envPath: f.envPath }).has('AUTOKEY_NEVER_SET'), false);
  f.cleanup();
});

test('errors when configured to require a missing file', () => {
  const f = fixture();
  assert.throws(
    () => autoKey({ envPath: f.envPath, missingFile: 'error' }),
    /Environment file not found/,
  );
  f.cleanup();
});

test('reads existing process environment variables', () => {
  withEnv({ AUTOKEY_EXISTING: 'from-shell' }, () => {
    assert.equal(
      autoKey({ missingFile: 'ignore' }).get('AUTOKEY_EXISTING'),
      'from-shell',
    );
  });
});

test('throws with missing required variable names only', () => {
  withEnv({ AUTOKEY_SECRET_TEST: undefined }, () => {
    assert.throws(
      () => autoKey({ required: ['AUTOKEY_SECRET_TEST'] }),
      (error) =>
        error instanceof MissingConfigurationError &&
        /AUTOKEY_SECRET_TEST/.test(error.message) &&
        !/secret-value/.test(error.message),
    );
  });
});

test('treats empty required values as missing', () => {
  assert.throws(
    () =>
      autoKey({ env: { EMPTY_REQUIRED: '  ' }, required: ['EMPTY_REQUIRED'] }),
    /EMPTY_REQUIRED/,
  );
});

test('does not overwrite existing values by default', () => {
  const f = fixture('AUTOKEY_OVERRIDE_TEST=from-file\n');
  withEnv({ AUTOKEY_OVERRIDE_TEST: 'from-shell' }, () => {
    try {
      assert.equal(
        autoKey({ envPath: f.envPath }).get('AUTOKEY_OVERRIDE_TEST'),
        'from-shell',
      );
    } finally {
      delete process.env.AUTOKEY_OVERRIDE_TEST;
    }
  });
  f.cleanup();
});

test('overwrites existing values only when explicitly requested', () => {
  const f = fixture('AUTOKEY_OVERRIDE_TEST=from-file\n');
  withEnv({ AUTOKEY_OVERRIDE_TEST: 'from-shell' }, () => {
    try {
      assert.equal(
        autoKey({ envPath: f.envPath, override: true }).get(
          'AUTOKEY_OVERRIDE_TEST',
        ),
        'from-file',
      );
    } finally {
      delete process.env.AUTOKEY_OVERRIDE_TEST;
    }
  });
  f.cleanup();
});

test('detects configured providers without returning values', () => {
  const config = autoKey({
    env: { OPENAI_API_KEY: 'secret', NVIDIA_API_KEY: 'another-secret' },
  });
  assert.deepEqual(config.detectProviders(), {
    openai: true,
    gemini: false,
    nvidia: true,
  });
  assert.equal(
    JSON.stringify(config.detectProviders()).includes('secret'),
    false,
  );
});

test('has returns false for empty values and get validates names', () => {
  const config = autoKey({ env: { EMPTY_VALUE: '' } });
  assert.equal(config.has('EMPTY_VALUE'), false);
  assert.throws(() => config.get(''), /non-empty string/);
});

test('CommonJS import exposes autoKey', () => {
  assert.equal(typeof require('../src/index.js').autoKey, 'function');
});

test('ES module import exposes autoKey', async () => {
  const module = await import('../src/index.mjs');
  assert.equal(typeof module.autoKey, 'function');
});
