/**
 * Business logic constants shared across the monorepo.
 *
 * These values define the deterministic rules from the
 * Product Architecture specification (Section 5).
 */

import type { PointsCategory } from './types.js';

// ── Points Matrix ────────────────────────────────────────────
// Deterministic point values bound to each category on submission.
// The "Other" category accepts a client-selected integer override
// and is intentionally excluded from this fixed mapping.

export const POINTS_MATRIX: Record<Exclude<PointsCategory, 'Other'>, number> = {
  'Kind Words': 10,
  'Showing Gratitude': 15,
  'Helping Hand': 20,
} as const;

// ── Meter Configuration ──────────────────────────────────────
// The fixed threshold defining a "full meter" cycle.

export const METER_THRESHOLD = 1000;

// ── Other Category Point Options ─────────────────────────────
// The allowed integer override values for the "Other" category.

export const OTHER_POINT_OPTIONS = [5, 10, 15, 20] as const;

// ── Description Constraints ──────────────────────────────────
// Max character length for kindness log descriptions.

export const DESCRIPTION_MAX_LENGTH = 200;
