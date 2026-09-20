"use client";

import React from "react";
import { SearchX, RotateCcw, Lightbulb } from "lucide-react";

interface EmptyStateProps {
  onRetry: () => void;
}

export function EmptyState({ onRetry }: EmptyStateProps) {
  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#1c130b] border border-[#f39c12]/40 flex items-center justify-center text-[#ffd700] mb-6 shadow-xl">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-heading font-bold text-white tracking-wide bg-gradient-to-r from-white via-[#ffd700] to-[#f39c12] bg-clip-text text-transparent">
        No Matching Moments Found
      </h3>

      <p className="text-xs sm:text-sm text-[#a89680] font-body mt-2 max-w-sm leading-relaxed">
        We could not find any event photos matching your selfie in the Odyssey gallery.
      </p>

      {/* Advice Box */}
      <div className="w-full mt-6 p-4 bg-[#140c06] border border-[#f39c12]/30 text-left text-xs text-[#d8c7b2] space-y-2">
        <div className="flex items-center gap-1.5 font-heading font-semibold text-[#ffd700]">
          <Lightbulb className="w-4 h-4 text-[#ffd700]" />
          <span>Tips for a clearer match:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[#a89680] font-body pl-1">
          <li>Ensure bright, direct lighting on your face</li>
          <li>Look directly toward the camera lens</li>
          <li>Ensure only one person is in the frame</li>
          <li>Remove dark glasses or face coverings</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="mt-8 flex items-center justify-center gap-2 px-6 py-3 gold-action-btn font-heading text-xs tracking-wider uppercase"
      >
        <RotateCcw className="w-4 h-4 text-[#0a0705]" />
        <span>Try Another Selfie</span>
      </button>
    </div>
  );
}
