"use client";

import React from "react";
import { SearchX, RotateCcw, Lightbulb } from "lucide-react";

interface EmptyStateProps {
  onRetry: () => void;
}

export function EmptyState({ onRetry }: EmptyStateProps) {
  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-6 shadow-xl">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-zinc-100 tracking-tight">
        No Matching Photos Found
      </h3>

      <p className="text-sm text-zinc-400 mt-2 max-w-sm leading-relaxed">
        We couldn't find any event photos matching your selfie.
      </p>

      {/* Advice Card */}
      <div className="w-full mt-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-left text-xs text-zinc-300 space-y-2">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Tips for a better match:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
          <li>Ensure good, even lighting on your face</li>
          <li>Look directly toward the camera</li>
          <li>Make sure only one person is in the frame</li>
          <li>Remove sunglasses, hats, or heavy facial obstructions</li>
        </ul>
      </div>

      {/* Action CTA */}
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Another Selfie</span>
      </button>
    </div>
  );
}
