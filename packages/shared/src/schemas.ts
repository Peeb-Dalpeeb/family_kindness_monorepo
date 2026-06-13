/**
 * Zod validation schemas for data ingestion.
 *
 * These schemas enforce the strict validation rules defined in
 * the ERD traceability matrix. They are consumed by both the
 * backend (request validation) and frontend (form validation).
 */

import { z } from 'zod';
import { OTHER_POINT_OPTIONS } from './constants.js';

// ── Category Enum ────────────────────────────────────────────

export const KINDNESS_CATEGORIES = [
  'Kind Words',
  'Showing Gratitude',
  'Helping Hand',
  'Other',
] as const;

// ── Kindness Entry Ingestion Schema ──────────────────────────

/**
 * Validates incoming kindness log payloads.
 *
 * Matches the ERD traceability matrix:
 * - submittedBy/beneficiary: MongoDB ObjectId hex strings
 * - category: strict enum from KINDNESS_CATEGORIES
 * - pointsAwarded: integer 5–100 (custom for 'Other', server-resolved for standard)
 * - description: 1–200 character string
 */
export const KindnessEntrySchema = z.object({
  submittedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid 24-character ObjectId'),
  beneficiary: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid 24-character ObjectId'),
  category: z.enum(KINDNESS_CATEGORIES),
  pointsAwarded: z.number().int().min(5).max(100),
  description: z.string().min(1, 'Description is required').max(200, 'Maximum 200 characters'),
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
    message: 'Points for "Other" category must be 5, 10, 15, or 20',
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
