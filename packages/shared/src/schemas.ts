/**
 * Zod validation schemas for data ingestion.
 *
 * These schemas enforce the strict validation rules defined in
 * the ERD traceability matrix. They are consumed by both the
 * backend (request validation) and frontend (form validation).
 *
 * All magic numbers are imported from `./constants.js` so that
 * a single change there propagates to every validator and error
 * message automatically.
 */

import { z } from 'zod';
import {
  KINDNESS_CATEGORIES,
  OTHER_POINT_OPTIONS,
  DESCRIPTION_MAX_LENGTH,
  MIN_POSSIBLE_POINTS,
  MAX_POSSIBLE_POINTS,
} from './constants.js';

// ── Kindness Entry Ingestion Schema ──────────────────────────

/**
 * Validates incoming kindness log payloads.
 *
 * Matches the ERD traceability matrix:
 * - submittedBy/beneficiary: MongoDB ObjectId hex strings
 * - category: strict enum from KINDNESS_CATEGORIES
 * - pointsAwarded: integer within derived min/max bounds
 * - description: 1–DESCRIPTION_MAX_LENGTH character string
 */
export const KindnessEntrySchema = z.object({
  submittedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid 24-character ObjectId'),
  beneficiary: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid 24-character ObjectId'),
  category: z.enum(KINDNESS_CATEGORIES),
  pointsAwarded: z
    .number()
    .int()
    .min(MIN_POSSIBLE_POINTS, `Minimum points is ${String(MIN_POSSIBLE_POINTS)}`)
    .max(MAX_POSSIBLE_POINTS, `Maximum points is ${String(MAX_POSSIBLE_POINTS)}`),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(DESCRIPTION_MAX_LENGTH, `Maximum ${String(DESCRIPTION_MAX_LENGTH)} characters`),
});

export type KindnessEntryInput = z.infer<typeof KindnessEntrySchema>;

// ── Cross-Field Validation ───────────────────────────────────

/**
 * Refined schema that enforces the business rule:
 * "submittedBy must not equal beneficiary"
 *
 * This prevents a user from logging an act of kindness for themselves.
 */
export const KindnessEntryRefinedSchema = KindnessEntrySchema.refine(
  (data) => data.submittedBy !== data.beneficiary,
  {
    message: 'Submitter and beneficiary must be different family members',
    path: ['beneficiary'],
  },
).refine(
  (data) => {
    if (data.category === 'Other') {
      return (OTHER_POINT_OPTIONS as unknown as number[]).includes(data.pointsAwarded);
    }
    return true;
  },
  {
    message: `Points for "Other" category must be one of: ${OTHER_POINT_OPTIONS.join(', ')}`,
    path: ['pointsAwarded'],
  },
);

// ── Admin Authentication Schema ──────────────────────────────

/**
 * Validates the 4-digit PIN sent from the frontend login form.
 */
export const AdminPinSchema = z.object({
  pin: z
    .string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits'),
});

export type AdminPinInput = z.infer<typeof AdminPinSchema>;
