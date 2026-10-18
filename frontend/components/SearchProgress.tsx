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
    <div className="w-full h-full flex-1 flex flex-col items-center justify-between py-4 px-4 max-w-md mx-auto select-none overflow-hidden">
      {/* Top Header Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium tracking-wide rounded-full">
        <Compass className="w-3.5 h-3.5 text-neutral-400" />
        <span>The Odyssey Hackathon 2K26</span>
      </div>

      {/* Center Biometric Scanner & Title */}
      <div className="flex flex-col items-center text-center my-auto py-2">
        {/* Sleek Biometric Radar Scanner */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-5">
          {/* Subtle Outer Spinner Ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500/30 animate-spin"
            style={{ animationDuration: "1.2s" }}
          />
          {/* Inner Counter-Rotating Ring */}
          <div
            className="absolute inset-2 rounded-full border border-dashed border-neutral-700 animate-spin"
            style={{ animationDuration: "3s", animationDirection: "reverse" }}
          />

          {/* Center Scanner Medallion */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-neutral-950 border border-neutral-700 flex items-center justify-center shadow-lg">
            <img
              src="/odyssey_shutter.png"
              alt="Scanning"
              className="w-full h-full object-cover animate-pulse"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
          Searching Event Photos
        </h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
          {elapsed > 5
            ? "Almost there, preparing your gallery..."
            : "Finding all your moments from the event..."}
        </p>

        {/* Structured Progress Card */}
        <div className="w-full max-w-xs mt-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 p-3.5 space-y-2.5 shadow-sm text-left">
          {steps.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.title}
                className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-200 ${
                  isCurrent
                    ? "bg-neutral-800/80 border border-neutral-700"
                    : isDone
                    ? "bg-transparent text-neutral-300"
                    : "opacity-40"
                }`}
              >
                {/* Status Indicator Icon */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                    isDone
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
                      : isCurrent
                      ? "bg-amber-950/80 text-amber-400 border border-amber-700/80"
                      : "bg-neutral-800 text-neutral-500 border border-neutral-700/50"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                  )}
                </div>

                {/* Text Description */}
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-semibold leading-tight truncate ${
                      isCurrent
                        ? "text-white"
                        : isDone
                        ? "text-neutral-200"
                        : "text-neutral-400"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[10px] text-neutral-400 leading-tight truncate">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy Guarantee Footer */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 py-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span>Private & secure • Your selfie is never saved</span>
      </div>
    </div>
  );
}
