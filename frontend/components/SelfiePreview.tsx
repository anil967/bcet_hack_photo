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
      {/* Frame calibrated to mobile screen height */}
      <div className="relative w-full aspect-[3/4] max-h-[44vh] sm:max-h-[50vh] rounded-xl border border-[#f39c12]/50 bg-[#0c0805] shadow-[0_8px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(243,156,18,0.2)] overflow-hidden">
        <img
          src={imageSrc}
          alt="Your captured selfie"
          className="w-full h-full object-cover"
        />

        {/* Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 bg-[#100a06]/90 backdrop-blur-md border border-[#ffd700]/50 rounded-md text-[10px] sm:text-[11px] font-heading tracking-wider text-[#ffd700]">
          <CheckCircle2 className="w-3 h-3 text-[#ffd700]" />
          <span>Selfie Ready</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-3 sm:mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-lg odyssey-secondary-btn font-heading text-xs tracking-wider uppercase active:scale-95 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-lg gold-action-btn font-heading text-xs tracking-wider uppercase group active:scale-95 transition"
        >
          <span>Find My Photos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
