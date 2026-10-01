"use client";

interface ProgressBarProps {
  step: number;
  steps: string[];
}

export default function ProgressBar({
  step,
  steps,
}: ProgressBarProps) {
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-12">

      <div className="mb-6 flex items-center justify-between">

        {steps.map((title, index) => {
          const current = index + 1;

          return (
            <div
              key={title}
              className="flex flex-1 flex-col items-center"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold transition-all ${
                  current < step
                    ? "border-[#F26A21] bg-[#F26A21] text-black"
                    : current === step
                    ? "border-[#F26A21] bg-[#1A1A1A] text-[#F26A21]"
                    : "border-[#444] bg-[#111] text-[#777]"
                }`}
              >
                {current}
              </div>

              <span
                className={`mt-3 text-center text-xs uppercase tracking-[0.15em] ${
                  current <= step
                    ? "text-[#F26A21]"
                    : "text-[#666]"
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#222]">

        <div
          className="h-full rounded-full bg-[#F26A21] transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

    </div>
  );
}