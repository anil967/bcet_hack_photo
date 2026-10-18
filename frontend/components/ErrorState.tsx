"use client";

import React from "react";
import { AlertTriangle, Users, ScanFace, WifiOff, Clock, RotateCcw, ShieldCheck, HelpCircle } from "lucide-react";

interface ErrorStateProps {
  errorCode: string;
  errorMessage?: string;
  onRetry: () => void;
}

export function ErrorState({ errorCode, errorMessage, onRetry }: ErrorStateProps) {
  const getErrorDetails = () => {
    switch (errorCode) {
      case "NO_FACE_DETECTED":
        return {
          icon: ScanFace,
          title: "We Couldn't Detect Your Face",
          message: "Please try taking another selfie with brighter lighting and facing the camera directly.",
          buttonText: "Take New Selfie",
        };
      case "MULTIPLE_FACES":
        return {
          icon: Users,
          title: "Single Person Required",
          message: "Multiple people were detected in the selfie. Please ensure only you are visible in the frame.",
          buttonText: "Retake Selfie",
        };
      case "CAMERA_PERMISSION_DENIED":
        return {
          icon: AlertTriangle,
          title: "Camera Access Required",
          message: "Please allow camera permissions in your browser site settings and try again.",
          buttonText: "Retry Permissions",
        };
      case "RATE_LIMITED":
        return {
          icon: Clock,
          title: "Voyage Paused",
          message: "To keep the system fast for all Odyssey participants, please wait a moment before searching again.",
          buttonText: "Try Again Later",
        };
      case "NETWORK_ERROR":
        return {
          icon: WifiOff,
          title: "Connection Lost",
          message: "Unable to reach the PhotoFinder server. Please check your connection and retry.",
          buttonText: "Try Again",
        };
      default:
        return {
          icon: AlertTriangle,
          title: "Search Error",
          message: errorMessage || "An unexpected issue occurred during your search. Please try again.",
          buttonText: "Try Again",
        };
    }
  };

  const details = getErrorDetails();
  const IconComponent = details.icon;

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0c0e12]">
      {/* Sticky Top Header Bar (Consistent with Gallery & Empty State) */}
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
              <p className="text-[11px] text-neutral-400 truncate">System Notice</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Centered Body */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 mb-4 shadow-sm">
          <IconComponent className="w-8 h-8 text-amber-400" />
        </div>

        {/* Heading & Subtitle */}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-center">
          {details.title}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 text-center mt-2 max-w-sm leading-relaxed">
          {details.message}
        </p>

        {/* Contact Note */}
        <div className="w-full mt-6 p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-2.5 text-xs text-neutral-400">
          <HelpCircle className="w-4 h-4 text-amber-400/90 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px] sm:text-xs text-neutral-400">
            <strong className="text-neutral-200 font-semibold">Need help?</strong> If you continue having trouble finding your event moments, please contact our photography team.
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
            <span>{details.buttonText}</span>
          </button>
        </div>
      </main>

      {/* Structured Clean Footer */}
      <footer className="w-full text-center py-4 border-t border-neutral-800/60 text-[11px] text-neutral-400 flex-shrink-0">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Private & secure • Your selfie is never saved</span>
        </div>
      </footer>
    </div>
  );
}

