# AutoKey (`autokey-env`)

A lightweight Node.js utility for loading `.env` files, validating required environment variables, and accessing configuration through a small API. AutoKey does not generate API keys, verify them with providers, or make network requests.

## Requirements

Node.js 20.19.0 or newer is the proposed minimum. Verify this range in CI before publishing a stable release.

## Install

```bash
npm install autokey-env
```

## Quick start (CommonJS)

```js
const { autoKey } = require('autokey-env');

const config = autoKey({ required: ['OPENAI_API_KEY'] });
const apiKey = config.get('OPENAI_API_KEY');

console.log('Configuration loaded');
```

## ES modules

```js
import { autoKey } from 'autokey-env';

const config = autoKey({ required: ['OPENAI_API_KEY'] });
console.log(`OpenAI key configured: ${config.has('OPENAI_API_KEY')}`);
```

## API

`autoKey(options?)` synchronously loads configuration and validates required variables. It returns a configuration object.

| Option        | Type                                  | Default       | Description                                                                                   |
| ------------- | ------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `envPath`     | `string`                              | `<cwd>/.env`  | Path to the environment file                                                                  |
| `required`    | `string[]`                            | `[]`          | Required variable names; absent, empty, and whitespace-only values fail validation            |
| `missingFile` | `'ignore' \| 'error'`                 | `'ignore'`    | How to handle a missing `.env` file                                                           |
| `override`    | `boolean`                             | `false`       | Allow `.env` values to replace existing environment variables                                 |
| `env`         | `Record<string, string \| undefined>` | `process.env` | Optional object for reading and validating values; `.env` loading still targets `process.env` |

Methods:

- `config.get(name)` returns the value or `undefined`.
- `config.has(name)` returns `true` only for a non-empty, non-whitespace value.
- `config.detectProviders()` returns booleans for `openai`, `gemini`, and `nvidia`; it never returns secrets.

Supported detection names are `OPENAI_API_KEY`, `GEMINI_API_KEY` or `GOOGLE_API_KEY`, and `NVIDIA_API_KEY`. Detection does not validate a key or prove account access.

Errors include `AutoKeyError` and `MissingConfigurationError`. Missing-variable errors list names only, never values.

## Local setup

```bash
cp .env.example .env
# Edit .env locally and provide your own values.
node examples/basic.js
```

## Security

- Never commit `.env` files or real credentials.
- Environment variables are not encrypted merely because they are stored in `.env`.
- Do not expose server-side secrets to browser bundles or client responses.
- AutoKey does not send keys to external services and has no telemetry.
- Avoid logging values returned by `get()`.

## Development

```bash
npm install
npm test
npm run lint
npm run format:check
```

## Publishing checklist

Check package-name availability and policy constraints before publishing:

```bash
npm view autokey-env name
npm pack --dry-run
npm login
npm publish
```

`npm view` errors may indicate that no public package exists under that name, but publishing availability is ultimately confirmed by the registry when you publish. Inspect the `npm pack --dry-run` file list and ensure no `.env` file is included. Do not publish until tests, lint, documentation, and package contents have been reviewed.

## Contributing

Open an issue to discuss bugs or proposed changes, add isolated tests, run the development checks, and submit a pull request. Do not include real secrets in issues, tests, or commits.

## License

MIT. See [LICENSE](LICENSE).
