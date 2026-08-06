interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  steps,
}: ProgressBarProps) {
  return (
    <div className="space-y-6">

      <div className="flex justify-between">

        {steps.map((step, index) => (

          <div
            key={step}
            className="flex flex-col items-center flex-1"
          >

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                currentStep > index
                  ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                  : "border-[#555] bg-[#171717] text-[#B8B8B8]"
              }`}
            >
              {index + 1}
            </div>

            <p
              className={`mt-3 text-center text-sm ${
                currentStep > index
                  ? "text-[#D4AF37]"
                  : "text-[#8F8F8F]"
              }`}
            >
              {step}
            </p>

          </div>

        ))}

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#222]">

        <div
          className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
          }}
        />

      </div>

    </div>
  );
}