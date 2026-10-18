"use client";

import React, { useState, useEffect } from "react";
import { Compass, Sparkles, Search, Image as ImageIcon } from "lucide-react";

export function SearchProgress() {
  const steps = [
    { title: "Analyzing your selfie...", desc: "Detecting facial features and landmarks", icon: Compass },
    { title: "Extracting biometric signature...", desc: "Generating 128-dimensional ArcFace vector", icon: Sparkles },
    { title: "Searching event photographs...", desc: "Querying FAISS cosine similarity index", icon: Search },
    { title: "Preparing your gallery...", desc: "Retrieving matching Odyssey moments", icon: ImageIcon },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center">
      {/* Clean Modern Radar Loader without neon glow */}
      <div className="relative w-24 h-24 flex items-center justify-center mb-6">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-amber-600/40 animate-spin" style={{ animationDuration: "1s" }} />
        {/* Inner Ring */}
        <div className="absolute inset-2.5 rounded-full border-2 border-transparent border-b-neutral-400 border-l-neutral-600 animate-spin" style={{ animationDuration: "0.8s", animationDirection: "reverse" }} />
        
        {/* Center Icon */}
        <div className="relative w-12 h-12 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400 shadow-md">
          {React.createElement(steps[currentStepIndex].icon, { className: "w-6 h-6 text-amber-400" })}
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
        {steps[currentStepIndex].title}
      </h3>
      <p className="text-xs sm:text-sm text-neutral-400 mt-1">
        {steps[currentStepIndex].desc}
      </p>

      {/* Steps List */}
      <div className="w-full mt-8 space-y-2.5 max-w-xs">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.title}
              className={`flex items-center gap-3 text-xs p-2.5 rounded-lg border transition-colors ${
                isCurrent
                  ? "bg-neutral-900 border-amber-500/50 text-white font-medium"
                  : isDone
                  ? "border-neutral-800 text-neutral-300"
                  : "border-transparent text-neutral-500"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isCurrent
                    ? "bg-amber-400"
                    : isDone
                    ? "bg-emerald-400"
                    : "bg-neutral-700"
                }`}
              />
              <span>{step.title}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
