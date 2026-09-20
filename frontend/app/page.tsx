"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Compass, Sparkles, ShieldCheck } from "lucide-react";

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

  return (
    <div className="flex flex-col min-h-[100dvh] justify-between bg-[#0a0705] text-[#e0d5c1] px-3 py-3 sm:px-6 sm:py-6 select-none overflow-x-hidden">
      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
        {/* Compact Hero Header (No top bar) */}
        {(stage === "camera" || stage === "preview") && (
          <div className="text-center w-full max-w-md mx-auto mb-3 sm:mb-5 animate-fadeIn">
            {/* Medallion + Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#140c06] border border-[#f39c12]/35 text-[#ffd700] text-[10px] sm:text-xs font-heading uppercase tracking-[0.18em] mb-2 shadow-[0_0_15px_rgba(243,156,18,0.2)]">
              <Compass className="w-3.5 h-3.5 text-[#ffd700] animate-pulse-slow" />
              <span>The Odyssey Hackathon 2K26</span>
            </div>

            {/* Display Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight bg-gradient-to-r from-white via-[#ffd700] to-[#f39c12] bg-clip-text text-transparent leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Find Your Odyssey Moments
            </h1>
            <p className="text-xs sm:text-sm text-[#a89680] font-body mt-1 sm:mt-1.5 leading-snug max-w-xs sm:max-w-sm mx-auto">
              Take a selfie to discover your event photographs instantly.
            </p>
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

      {/* Minimal Odyssey Footer */}
      {(stage === "camera" || stage === "preview") && (
        <footer className="w-full text-center py-2 text-[11px] text-[#705e4c] font-heading tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#f39c12]" />
            <span>Biometric data processed in memory only · Selfies never stored</span>
          </div>
        </footer>
      )}
    </div>
  );
}
