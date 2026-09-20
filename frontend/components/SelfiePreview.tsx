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
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Frame */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full border-2 border-[#f39c12]/40 bg-[#0c0805] shadow-[0_12px_45px_rgba(0,0,0,0.95)] overflow-hidden">
        <img
          src={imageSrc}
          alt="Your captured selfie"
          className="w-full h-full object-cover"
        />

        {/* Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-[#100a06]/90 backdrop-blur-md border border-[#ffd700]/50 text-xs font-heading tracking-wider text-[#ffd700]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd700]" />
          <span>Selfie Ready</span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center justify-center gap-2 px-4 py-3.5 odyssey-secondary-btn font-heading text-xs tracking-wider uppercase"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center justify-center gap-2 px-5 py-3.5 gold-action-btn font-heading text-xs tracking-wider uppercase group"
        >
          <span>Find My Photos</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-[#8f7c66] font-heading tracking-wide">
        <ShieldCheck className="w-3.5 h-3.5 text-[#ffd700]" />
        <span>Biometric vector generated in-memory only</span>
      </div>
    </div>
  );
}
