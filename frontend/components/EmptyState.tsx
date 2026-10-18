"use client";

import React from "react";
import { SearchX, RotateCcw, Lightbulb } from "lucide-react";

interface EmptyStateProps {
  onRetry: () => void;
}

export function EmptyState({ onRetry }: EmptyStateProps) {
  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mb-5 shadow">
        <SearchX className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-white tracking-tight">
        No Matching Photos Found
      </h3>

      <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-sm leading-relaxed">
        We could not find any event photos matching your selfie.
      </p>

      {/* Advice Box */}
      <div className="w-full mt-6 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-left text-xs text-neutral-300 space-y-2">
        <div className="flex items-center gap-1.5 font-medium text-white">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Tips for better results:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-1">
          <li>Ensure good, even lighting on your face</li>
          <li>Look directly toward the camera lens</li>
          <li>Ensure only one person is in the frame</li>
          <li>Remove dark glasses or face coverings</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 flex items-center justify-center gap-2 px-6 py-2.5 gold-action-btn text-xs font-semibold uppercase tracking-wider transition active:scale-95"
      >
        <RotateCcw className="w-4 h-4 text-neutral-950" />
        <span>Try Another Selfie</span>
      </button>
    </div>

  );
}
