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
  const [downloaded, setDownloaded] = useState(false);

  const touchStartXRef = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setIsLoaded(false);
      onSelectIndex(currentIndex + 1);
    }
  }, [currentIndex, photos.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsLoaded(false);
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

  const handleDownload = () => {
    if (!currentPhoto) return;
    const link = document.createElement("a");
    link.href = getFullPhotoUrl(currentPhoto.downloadUrl);
    link.download = currentPhoto.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  if (!currentPhoto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      className="fixed inset-0 z-50 bg-[#050302]/95 backdrop-blur-md flex flex-col justify-between select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 sm:p-6 text-zinc-300 z-10 border-b border-[#f39c12]/20 bg-[#0a0705]/80">
        {/* Counter */}
        <div className="text-xs font-heading font-bold tracking-widest text-[#ffd700] bg-[#1a0f08] px-3.5 py-1.5 border border-[#f39c12]/40">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download photo"
            className="flex items-center gap-2 px-4 py-2 gold-action-btn font-heading text-xs tracking-wider uppercase"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#0a0705]" />
                <span>Download</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            className="p-2 odyssey-secondary-btn hover:border-[#ffd700] text-[#ffd700]"
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
            className="absolute left-4 sm:left-8 p-3.5 odyssey-secondary-btn text-[#ffd700] z-10 shadow-2xl hover:scale-110 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center border border-[#f39c12]/30 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          {!isLoaded && (
            <div className="absolute flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#ffd700] animate-spin" />
            </div>
          )}

          <img
            key={currentPhoto.id}
            src={getFullPhotoUrl(currentPhoto.imageUrl)}
            alt={currentPhoto.fileName}
            onLoad={() => setIsLoaded(true)}
            className={`max-w-full max-h-[78vh] object-contain transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {currentIndex < photos.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next photograph"
            className="absolute right-4 sm:right-8 p-3.5 odyssey-secondary-btn text-[#ffd700] z-10 shadow-2xl hover:scale-110 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="p-4 text-center text-xs text-[#8f7c66] font-heading tracking-wider z-10 border-t border-[#f39c12]/20 bg-[#0a0705]/80">
        <span>{currentPhoto.fileName}</span>
        <span className="hidden sm:inline mx-2">·</span>
        <span className="hidden sm:inline">Use arrow keys or swipe to navigate</span>
      </div>
    </div>
  );
}
