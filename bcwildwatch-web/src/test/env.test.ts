import { describe, it, expect, afterEach } from 'vitest';
import { requireEnv } from '@/lib/env';

describe('requireEnv', () => {
  afterEach(() => {
    delete process.env.FOO_TEST;
    delete process.env.MISSING_TEST;
  });

  it('returns the value when set', () => {
    process.env.FOO_TEST = 'bar';
    expect(requireEnv('FOO_TEST')).toBe('bar');
  });
  it('throws a named error when missing', () => {
    delete process.env.MISSING_TEST;
    expect(() => requireEnv('MISSING_TEST')).toThrow(/MISSING_TEST/);
  });
});
