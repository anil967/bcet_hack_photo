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
          title: "We couldn't detect your face",
          message: "Please try taking another selfie with brighter lighting and facing the camera directly.",
          buttonText: "Take New Selfie",
        };
      case "MULTIPLE_FACES":
        return {
          icon: Users,
          title: "Only one person should be visible",
          message: "We detected multiple people in your selfie. Please ensure only you are visible in the camera frame.",
          buttonText: "Retake Selfie",
        };
      case "CAMERA_PERMISSION_DENIED":
        return {
          icon: AlertTriangle,
          title: "Camera access is required",
          message: "Please allow camera access in your browser site permissions and try again.",
          buttonText: "Retry Camera Permission",
        };
      case "RATE_LIMITED":
        return {
          icon: Clock,
          title: "Too Many Searches",
          message: "To keep PhotoFinder fast and secure for everyone, please wait a minute before searching again.",
          buttonText: "Try Again Later",
        };
      case "NETWORK_ERROR":
        return {
          icon: WifiOff,
          title: "Connection Issue",
          message: "Something went wrong connecting to the server. Please verify your connection and try again.",
          buttonText: "Try Again",
        };
      default:
        return {
          icon: AlertTriangle,
          title: "Search Error",
          message: errorMessage || "Something went wrong while processing your request. Please try again.",
          buttonText: "Try Again",
        };
    }
  };

  const details = getErrorDetails();
  const IconComponent = details.icon;

  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 shadow-xl">
        <IconComponent className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-zinc-100 tracking-tight">
        {details.title}
      </h3>

      <p className="text-sm text-zinc-400 mt-2 max-w-sm leading-relaxed">
        {details.message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-8 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{details.buttonText}</span>
      </button>
    </div>
  );
}
