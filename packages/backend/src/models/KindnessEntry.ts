import { Schema, model } from 'mongoose';
import {
  KINDNESS_CATEGORIES,
  DESCRIPTION_MAX_LENGTH,
  MIN_POSSIBLE_POINTS,
  MAX_POSSIBLE_POINTS,
} from '@family-kindness/shared';

const KindnessEntrySchema = new Schema(
  {
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    beneficiary: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: [...KINDNESS_CATEGORIES],
      required: true,
    },
    pointsAwarded: {
      type: Number,
      required: true,
      min: MIN_POSSIBLE_POINTS,
      max: MAX_POSSIBLE_POINTS,
    },
    description: { type: String, required: true, maxlength: DESCRIPTION_MAX_LENGTH },
    timestamp: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

// ERD Section 3: Performance Indexes
KindnessEntrySchema.index({ submittedBy: 1, timestamp: -1 });
KindnessEntrySchema.index({ beneficiary: 1, timestamp: -1 });
KindnessEntrySchema.index({ timestamp: -1 });

export const KindnessEntryModel = model('KindnessEntry', KindnessEntrySchema);
