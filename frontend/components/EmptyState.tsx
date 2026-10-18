"use client";

import React from "react";
import { SearchX, RotateCcw, Lightbulb, Sun, Camera, User, Glasses, HelpCircle, ShieldCheck } from "lucide-react";

interface EmptyStateProps {
  onRetry: () => void;
}

export function EmptyState({ onRetry }: EmptyStateProps) {
  const tips = [
    {
      icon: Sun,
      iconColor: "text-amber-400",
      title: "Good Lighting",
      description: "Ensure even, clear light on your face without harsh backlight",
    },
    {
      icon: Camera,
      iconColor: "text-blue-400",
      title: "Look Directly Ahead",
      description: "Face the camera straight on with a natural expression",
    },
    {
      icon: User,
      iconColor: "text-emerald-400",
      title: "Single Subject",
      description: "Ensure only one person is visible in the selfie frame",
    },
    {
      icon: Glasses,
      iconColor: "text-neutral-300",
      title: "Unobstructed Face",
      description: "Remove sunglasses, masks, or caps that cast deep shadows",
    },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0c0e12]">
      {/* Sticky Top Header Bar (Consistent with Gallery) */}
      <header className="sticky top-0 z-30 w-full bg-[#0c0e12]/95 backdrop-blur-md border-b border-neutral-800 px-3 sm:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-neutral-700 shadow-sm flex-shrink-0 bg-neutral-900">
              <img
                src="/odyssey_shutter.png"
                alt="HackOdyssey Medallion"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                The Odyssey Hackathon 2K26
              </h1>
              <p className="text-[11px] text-neutral-400 truncate">Photo Search</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Centered Body */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mb-4 shadow-sm">
          <SearchX className="w-8 h-8 text-neutral-300" />
        </div>

        {/* Heading & Subtitle */}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-center">
          No Matching Photos Found
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 text-center mt-2 max-w-sm leading-relaxed">
          We could not find any event photographs matching your selfie with high confidence.
        </p>

        {/* Structured Tips Card */}
        <div className="w-full mt-6 rounded-xl bg-neutral-900/80 border border-neutral-800 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-neutral-800 text-xs font-semibold text-neutral-200 tracking-wide">
            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Tips for Better Results</span>
          </div>

          <div className="space-y-3">
            {tips.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-neutral-800/90 border border-neutral-700/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className={`w-3.5 h-3.5 ${tip.iconColor}`} />
                  </div>
                  <div className="text-xs leading-relaxed">
                    <span className="font-semibold text-neutral-200">{tip.title}:</span>{" "}
                    <span className="text-neutral-400">{tip.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Team Note */}
        <div className="w-full mt-3 p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-2.5 text-xs text-neutral-400">
          <HelpCircle className="w-4 h-4 text-amber-400/90 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px] sm:text-xs text-neutral-400">
            <strong className="text-neutral-200 font-semibold">Missed a moment?</strong> This model is not guaranteed to retrieve all your moments. If you miss any of your photos, please contact with us.
          </p>
        </div>

        {/* Primary Call to Action Button */}
        <div className="w-full mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl gold-action-btn text-xs font-semibold uppercase tracking-wider transition active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4 text-neutral-950" />
            <span>Try Another Selfie</span>
          </button>
        </div>
      </main>

      {/* Structured Clean Footer */}
      <footer className="w-full text-center py-4 border-t border-neutral-800/60 text-[11px] text-neutral-400 flex-shrink-0">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Biometric data processed in memory only • Selfies never stored</span>
        </div>
      </footer>
    </div>
  );
}
