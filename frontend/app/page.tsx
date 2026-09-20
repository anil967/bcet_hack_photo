"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Camera, ShieldCheck, Sparkles, Image as ImageIcon } from "lucide-react";

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

  // Handle capture from camera or file
  const handleCapture = (base64Image: string) => {
    setCapturedImage(base64Image);
    setStage("preview");
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setStage("camera");
  };

  // Submit selfie to backend API
  const handleSubmitSelfie = async () => {
    if (!capturedImage) return;

    setStage("searching");

    try {
      const result = await searchPhotosWithSelfie(capturedImage);

      if (result.success) {
        if (result.count > 0) {
          setPhotos(result.photos);
          setStage("results");
          // Trigger celebratory confetti
          try {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#6366f1", "#818cf8", "#a5b4fc", "#ffffff"],
            });
          } catch {
            // Ignore if canvas-confetti is not available
          }
        } else {
          setPhotos([]);
          setStage("empty");
        }
      } else {
        setErrorCode(result.error || "SEARCH_FAILED");
        setErrorMessage(result.message || "An error occurred while finding photos.");
        setStage("error");
      }
    } catch {
      setErrorCode("NETWORK_ERROR");
      setErrorMessage("Unable to connect to the server. Please try again.");
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">PhotoFinder</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Secure Biometric Match</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Landing Hero (shown in camera or preview mode) */}
        {(stage === "camera" || stage === "preview") && (
          <div className="text-center max-w-xl mx-auto mb-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Event Photo Recognition</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Find Your Event Photos
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mt-2.5 max-w-md mx-auto leading-relaxed">
              Take a quick selfie and instantly discover all the event moments you appear in.
            </p>
          </div>
        )}

        {/* Dynamic Stages */}
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

      {/* Fullscreen Photo Lightbox Modal */}
      {stage === "results" && activePhotoIndex !== null && (
        <PhotoViewer
          photos={photos}
          currentIndex={activePhotoIndex}
          onClose={() => setActivePhotoIndex(null)}
          onSelectIndex={(newIdx) => setActivePhotoIndex(newIdx)}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950/60 py-6 text-center text-xs text-zinc-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>PhotoFinder &copy; 2026. All photographs encrypted and served on-demand.</span>
          <div className="flex items-center gap-4 text-zinc-500">
            <span>No registration required</span>
            <span>•</span>
            <span>Selfies never stored</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
