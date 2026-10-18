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
      <div className="w-14 h-14 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-5 shadow">
        <IconComponent className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-white tracking-tight">
        {details.title}
      </h3>

      <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-sm leading-relaxed">
        {details.message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 flex items-center justify-center gap-2 px-6 py-2.5 gold-action-btn text-xs font-semibold uppercase tracking-wider transition active:scale-95"
      >
        <RotateCcw className="w-4 h-4 text-neutral-950" />
        <span>{details.buttonText}</span>
      </button>
    </div>
  );
}

