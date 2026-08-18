"use client";

interface NavigationProps {
  step: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
}

export default function Navigation({
  step,
  totalSteps,
  onPrevious,
  onNext,
  isSubmitting = false,
}: NavigationProps) {
  const isLastStep = step === totalSteps;

  return (
    <div className="mt-10 flex items-center justify-between border-t border-[#D4AF37]/10 pt-8">
      <button
        type="button"
        onClick={onPrevious}
        disabled={step === 1 || isSubmitting}
        className="rounded-full border border-[#D4AF37] px-8 py-3 font-medium text-[#D4AF37] transition hover:bg-[#D4AF37]/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <div className="text-sm tracking-widest text-[#888]">
        Step {step} of {totalSteps}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="rounded-full bg-[#D4AF37] px-8 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Submitting..."
          : isLastStep
          ? "Submit Consultation"
          : "Continue"}
      </button>
    </div>
  );
}