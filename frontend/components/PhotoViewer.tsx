"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download, Check, Loader2 } from "lucide-react";
import { PhotoItem, getFullPhotoUrl } from "../lib/api";

interface PhotoViewerProps {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export function PhotoViewer({ photos, currentIndex, onClose, onSelectIndex }: PhotoViewerProps) {
  const currentPhoto = photos[currentIndex];
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadSeconds, setLoadSeconds] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const touchStartXRef = useRef<number | null>(null);

  // Timer to track how long loading takes and show helpful friendly text
  useEffect(() => {
    if (isLoaded || hasError) return;
    const timer = setInterval(() => {
      setLoadSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoaded, hasError, currentIndex, retryKey]);

  // Check if image is already cached in browser memory, and preload adjacent photos
  useEffect(() => {
    if (!currentPhoto) return;

    setIsLoaded(false);
    setHasError(false);
    setLoadSeconds(0);

    const fullUrl = getFullPhotoUrl(currentPhoto.imageUrl);
    const testImg = new Image();
    testImg.src = fullUrl;

    if (testImg.complete && testImg.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      testImg.onload = () => {
        setIsLoaded(true);
        setHasError(false);
      };
      testImg.onerror = () => {
        // Will show friendly retry UI
        setHasError(true);
      };
    }

    // Preload next image for instant transition
    if (currentIndex + 1 < photos.length) {
      const nextImg = new Image();
      nextImg.src = getFullPhotoUrl(photos[currentIndex + 1].imageUrl);
    }
    // Preload previous image
    if (currentIndex > 0) {
      const prevImg = new Image();
      prevImg.src = getFullPhotoUrl(photos[currentIndex - 1].imageUrl);
    }
  }, [currentIndex, currentPhoto, photos, retryKey]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onSelectIndex(currentIndex + 1);
    }
  }, [currentIndex, photos.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelectIndex(currentIndex - 1);
    }
  }, [currentIndex, onSelectIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  const handleDownload = async () => {
    if (!currentPhoto) return;
    try {
      const res = await fetch(getFullPhotoUrl(currentPhoto.downloadUrl));
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = currentPhoto.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      window.open(getFullPhotoUrl(currentPhoto.downloadUrl), "_blank");
    }

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  if (!currentPhoto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 sm:p-5 text-neutral-300 z-10 border-b border-neutral-800 bg-neutral-950/80">
        {/* Counter */}
        <div className="text-xs font-mono font-medium tracking-wide text-neutral-200 bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download photo"
            className="flex items-center gap-2 px-4 py-2 gold-action-btn text-xs font-semibold uppercase tracking-wider shadow"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-neutral-950" />
                <span>Download</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous photograph"
            className="absolute left-4 sm:left-8 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 z-10 shadow-xl transition active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center rounded-xl border border-neutral-800 shadow-2xl overflow-hidden bg-neutral-950">
          {/* Subtle loading indicator at the top of the frame while high-res loads */}
          {!isLoaded && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 animate-pulse z-30" />
          )}

          {/* Friendly Please Wait Message only if slow network connection (>2.5s) */}
          {!isLoaded && !hasError && loadSeconds > 2.5 && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none transition-opacity duration-300 p-4">
              <div className="flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-2xl max-w-xs text-center">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                    Loading high-resolution photo...
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {loadSeconds > 3
                      ? "Downloading original quality, please wait a moment..."
                      : "Please wait a moment"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Friendly Fallback on Network Glitch / Delay */}
          {hasError && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md p-4 text-center">
              <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl max-w-xs">
                <p className="text-sm font-semibold text-white">Taking a moment to load</p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Please wait a moment and tap below to refresh the photo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHasError(false);
                    setIsLoaded(false);
                    setRetryKey((k) => k + 1);
                  }}
                  className="px-4 py-2 rounded-lg gold-action-btn text-xs font-semibold shadow active:scale-95 transition"
                >
                  Refresh Photo
                </button>
              </div>
            </div>
          )}

          {/* Instant low-res thumbnail backdrop (renders in 0ms because already in browser memory) */}
          <img
            key={`thumb-${currentPhoto.id}`}
            src={getFullPhotoUrl(currentPhoto.thumbnailUrl)}
            alt=""
            aria-hidden="true"
            className={`max-w-full max-h-[78vh] object-contain filter blur-[1px] transition-opacity duration-300 select-none ${
              isLoaded ? "opacity-0 absolute pointer-events-none" : "opacity-90 block"
            }`}
          />

          {/* Full-resolution photograph */}
          <img
            key={`full-${currentPhoto.id}-${retryKey}`}
            src={getFullPhotoUrl(currentPhoto.imageUrl) + (retryKey > 0 ? `?retry=${retryKey}` : "")}
            alt={currentPhoto.fileName}
            onLoad={() => {
              setIsLoaded(true);
              setHasError(false);
            }}
            onError={() => {
              setHasError(true);
            }}
            className={`max-w-full max-h-[78vh] object-contain transition-opacity duration-300 relative z-20 select-none ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {currentIndex < photos.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next photograph"
            className="absolute right-4 sm:right-8 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 z-10 shadow-xl transition active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="p-4 text-center text-xs text-neutral-400 font-medium tracking-wide z-10 border-t border-neutral-800 bg-neutral-950/80">
        <span>{currentPhoto.fileName}</span>
        <span className="hidden sm:inline mx-2">·</span>
        <span className="hidden sm:inline">Use arrow keys or swipe to navigate</span>
      </div>
    </div>
  );
}
