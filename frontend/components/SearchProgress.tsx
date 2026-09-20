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
      {/* HackOdyssey Double Ring Radar Loader */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffd700] border-r-[#f39c12]/50 border-b-[#ffd700]/20 animate-spin" style={{ animationDuration: "1.2s" }} />
        {/* Inner Ring */}
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-[#ffe8a3] border-l-[#f39c12] animate-spin" style={{ animationDuration: "0.9s", animationDirection: "reverse" }} />
        
        {/* Center Golden Crest */}
        <div className="relative w-14 h-14 rounded-full bg-[#120c07] border border-[#ffd700]/50 flex items-center justify-center text-[#ffd700] shadow-[0_0_20px_rgba(243,156,18,0.4)]">
          {React.createElement(steps[currentStepIndex].icon, { className: "w-7 h-7 text-[#ffd700]" })}
        </div>
      </div>

      <h3 className="text-xl font-heading font-bold text-white tracking-wide bg-gradient-to-r from-white via-[#ffd700] to-[#f39c12] bg-clip-text text-transparent">
        {steps[currentStepIndex].title}
      </h3>
      <p className="text-xs sm:text-sm text-[#a89680] font-body mt-2">
        {steps[currentStepIndex].desc}
      </p>

      {/* Steps List */}
      <div className="w-full mt-10 space-y-3 max-w-xs">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.title}
              className={`flex items-center gap-3 text-xs p-2.5 rounded-none font-heading tracking-wide transition-colors ${
                isCurrent
                  ? "bg-[#1c130b] border border-[#ffd700]/40 text-[#ffd700]"
                  : isDone
                  ? "text-[#ffd700]/70"
                  : "text-[#5e4c3a]"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isCurrent
                    ? "bg-[#ffd700] animate-ping"
                    : isDone
                    ? "bg-[#f39c12]"
                    : "bg-[#332114]"
                }`}
              />
              <span className="font-semibold">{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
