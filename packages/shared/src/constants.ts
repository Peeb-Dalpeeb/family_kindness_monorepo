/**
 * Business logic constants shared across the monorepo.
 *
 * These values define the deterministic rules from the
 * Product Architecture specification (Section 5).
 *
 * ⚠️  This file is the SINGLE SOURCE OF TRUTH for all
 * business-rule primitives. Backend models, Zod schemas,
 * and frontend components all derive from these exports.
 */

// ── Kindness Categories ──────────────────────────────────────
// Canonical ordered list of every category the system supports.
// Zod enums, Mongoose enums, and UI pickers all derive from this.

export const KINDNESS_CATEGORIES = [
  'Kind Words',
  'Showing Gratitude',
  'Helping Hand',
  'Other',
] as const;

/** Union type derived from the canonical category list. */
export type PointsCategory = (typeof KINDNESS_CATEGORIES)[number];

/** Categories that have a fixed (deterministic) point value. */
export type FixedPointsCategory = Exclude<PointsCategory, 'Other'>;

// ── Points Matrix ────────────────────────────────────────────
// Deterministic point values bound to each category on submission.
// The "Other" category accepts a client-selected integer override
// and is intentionally excluded from this fixed mapping.

export const POINTS_MATRIX: Record<FixedPointsCategory, number> = {
  'Kind Words': 10,
  'Showing Gratitude': 15,
  'Helping Hand': 20,
} as const;

// ── Category UI Metadata ─────────────────────────────────────
// Visual metadata for each category, consumed by frontend pickers.
// Adding a new category here automatically propagates to every UI.

export interface CategoryMeta {
  /** Emoji icon displayed in pickers and dropdowns. */
  icon: string;
  /** Short human-readable label. */
  label: string;
  /** One-line description shown beneath the label. */
  desc: string;
}

export const CATEGORY_METADATA: Record<PointsCategory, CategoryMeta> = {
  'Kind Words': { icon: '💬', label: 'Kind Words', desc: 'Compliment or support' },
  'Showing Gratitude': { icon: '🙏', label: 'Gratitude', desc: 'Appreciation gesture' },
  'Helping Hand': { icon: '🤝', label: 'Helping Hand', desc: 'Household chore or aid' },
  'Other': { icon: '✨', label: 'Other Option', desc: 'Customizable points' },
} as const;

// ── Other Category Point Options ─────────────────────────────
// The allowed integer override values for the "Other" category.

export const OTHER_POINT_OPTIONS = [5, 10, 15, 20] as const;

// ── Derived Point Bounds ─────────────────────────────────────
// Min/max across ALL categories (fixed + other). Used by
// Mongoose schema validators and Zod schemas.

const allPossiblePoints = [
  ...Object.values(POINTS_MATRIX),
  ...OTHER_POINT_OPTIONS,
];

export const MIN_POSSIBLE_POINTS = Math.min(...allPossiblePoints);
export const MAX_POSSIBLE_POINTS = Math.max(...allPossiblePoints);

// ── Meter Configuration ──────────────────────────────────────
// The fixed threshold defining a "full meter" cycle.

export const METER_THRESHOLD = 1000;

// ── Description Constraints ──────────────────────────────────
// Max character length for kindness log descriptions.

export const DESCRIPTION_MAX_LENGTH = 200;

// ── Point Resolution Utility ─────────────────────────────────
// Pure function that resolves the correct points for any category.
// Used by the backend (authoritative) and frontend (preview).

/**
 * Returns the deterministic point value for a given category.
 *
 * - Fixed categories → value from `POINTS_MATRIX`.
 * - "Other"          → `requestedPoints` pass-through.
 *
 * @throws if `requestedPoints` is omitted for the "Other" category.
 */
export function resolvePoints(
  category: PointsCategory,
  requestedPoints?: number,
): number {
  if (category === 'Other') {
    if (requestedPoints === undefined) {
      throw new Error('requestedPoints is required for the "Other" category');
    }
    return requestedPoints;
  }
  return POINTS_MATRIX[category];
}
