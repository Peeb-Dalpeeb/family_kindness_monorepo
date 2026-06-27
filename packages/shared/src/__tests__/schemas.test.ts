import { describe, it, expect } from 'vitest';
import { KindnessEntryRefinedSchema, AdminPinSchema } from '../schemas.js';

const SUBMITTER_ID = '60d5ec493d8b4c2e6462b5d1';
const BENEFICIARY_ID = '60d5ec493d8b4c2e6462b5d2';

const validEntry = {
  submittedBy: SUBMITTER_ID,
  beneficiary: BENEFICIARY_ID,
  category: 'Kind Words' as const,
  pointsAwarded: 10,
  description: 'Said something nice.',
};

describe('KindnessEntryRefinedSchema', () => {
  it('accepts a valid entry', () => {
    const result = KindnessEntryRefinedSchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it('rejects when submittedBy equals beneficiary', () => {
    const result = KindnessEntryRefinedSchema.safeParse({
      ...validEntry,
      beneficiary: SUBMITTER_ID,
    });
    expect(result.success).toBe(false);
  });

  it.each([5, 10, 15, 20])('accepts %i points for the Other category', (points) => {
    const result = KindnessEntryRefinedSchema.safeParse({
      ...validEntry,
      category: 'Other',
      pointsAwarded: points,
    });
    expect(result.success).toBe(true);
  });

  it.each([12, 100])('rejects %i points for the Other category', (points) => {
    const result = KindnessEntryRefinedSchema.safeParse({
      ...validEntry,
      category: 'Other',
      pointsAwarded: points,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed ObjectId', () => {
    const result = KindnessEntryRefinedSchema.safeParse({
      ...validEntry,
      submittedBy: 'not-an-object-id',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a description longer than the max length', () => {
    const result = KindnessEntryRefinedSchema.safeParse({
      ...validEntry,
      description: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe('AdminPinSchema', () => {
  it('accepts an exactly-4-digit numeric string', () => {
    expect(AdminPinSchema.safeParse({ pin: '1234' }).success).toBe(true);
  });

  it('rejects a non-digit PIN', () => {
    expect(AdminPinSchema.safeParse({ pin: 'abcd' }).success).toBe(false);
  });

  it('rejects a PIN of the wrong length', () => {
    expect(AdminPinSchema.safeParse({ pin: '123' }).success).toBe(false);
    expect(AdminPinSchema.safeParse({ pin: '12345' }).success).toBe(false);
  });
});
