"use client";

import React, { useState, useEffect } from "react";
import { ScanFace, Search, Sparkles, Image as ImageIcon } from "lucide-react";

export function SearchProgress() {
  const steps = [
    { title: "Analyzing your selfie...", desc: "Detecting facial features and landmarks", icon: ScanFace },
    { title: "Finding your face...", desc: "Extracting 128-dimensional biometric embedding", icon: Sparkles },
    { title: "Searching event photos...", desc: "Querying FAISS vector similarity index", icon: Search },
    { title: "Preparing your gallery...", desc: "Fetching matching high-resolution photographs", icon: ImageIcon },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Step through the actual analytical stages smoothly
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center">
      {/* Visual Pulsing Radar */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full bg-indigo-600/10 border border-indigo-500/20 animate-ping opacity-60" />
        <div className="absolute inset-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 animate-pulse" />
        <div className="relative w-16 h-16 rounded-full bg-zinc-900 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
          {React.createElement(steps[currentStepIndex].icon, { className: "w-8 h-8" })}
        </div>
      </div>

      {/* Current Step Title */}
      <h3 className="text-xl font-semibold text-zinc-100 tracking-tight transition-all duration-300">
        {steps[currentStepIndex].title}
      </h3>
      <p className="text-sm text-zinc-400 mt-2 transition-all duration-300">
        {steps[currentStepIndex].desc}
      </p>

      {/* Real Step Indicators */}
      <div className="w-full mt-10 space-y-3 max-w-xs">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.title}
              className={`flex items-center gap-3 text-xs p-2.5 rounded-lg transition-colors ${
                isCurrent
                  ? "bg-zinc-900 border border-indigo-500/30 text-zinc-200"
                  : isDone
                  ? "text-emerald-400/80"
                  : "text-zinc-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isCurrent
                    ? "bg-indigo-400 animate-pulse"
                    : isDone
                    ? "bg-emerald-500"
                    : "bg-zinc-700"
                }`}
              />
              <span className="font-medium">{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
