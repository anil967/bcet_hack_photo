"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { ShieldCheck, Compass, Sparkles } from "lucide-react";

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
          // Golden Odyssey confetti
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
    <div className="flex flex-col min-h-screen bg-[#0a0705]">
      {/* Odyssey Header */}
      <header className="w-full border-b border-[#f39c12]/30 bg-[#0e0905]/90 backdrop-blur-md sticky top-0 z-40 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Golden Spartan / Voyage Medallion */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f39c12]/30 to-[#0a0705] border border-[#ffd700]/60 flex items-center justify-center text-[#ffd700] shadow-[0_0_12px_rgba(243,156,18,0.35)]">
              <Compass className="w-5 h-5 animate-pulse-slow text-[#ffd700]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-[0.14em] uppercase bg-gradient-to-r from-white via-[#ffd700] to-[#f39c12] bg-clip-text text-transparent">
                The Odyssey
              </span>
              <span className="font-heading text-[10px] tracking-[0.18em] text-[#f39c12] uppercase font-semibold">
                PhotoFinder · Journey to Innovation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#1c130b]/80 border border-[#f39c12]/40 text-xs font-heading tracking-wider text-[#ffd700]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ffd700]" />
            <span className="hidden sm:inline">Secure Biometric Match</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </div>
      </header>

      {/* Main Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {(stage === "camera" || stage === "preview") && (
          <div className="text-center max-w-xl mx-auto mb-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f39c12]/15 border border-[#f39c12]/30 text-[#ffd700] text-xs font-heading uppercase tracking-[0.18em] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>BCET ODYSSEY HACKATHON · TECH FOR BHARAT</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-white via-[#ffd700] to-[#f39c12] bg-clip-text text-transparent leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Find Your Odyssey Moments
            </h1>
            <p className="text-sm sm:text-base text-[#c9bba8] font-body mt-3 max-w-md mx-auto leading-relaxed">
              Capture a quick selfie to discover every moment you appear in across the hackathon voyage.
            </p>
          </div>
        )}

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

      {/* Odyssey Footer */}
      <footer className="w-full border-t border-[#f39c12]/20 bg-[#070503]/80 py-6 text-center text-xs text-[#8f7c66] font-heading">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="tracking-wider">THE ODYSSEY HACKATHON 2K26 · BCET</span>
          <div className="flex items-center gap-4 text-[#a89680] tracking-wider">
            <span>NO REGISTRATION REQUIRED</span>
            <span>·</span>
            <span>SELFIES NEVER STORED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
