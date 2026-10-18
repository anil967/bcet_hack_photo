"use client";

import React from "react";
import { ArrowRight, RotateCcw, CheckCircle2, ShieldCheck } from "lucide-react";

interface SelfiePreviewProps {
  imageSrc: string;
  onRetake: () => void;
  onSubmit: () => void;
}

export function SelfiePreview({ imageSrc, onRetake, onSubmit }: SelfiePreviewProps) {
  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
      {/* Frame calibrated to mobile screen height with clean natural border */}
      <div className="relative w-full aspect-[3/4] max-h-[44vh] sm:max-h-[50vh] rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        <img
          src={imageSrc}
          alt="Your captured selfie"
          className="w-full h-full object-cover"
        />

        {/* Minimal clean badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-black/75 backdrop-blur-md border border-neutral-700/80 rounded-full text-xs font-medium text-neutral-200 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Selfie Ready</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-3 sm:mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-lg odyssey-secondary-btn text-xs font-medium uppercase tracking-wider active:scale-95 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-lg gold-action-btn text-xs font-semibold uppercase tracking-wider group active:scale-95 transition"
        >
          <span>Find My Photos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
