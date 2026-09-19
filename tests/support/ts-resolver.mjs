/**
 * Node's ESM resolver needs an explicit file extension, but the worker sources use
 * bundler-style extensionless relative imports ('./retention-cleanup'). This hook
 * retries those specifiers with a '.ts' (or '/index.ts') suffix so tests can import
 * worker modules directly under `node --experimental-strip-types`.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CANDIDATE_SUFFIXES = ['.ts', '.tsx', '/index.ts'];

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
    for (const suffix of CANDIDATE_SUFFIXES) {
      const candidate = new URL(specifier + suffix, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return nextResolve(specifier + suffix, context);
      }
    }
  }

  return nextResolve(specifier, context);
}
