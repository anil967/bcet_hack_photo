import React, { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface LoadingProgressProps {
  onComplete: () => void;
}

const STEPS = [
  'Verifying registration ID',
  'Analyzing your selfie',
  'Searching event photos',
  'Preparing your gallery',
];

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Step 0 -> 1 after 700ms
    const timer1 = setTimeout(() => {
      setCurrentStepIndex(1);
    }, 700);

    // Step 1 -> 2 after 1600ms
    const timer2 = setTimeout(() => {
      setCurrentStepIndex(2);
    }, 1600);

    // Step 2 -> 3 after 2600ms
    const timer3 = setTimeout(() => {
      setCurrentStepIndex(3);
    }, 2600);

    // Complete after 3400ms
    const timer4 = setTimeout(() => {
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / STEPS.length) * 100));

  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* Animated pulsing icon ring */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative z-10 shadow-lg shadow-indigo-500/10">
          <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
        </div>
        {/* Subtle breathing glow */}
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl -z-1 animate-pulse" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
        Finding your photos...
      </h3>
      <p className="text-sm text-slate-400 mb-8 max-w-xs leading-relaxed">
        Scanning through the official event collection to match moments where you appear.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-[#151926] h-1.5 rounded-full overflow-hidden mb-8 border border-white/[0.05]">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Sequential status checklist */}
      <div className="w-full max-w-xs space-y-3 text-left">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 text-xs sm:text-sm py-1.5 px-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-white/[0.06] border border-white/10 text-white font-medium'
                  : isDone
                  ? 'text-slate-400'
                  : 'text-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-colors shrink-0 ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isCurrent
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-white/[0.03] text-slate-600 border border-white/[0.06]'
                }`}
              >
                {isDone ? (
                  <Check className="w-3 h-3" />
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span className={`truncate ${isCurrent ? 'text-white' : ''}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
