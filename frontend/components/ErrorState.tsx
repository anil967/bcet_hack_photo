"use client";

import React from "react";
import { AlertTriangle, Users, ScanFace, WifiOff, Clock, RotateCcw } from "lucide-react";

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
    <div className="w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-xl">
        <IconComponent className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-heading font-bold text-white tracking-wide bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent">
        {details.title}
      </h3>

      <p className="text-xs sm:text-sm text-[#a89680] font-body mt-2 max-w-sm leading-relaxed">
        {details.message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-8 flex items-center justify-center gap-2 px-6 py-3 gold-action-btn font-heading text-xs tracking-wider uppercase"
      >
        <RotateCcw className="w-4 h-4 text-[#0a0705]" />
        <span>{details.buttonText}</span>
      </button>
    </div>
  );
}
