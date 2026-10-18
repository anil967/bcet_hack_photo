"use client";

import React, { useState, useEffect } from "react";
import { ScanFace, Check, Loader2, ShieldCheck, Compass } from "lucide-react";

export function SearchProgress() {
  const steps = [
    { title: "Analyzing selfie", desc: "Looking at your photo" },
    { title: "Searching event photos", desc: "Finding matching moments" },
    { title: "Selecting your photos", desc: "Picking out your best shots" },
    { title: "Preparing your gallery", desc: "Organizing your moments" },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 850);
    const elapsedTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(stepTimer);
      clearInterval(elapsedTimer);
    };
  }, [steps.length]);

  return (
    <div className="w-full h-full flex-1 flex flex-col items-center justify-between py-3 sm:py-5 px-3 sm:px-4 max-w-sm sm:max-w-md mx-auto select-none overflow-hidden">
      {/* Top Header Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium tracking-wide rounded-full shadow-sm flex-shrink-0">
        <Compass className="w-3.5 h-3.5 text-neutral-400" />
        <span>The Odyssey Hackathon 2K26</span>
      </div>

      {/* Center Biometric Scanner & Title */}
      <div className="w-full flex flex-col items-center text-center my-auto py-2">
        {/* Sleek Biometric Radar Scanner */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-4 sm:mb-5">
          {/* Subtle Outer Spinner Ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500/30 animate-spin"
            style={{ animationDuration: "1.2s" }}
          />
          {/* Inner Counter-Rotating Ring */}
          <div
            className="absolute inset-2.5 rounded-full border border-dashed border-neutral-700 animate-spin"
            style={{ animationDuration: "3s", animationDirection: "reverse" }}
          />

          {/* Center Scanner Medallion */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-neutral-950 border border-neutral-700 flex items-center justify-center shadow-2xl">
            <img
              src="/odyssey_shutter.png"
              alt="Scanning"
              className="w-full h-full object-cover animate-pulse"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          Searching Event Photos
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-sm leading-relaxed px-2">
          {elapsed > 5
            ? "Almost there, preparing your gallery..."
            : "Finding all your moments from the event..."}
        </p>

        {/* Structured Progress Card */}
        <div className="w-full max-w-sm sm:max-w-md mt-5 sm:mt-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 shadow-xl text-left">
          {steps.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.title}
                className={`flex items-center gap-3.5 p-2.5 sm:p-3 rounded-xl transition-all duration-200 ${
                  isCurrent
                    ? "bg-neutral-800/90 border border-neutral-700 shadow-sm"
                    : isDone
                    ? "bg-transparent text-neutral-300"
                    : "opacity-35"
                }`}
              >
                {/* Status Indicator Icon */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                    isDone
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
                      : isCurrent
                      ? "bg-amber-950/80 text-amber-400 border border-amber-700/80"
                      : "bg-neutral-800 text-neutral-500 border border-neutral-700/50"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-neutral-600" />
                  )}
                </div>

                {/* Text Description */}
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs sm:text-sm font-semibold leading-tight truncate ${
                      isCurrent
                        ? "text-white"
                        : isDone
                        ? "text-neutral-200"
                        : "text-neutral-400"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-400 leading-tight truncate mt-0.5">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy Guarantee Footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 py-2 sm:py-3 flex-shrink-0">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>Private & secure • Your selfie is never saved</span>
      </div>
    </div>
  );
}
