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
      {/* Card */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
        <img
          src={imageSrc}
          alt="Your captured selfie"
          className="w-full h-full object-cover"
        />

        {/* Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/10 text-xs font-medium text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Selfie Ready</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-sm transition"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Photo
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition group"
        >
          <span>Find My Photos</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Privacy guarantee */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
        <span>Biometric vector generated in-memory only</span>
      </div>
    </div>
  );
}
