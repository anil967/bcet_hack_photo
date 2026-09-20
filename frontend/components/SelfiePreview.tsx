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
      <div className="relative w-full aspect-[3/4] max-h-[50vh] sm:max-h-[58vh] border-2 border-[#f39c12]/45 bg-[#0c0805] shadow-[0_10px_35px_rgba(0,0,0,0.95)] overflow-hidden">
        <img
          src={imageSrc}
          alt="Your captured selfie"
          className="w-full h-full object-cover"
        />

        {/* Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-[#100a06]/90 backdrop-blur-md border border-[#ffd700]/50 text-[11px] font-heading tracking-wider text-[#ffd700]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd700]" />
          <span>Selfie Ready</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center justify-center gap-2 py-3 px-3 odyssey-secondary-btn font-heading text-xs tracking-wider uppercase active:scale-95 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center justify-center gap-2 py-3 px-3 gold-action-btn font-heading text-xs tracking-wider uppercase group active:scale-95 transition"
        >
          <span>Find My Photos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#705e4c] font-heading tracking-wide">
        <ShieldCheck className="w-3.5 h-3.5 text-[#f39c12]" />
        <span>Biometric vector processed in-memory only</span>
      </div>
    </div>
  );
}
