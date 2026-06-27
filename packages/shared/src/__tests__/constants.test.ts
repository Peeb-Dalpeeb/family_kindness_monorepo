import { describe, it, expect } from 'vitest';
import { resolvePoints } from '../constants.js';

describe('resolvePoints', () => {
  it('returns the fixed point value for each non-Other category', () => {
    // Asserted against literal values from the Points Matrix spec
    // (docs/ProductArchitecture.md §5), not against POINTS_MATRIX itself —
    // comparing against the same constant under test would let a wrong
    // value in the matrix pass silently.
    expect(resolvePoints('Kind Words')).toBe(10);
    expect(resolvePoints('Showing Gratitude')).toBe(15);
    expect(resolvePoints('Helping Hand')).toBe(20);
  });

  it('ignores a requestedPoints override for fixed categories', () => {
    expect(resolvePoints('Kind Words', 999)).toBe(10);
  });

  it('passes through requestedPoints for the Other category', () => {
    expect(resolvePoints('Other', 5)).toBe(5);
    expect(resolvePoints('Other', 20)).toBe(20);
  });

  it('throws when requestedPoints is omitted for the Other category', () => {
    expect(() => resolvePoints('Other')).toThrow(
      'requestedPoints is required for the "Other" category',
    );
  });
});
