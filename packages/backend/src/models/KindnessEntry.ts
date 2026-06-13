import { Schema, model } from 'mongoose';

const KindnessEntrySchema = new Schema(
  {
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    beneficiary: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['Kind Words', 'Showing Gratitude', 'Helping Hand', 'Other'],
      required: true,
    },
    pointsAwarded: { type: Number, required: true, min: 5, max: 100 },
    description: { type: String, required: true, maxlength: 200 },
    timestamp: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

// ERD Section 3: Performance Indexes
KindnessEntrySchema.index({ submittedBy: 1, timestamp: -1 });
KindnessEntrySchema.index({ beneficiary: 1, timestamp: -1 });
KindnessEntrySchema.index({ timestamp: -1 });

export const KindnessEntryModel = model('KindnessEntry', KindnessEntrySchema);
