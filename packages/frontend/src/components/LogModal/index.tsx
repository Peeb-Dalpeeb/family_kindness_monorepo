import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, HeartHandshake } from 'lucide-react';
import {
  FamilyMember,
  PointsCategory,
  DESCRIPTION_MAX_LENGTH,
  resolvePoints,
} from '@family-kindness/shared';
import { MemberPicker } from './MemberPicker';
import { KindnessCategoryPicker } from './KindnessCategoryPicker';
import { CustomPointsPicker } from './CustomPointsPicker';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: {
    submittedBy: string;
    beneficiary: string;
    category: PointsCategory;
    pointsAwarded: number;
    description: string;
  }) => void;
  familyMembers: FamilyMember[];
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, onSubmit, familyMembers }) => {
  // Input State
  const [submittedBy, setSubmittedBy] = useState<string>('');
  const [beneficiary, setBeneficiary] = useState<string>('');
  const [category, setCategory] = useState<PointsCategory | ''>('');
  const [customPoints, setCustomPoints] = useState<number>(5);
  const [description, setDescription] = useState<string>('');

  // Inline Validation Prompts
  const [validationError, setValidationError] = useState<{
    submittedBy?: string;
    beneficiary?: string;
    category?: string;
    description?: string;
  }>({});

  // Reset fields on open or close
  useEffect(() => {
    if (isOpen) {
      setSubmittedBy('');
      setBeneficiary('');
      setCategory('');
      setCustomPoints(5);
      setDescription('');
      setValidationError({});
    }
  }, [isOpen]);

  // Filter Beneficiary options to exclude the Submitter
  const filteredBeneficiaries = familyMembers.filter((member) => member.id !== submittedBy);

  // If submitter changes and becomes equal to beneficiary, reset beneficiary
  useEffect(() => {
    if (submittedBy && beneficiary === submittedBy) {
      setBeneficiary('');
    }
  }, [submittedBy, beneficiary]);

  // Real-time evaluation checks
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);

    if (val.length > DESCRIPTION_MAX_LENGTH) {
      setValidationError((prev) => ({
        ...prev,
        description: `Exceeded maximum length of ${String(DESCRIPTION_MAX_LENGTH)} characters.`,
      }));
    } else {
      setValidationError((prev) => {
        const copy = { ...prev };
        delete copy.description;
        return copy;
      });
    }
  };

  // Submission validation
  const handleFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errors: typeof validationError = {};

    if (!submittedBy) errors.submittedBy = 'Please select who performed this act.';
    if (!beneficiary) errors.beneficiary = 'Please select who this act was for.';
    if (!category) errors.category = 'Please select a kindness category.';
    if (!description.trim()) {
      errors.description = 'Please include a brief description of what happened.';
    } else if (description.length > DESCRIPTION_MAX_LENGTH) {
      errors.description = `Your description exceeds ${String(DESCRIPTION_MAX_LENGTH)} characters.`;
    }

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }

    // Determine target points based on selected category
    const finalPoints = resolvePoints(category as PointsCategory, customPoints);

    onSubmit({
      submittedBy,
      beneficiary,
      category: category as PointsCategory,
      pointsAwarded: finalPoints,
      description: description.trim(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-xs"
      >
        <motion.div
          id="modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-canvas border-muted-espresso/15 relative my-8 w-full max-w-2xl overflow-hidden rounded-3xl border shadow-xl"
        >
          {/* Header */}
          <div className="border-muted-espresso/10 bg-surface/40 flex items-center justify-between border-b px-6 py-5">
            <div className="flex items-center gap-2.5">
              <div className="bg-kindness/10 text-kindness rounded-xl p-2">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-primary-espresso text-lg leading-tight font-bold">
                  Log a New Act of Kindness
                </h3>
                <p className="text-muted-espresso mt-0.5 text-xs">
                  Input details of positive actions to fill your family meter.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="hover:bg-muted-espresso/10 text-muted-espresso hover:text-primary-espresso rounded-xl p-1.5 transition-all"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="max-h-[80vh] scrollbar-thin space-y-6 overflow-y-auto p-6"
          >
            {/* Identity Picker 1: Submitted By */}
            <MemberPicker
              label="Who performed this act? (Submitter)"
              members={familyMembers}
              selectedId={submittedBy}
              onSelect={(id) => {
                setSubmittedBy(id);
                setValidationError((prev) => ({ ...prev, submittedBy: undefined }));
              }}
              error={validationError.submittedBy}
            />

            {/* Identity Picker 2: Beneficiary */}
            <MemberPicker
              label="Who was this act for? (Beneficiary)"
              members={filteredBeneficiaries}
              selectedId={beneficiary}
              onSelect={(id) => {
                setBeneficiary(id);
                setValidationError((prev) => ({ ...prev, beneficiary: undefined }));
              }}
              error={validationError.beneficiary}
              gridCols="grid-cols-3 sm:grid-cols-5"
              placeholder={
                !submittedBy
                  ? 'Select a submitter above first to choose the beneficiary.'
                  : undefined
              }
            />

            {/* Category Selector */}
            <div className="space-y-2">
              <KindnessCategoryPicker
                selectedCategory={category}
                onSelect={(cat) => {
                  setCategory(cat);
                  setValidationError((prev) => ({ ...prev, category: undefined }));
                }}
                error={validationError.category}
              />

              {/* Conditional "Other" custom points selector */}
              {category === 'Other' && (
                <CustomPointsPicker selectedPoints={customPoints} onSelect={setCustomPoints} />
              )}
            </div>

            {/* Description Textarea Box */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label className="text-primary-espresso text-sm font-semibold">
                  What did they do? (Description)
                </label>
                {validationError.description && (
                  <span className="text-amber-success flex items-center gap-1 text-xs font-medium">
                    <AlertCircle className="h-3.5 w-3.5" /> {validationError.description}
                  </span>
                )}
              </div>

              <textarea
                value={description}
                onChange={handleDescriptionChange}
                maxLength={DESCRIPTION_MAX_LENGTH + 20}
                placeholder="Leo helped Grandma pack some cookies or Grandpa told Mom how much he loves dinner..."
                rows={3}
                className={`bg-surface/10 w-full rounded-2xl border p-3 text-sm transition-all focus:ring-1 focus:outline-none ${
                  validationError.description
                    ? 'border-amber-success focus:border-amber-success focus:ring-amber-success'
                    : 'border-muted-espresso/15 focus:border-kindness focus:ring-kindness'
                }`}
              />

              {/* Reactive Character Countdown Indicator */}
              <div className="flex items-center justify-between px-1 text-[11px]">
                <span className="text-muted-espresso">Keep details heartfelt but punchy.</span>
                <span
                  className={`font-mono font-semibold ${
                    description.length > DESCRIPTION_MAX_LENGTH
                      ? 'text-amber-success'
                      : 'text-muted-espresso'
                  }`}
                >
                  {description.length} / {DESCRIPTION_MAX_LENGTH} characters
                </span>
              </div>
            </div>

            {/* Error panel overview */}
            {Object.values(validationError).some(Boolean) && (
              <div className="bg-amber-bg border-amber-success/20 text-amber-success flex items-start gap-2.5 rounded-2xl border p-3.5">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold">Please review your entries:</h5>
                  <p className="text-amber-success/90 mt-0.5 text-[11px]">
                    Correct the highlighting issues above to log this transaction securely.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Actions Button Bar */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="border-muted-espresso/10 hover:bg-surface text-primary-espresso flex-1 cursor-pointer rounded-2xl border px-4 py-3 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-kindness hover:bg-kindness/90 flex flex-2 cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md"
              >
                <Sparkles className="h-4 w-4" />
                <span>Submit Kindness Logging</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
