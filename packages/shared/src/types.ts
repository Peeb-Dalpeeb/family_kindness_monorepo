/**
 * Core domain types for the Family Kindness Tracker.
 *
 * These interfaces define the shape of data flowing between
 * the frontend, backend API, and MongoDB persistence layer.
 */

// ── User / Family Member ─────────────────────────────────────

export type UserRole = 'admin' | 'standard';

export interface FamilyMember {
  /** Unique identifier — maps to MongoDB ObjectId string. */
  id: string;

  /** Display name shown across selection dropdowns. */
  name: string;

  /** Emoji avatar or URL for visual identity. */
  avatar: string;

  /** Hex color for individualized UI touches. */
  color: string;

  /** Authorization tier: admin (parents) or standard (children). */
  role: UserRole;
}

// ── Kindness Categories & Points ─────────────────────────────

export type PointsCategory = 'Kind Words' | 'Showing Gratitude' | 'Helping Hand' | 'Other';

// ── Kindness Log Entry ───────────────────────────────────────

export interface KindnessEntry {
  /** Unique identifier — maps to MongoDB ObjectId string. */
  id: string;

  /** Unix epoch milliseconds. Auto-generated on server insertion. */
  timestamp: number;

  /** FamilyMember ID of the person who submitted the log. */
  submittedBy: string;

  /** FamilyMember ID of the person who received the kindness. */
  beneficiary: string;

  /** Strict enum matching the Points Matrix. */
  category: PointsCategory;

  /** Integer points calculated on submission. */
  pointsAwarded: number;

  /** Free-text description. Strict 200-character maximum. */
  description: string;
}

// ── Dashboard Aggregation Metrics ────────────────────────────

export interface DashboardMetrics {
  /** Grand running total of all points ever earned. */
  totalPoints: number;

  /** Floor(totalPoints / 1000) — how many times the meter was filled. */
  completedMilestones: number;

  /** Remainder points since last 1,000-point milestone. */
  currentProgressPoints: number;

  /** Floor((currentProgressPoints / 1000) * 100) — 0% to 99%. */
  percentage: number;

  /** Total number of kindness log entries in the system. */
  totalLogs: number;
}

// ── Authentication ───────────────────────────────────────────

export interface AuthResponse {
  /** Whether authentication succeeded. */
  success: boolean;

  /** Human-readable status message. */
  message: string;
}
