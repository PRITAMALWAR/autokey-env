export interface AutoKeyOptions {
  /** Path to the .env file. Defaults to <cwd>/.env. */
  envPath?: string;
  /** Required variable names; missing or whitespace-only values cause an error. */
  required?: string[];
  /** How to handle a missing .env file. Defaults to "ignore". */
  missingFile?: 'ignore' | 'error';
  /** Whether values from .env may overwrite existing environment variables. Defaults to false. */
  override?: boolean;
  /** Optional environment-like object for reading and validation. Defaults to process.env. */
  env?: Record<string, string | undefined>;
}

export interface AutoKeyConfig {
  /** Returns a configured value, or undefined if absent. */
  get(name: string): string | undefined;
  /** True when the variable exists and is not empty or whitespace-only. */
  has(name: string): boolean;
  /** Reports whether supported provider key variables are configured; never returns key values. */
  detectProviders(): { openai: boolean; gemini: boolean; nvidia: boolean };
}

export class AutoKeyError extends Error {}
export class MissingConfigurationError extends AutoKeyError {
  missing: string[];
}
export function autoKey(options?: AutoKeyOptions): AutoKeyConfig;
export default autoKey;
