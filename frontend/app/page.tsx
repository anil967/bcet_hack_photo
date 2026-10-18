"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Compass, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";

import { CameraCapture } from "../components/CameraCapture";
import { SelfiePreview } from "../components/SelfiePreview";
import { SearchProgress } from "../components/SearchProgress";
import { PhotoGrid } from "../components/PhotoGrid";
import { PhotoViewer } from "../components/PhotoViewer";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PhotoItem, searchPhotosWithSelfie } from "../lib/api";

type AppStage = "camera" | "preview" | "searching" | "results" | "empty" | "error";

export default function Home() {
  const [stage, setStage] = useState<AppStage>("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [errorCode, setErrorCode] = useState<string>("UNKNOWN");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCapture = (base64Image: string) => {
    setCapturedImage(base64Image);
    setStage("preview");
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStage("camera");
  };

  const handleSubmitSelfie = async () => {
    if (!capturedImage) return;
    setStage("searching");

    try {
      const result = await searchPhotosWithSelfie(capturedImage);

      if (result.success) {
        if (result.count > 0) {
          setPhotos(result.photos);
          setStage("results");
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.65 },
              colors: ["#ffd700", "#f39c12", "#e5a93c", "#d4af37", "#ffffff"],
            });
          } catch {
            // fallback
          }
        } else {
          setPhotos([]);
          setStage("empty");
        }
      } else {
        setErrorCode(result.error || "SEARCH_FAILED");
        setErrorMessage(result.message || "An error occurred while discovering photos.");
        setStage("error");
      }
    } catch {
      setErrorCode("NETWORK_ERROR");
      setErrorMessage("Unable to connect to PhotoFinder server. Please try again.");
      setStage("error");
    }
  };

  const handleCameraError = (code: string, message: string) => {
    setErrorCode(code);
    setErrorMessage(message);
    setStage("error");
  };

  const handleReset = () => {
    setCapturedImage(null);
    setPhotos([]);
    setActivePhotoIndex(null);
    setStage("camera");
  };

  const isCaptureStage = stage === "camera" || stage === "preview" || stage === "searching";

  return (
    <div
      className={`flex flex-col ${
        isCaptureStage
          ? "h-[100dvh] max-h-[100dvh] overflow-hidden justify-between py-2 sm:py-4 px-3 sm:px-6"
          : "min-h-[100dvh] overflow-y-auto no-scrollbar justify-start py-0 px-0"
      } bg-[#0c0e12] text-neutral-100 select-none`}
    >
      {/* Main Container */}
      <main
        className={`w-full ${
          isCaptureStage
            ? "max-w-md mx-auto flex-1 min-h-0 justify-between items-center px-3"
            : "w-full mx-auto flex-1 justify-start items-stretch"
        } flex flex-col`}
      >
        {/* Compact Hero Header (Clean, structural, no glowing blur) */}
        {(stage === "camera" || stage === "preview") && (
          <div className="text-center w-full max-w-md mx-auto animate-fadeIn flex-shrink-0 pt-1 pb-1 sm:pb-2">
            {/* Event Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium tracking-wide mb-1.5 rounded-full">
              <Compass className="w-3.5 h-3.5 text-neutral-400" />
              <span>The Odyssey Hackathon 2K26</span>
            </div>

            {/* Clean White Title */}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              Find Your Odyssey Moments
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-normal max-w-xs mx-auto">
              Take a quick selfie to discover all your photographs instantly.
            </p>
            {/* Structured Disclaimer Callout Box */}
            <div className="mt-2 sm:mt-2.5 mx-auto w-full max-w-sm p-2 sm:p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/90 flex items-start gap-2.5 text-left shadow-sm">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px] sm:text-xs text-neutral-400">
                <strong className="text-neutral-200 font-semibold">Missed a moment?</strong>{" "}
                This model is not guaranteed to retrieve all your moments. If you miss any of your photos, please contact with us.
              </p>
            </div>
          </div>
        )}

        {/* Stages */}
        {stage === "camera" && (
          <CameraCapture onCapture={handleCapture} onError={handleCameraError} />
        )}

        {stage === "preview" && capturedImage && (
          <SelfiePreview
            imageSrc={capturedImage}
            onRetake={handleRetake}
            onSubmit={handleSubmitSelfie}
          />
        )}

        {stage === "searching" && <SearchProgress />}

        {stage === "results" && (
          <PhotoGrid
            photos={photos}
            onViewPhoto={(_, index) => setActivePhotoIndex(index)}
            onReset={handleReset}
          />
        )}

        {stage === "empty" && <EmptyState onRetry={handleReset} />}

        {stage === "error" && (
          <ErrorState
            errorCode={errorCode}
            errorMessage={errorMessage}
            onRetry={handleReset}
          />
        )}
      </main>

      {/* Lightbox Modal */}
      {stage === "results" && activePhotoIndex !== null && (
        <PhotoViewer
          photos={photos}
          currentIndex={activePhotoIndex}
          onClose={() => setActivePhotoIndex(null)}
          onSelectIndex={(newIdx) => setActivePhotoIndex(newIdx)}
        />
      )}

      {/* Natural Theme Clean Footer */}
      {(stage === "camera" || stage === "preview") && (
        <footer className="w-full text-center py-2 text-[11px] text-neutral-400 flex-shrink-0">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Biometric data processed in memory only • Selfies never stored</span>
          </div>
        </footer>
      )}

    </div>
  );
}
