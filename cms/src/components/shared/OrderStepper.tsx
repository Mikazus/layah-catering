import React from "react";

interface OrderStepperProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { num: "01", label: "Katalog" },
  { num: "02", label: "Pemesanan" },
  { num: "03", label: "Selesai" },
] as const;

export function OrderStepper({ currentStep }: OrderStepperProps) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5 py-6 text-xs sm:text-sm">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isDone = stepNumber < currentStep;

        return (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-medium ${
                  isActive
                    ? "text-[#18352B]"
                    : isDone
                    ? "text-[#18352B]/70"
                    : "text-[#18352B]/45"
                }`}
              >
                {step.num}
              </span>
              <span
                className={`${
                  isActive
                    ? "font-semibold text-[#18352B]"
                    : isDone
                    ? "text-[#18352B]/75"
                    : "text-[#18352B]/45"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={`h-px w-6 sm:w-10 ${
                  stepNumber < currentStep
                    ? "bg-[#18352B]"
                    : "bg-[#18352B]/30"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
