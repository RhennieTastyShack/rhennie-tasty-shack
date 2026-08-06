interface NavigationProps {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Navigation({
  step,
  totalSteps,
  onNext,
  onPrevious,
}: NavigationProps) {
  return (
    <div className="flex justify-between">

      <button
        onClick={onPrevious}
        disabled={step === 1}
        className="rounded-full border border-[#D4AF37] px-8 py-3 text-[#D4AF37] transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <button
        onClick={onNext}
        className="rounded-full bg-[#D4AF37] px-8 py-3 font-semibold text-black transition hover:opacity-90"
      >
        {step === totalSteps ? "Submit Consultation" : "Next"}
      </button>

    </div>
  );
}