import { Check } from 'lucide-react';
import { TimelineStep } from './types';

export interface OrderStepperProps {
  activeStep: number;
  steps: TimelineStep[];
  timelineNote?: string;
}

export function OrderStepper({ activeStep, steps, timelineNote }: OrderStepperProps) {
  return (
    <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1b1c1c]">Jejak Status Pesanan</h3>
        {timelineNote && (
          <p className="text-xs text-slate-500 mt-0.5">
            {timelineNote}
          </p>
        )}
      </div>

      {/* Step Progress Track */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
        {/* Connector line background */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute top-3.5 sm:top-4 left-[10%] right-[10%] h-1 bg-[#1e2a22] z-0"
        />
        {/* Connector line filled */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute top-3.5 sm:top-4 left-[10%] h-1 bg-[#16a34a] z-0 transition-all duration-300"
          style={{
            width: `${((Math.max(1, Math.min(5, activeStep)) - 1) / 4) * 80}%`,
          }}
        />

        {steps.map((item) => {
          const isCompleted = item.step <= activeStep;
          return (
            <div
              key={item.step}
              className="relative z-10 flex flex-col items-center text-center select-none p-1 pointer-events-none"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2 transition-all select-none ${
                  isCompleted
                    ? 'bg-[#16a34a] text-white shadow-xs'
                    : 'bg-[#1e2a22] text-transparent'
                }`}
              >
                {isCompleted && (
                  <Check className="w-4 h-4 stroke-3" aria-hidden="true" />
                )}
              </div>
              <p className="text-xs font-bold text-[#1b1c1c]">{item.title}</p>
              {item.desc ? (
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
