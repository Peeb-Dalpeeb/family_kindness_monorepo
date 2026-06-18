import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, HeartHandshake } from 'lucide-react';
import { FamilyMember, PointsCategory, DESCRIPTION_MAX_LENGTH } from '@family-kindness/shared';

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

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  familyMembers,
}) => {
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
  const filteredBeneficiaries = familyMembers.filter(
    (member) => member.id !== submittedBy
  );

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
      setValidationError(prev => ({
        ...prev,
        description: 'Exceeded maximum length of 200 characters.'
      }));
    } else {
      setValidationError(prev => {
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
      errors.description = 'Your description exceeds 200 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }

    // Determine target points based on selected category
    let finalPoints = 10;
    if (category === 'Kind Words') finalPoints = 10;
    else if (category === 'Showing Gratitude') finalPoints = 15;
    else if (category === 'Helping Hand') finalPoints = 20;
    else if (category === 'Other') finalPoints = customPoints;

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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      >
        <motion.div
          id="modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-canvas rounded-3xl border border-muted-espresso/15 shadow-xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-muted-espresso/10 bg-surface/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-kindness/10 text-kindness rounded-xl">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary-espresso leading-tight">
                  Log a New Act of Kindness
                </h3>
                <p className="text-xs text-muted-espresso mt-0.5">
                  Input details of positive actions to fill your family meter.
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted-espresso/10 text-muted-espresso hover:text-primary-espresso rounded-xl transition-all"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin">
            
            {/* Identity Picker 1: Submitted By */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-semibold text-primary-espresso flex items-center gap-1.5">
                  <span>Who performed this act? (Submitter)</span>
                </label>
                {validationError.submittedBy && (
                  <span className="text-xs font-medium text-amber-success flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationError.submittedBy}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {familyMembers.map((member) => {
                  const isSelected = submittedBy === member.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setSubmittedBy(member.id);
                        setValidationError(prev => ({ ...prev, submittedBy: undefined }));
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-kindness bg-kindness/5 scale-102 ring-1 ring-kindness/30'
                          : 'border-muted-espresso/10 hover:border-muted-espresso/20 bg-surface/25'
                      }`}
                    >
                      {member.avatar && (member.avatar.includes('.') || member.avatar.startsWith('/')) ? (
                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover mb-1 select-none" />
                      ) : (
                        <span className="text-2xl mb-1">{member.avatar}</span>
                      )}
                      <span className="text-xs font-semibold text-primary-espresso truncate w-full">
                        {member.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Identity Picker 2: Beneficiary */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-semibold text-primary-espresso flex items-center gap-1.5">
                  <span>Who was this act for? (Beneficiary)</span>
                </label>
                {validationError.beneficiary && (
                  <span className="text-xs font-medium text-amber-success flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationError.beneficiary}
                  </span>
                )}
              </div>

              {!submittedBy ? (
                <div className="border border-dashed border-muted-espresso/15 rounded-2xl p-4 text-center text-xs text-muted-espresso bg-surface/20">
                  Select a submitter above first to choose the beneficiary.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {filteredBeneficiaries.map((member) => {
                    const isSelected = beneficiary === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setBeneficiary(member.id);
                          setValidationError(prev => ({ ...prev, beneficiary: undefined }));
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-kindness bg-kindness/5 scale-102 ring-1 ring-kindness/30'
                            : 'border-muted-espresso/10 hover:border-muted-espresso/20 bg-surface/25'
                        }`}
                      >
                        {member.avatar && (member.avatar.includes('.') || member.avatar.startsWith('/')) ? (
                          <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover mb-1 select-none" />
                        ) : (
                          <span className="text-2xl mb-1">{member.avatar}</span>
                        )}
                        <span className="text-xs font-semibold text-primary-espresso truncate w-full">
                          {member.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category Selector Grid of Pills */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-semibold text-primary-espresso">
                  What kind of kindness is this?
                </label>
                {validationError.category && (
                  <span className="text-xs font-medium text-amber-success flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationError.category}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { cat: 'Kind Words' as const, pts: 10, label: '💬 Kind Words', desc: 'Compliment or support' },
                  { cat: 'Showing Gratitude' as const, pts: 15, label: '🙏 Gratitude', desc: 'Appreciation gesture' },
                  { cat: 'Helping Hand' as const, pts: 20, label: '🤝 Helping Hand', desc: 'Household chore or aid' },
                  { cat: 'Other' as const, pts: null, label: '✨ Other Option', desc: 'Customizable points' },
                ].map((item) => {
                  const isSelected = category === item.cat;
                  return (
                    <button
                      key={item.cat}
                      type="button"
                      onClick={() => {
                        setCategory(item.cat);
                        setValidationError(prev => ({ ...prev, category: undefined }));
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-kindness bg-kindness/5 ring-1 ring-kindness/30'
                          : 'border-muted-espresso/10 hover:border-muted-espresso/20 bg-surface/25'
                      }`}
                    >
                      <span className="text-sm font-bold text-primary-espresso">{item.label}</span>
                      <span className="text-xs text-muted-espresso mt-0.5 leading-tight">{item.desc}</span>
                      <span className="text-xs font-mono font-bold mt-2 text-kindness bg-kindness-light/40 px-2 py-0.5 rounded-md">
                        {item.pts !== null ? `+${String(item.pts)} Pts` : 'Custom Pts'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Conditional "Other" custom points selector */}
              {category === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-surface/50 border border-muted-espresso/10 p-4 rounded-2xl space-y-2 mt-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-primary-espresso">Select Custom Points Value:</span>
                    <span className="text-xs font-mono font-bold text-kindness bg-kindness/10 px-2.5 py-1 rounded-lg">
                      +{String(customPoints)} Points
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((val) => {
                      const isActive = customPoints === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => { setCustomPoints(val); }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                            isActive
                              ? 'bg-kindness text-white'
                              : 'bg-canvas text-primary-espresso border border-muted-espresso/10 hover:bg-surface'
                          }`}
                        >
                          +{val} Pts
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Description Textarea Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-semibold text-primary-espresso">
                  What did they do? (Description)
                </label>
                {validationError.description && (
                  <span className="text-xs font-medium text-amber-success flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {validationError.description}
                  </span>
                )}
              </div>

              <textarea
                value={description}
                onChange={handleDescriptionChange}
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder="Leo helped Grandma pack some cookies or Grandpa told Mom how much he loves dinner..."
                rows={3}
                className={`w-full p-3 rounded-2xl text-sm border bg-surface/10 focus:outline-none focus:ring-1 transition-all ${
                  validationError.description
                    ? 'border-amber-success focus:border-amber-success focus:ring-amber-success'
                    : 'border-muted-espresso/15 focus:border-kindness focus:ring-kindness'
                }`}
              />

              {/* Reactive Character Countdown Indicator */}
              <div className="flex justify-between items-center text-[11px] px-1">
                <span className="text-muted-espresso">
                  Keep details heartfelt but punchy.
                </span>
                <span 
                  className={`font-mono font-semibold ${
                    description.length > DESCRIPTION_MAX_LENGTH
                      ? 'text-amber-success' 
                      : 'text-muted-espresso'
                  }`}
                >
                  {description.length} / 200 characters
                </span>
              </div>
            </div>

            {/* Error panel overview */}
            {Object.values(validationError).some(Boolean) && (
              <div className="p-3.5 bg-amber-bg border border-amber-success/20 rounded-2xl flex items-start gap-2.5 text-amber-success">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-xs">Please review your entries:</h5>
                  <p className="text-[11px] mt-0.5 text-amber-success/90">
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
                className="flex-1 py-3 px-4 rounded-2xl text-xs font-semibold border border-muted-espresso/10 hover:bg-surface text-primary-espresso transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-2 py-3 px-4 rounded-2xl text-xs font-bold bg-kindness hover:bg-kindness/90 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Kindness Logging</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
