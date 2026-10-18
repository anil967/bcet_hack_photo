"use client";

import React, { useState, useEffect } from "react";
import { Download, Camera, Loader2, Sparkles, Images } from "lucide-react";
import { PhotoItem, getFullPhotoUrl } from "../lib/api";
import { PhotoCard } from "./PhotoCard";

interface PhotoGridProps {
  photos: PhotoItem[];
  onViewPhoto: (photo: PhotoItem, index: number) => void;
  onReset: () => void;
}

export function PhotoGrid({ photos, onViewPhoto, onReset }: PhotoGridProps) {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadedCount, setDownloadedCount] = useState(0);

  // Strictly show only photos matching 50% or greater (>= 0.50)
  const qualifiedPhotos = photos.filter((p) => (p.matchScore ?? 1.0) >= 0.50);

  // Pre-cache full-resolution images for the top photos in the background
  useEffect(() => {
    if (qualifiedPhotos && qualifiedPhotos.length > 0) {
      qualifiedPhotos.slice(0, 8).forEach((p) => {
        const img = new Image();
        img.src = getFullPhotoUrl(p.imageUrl);
      });
    }
  }, [qualifiedPhotos]);

  const downloadSinglePhoto = (photo: PhotoItem) => {
    const downloadUrl = getFullPhotoUrl(photo.downloadUrl);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = photo.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (downloadingAll || qualifiedPhotos.length === 0) return;

    setDownloadingAll(true);
    setDownloadedCount(0);

    for (let i = 0; i < qualifiedPhotos.length; i++) {
      downloadSinglePhoto(qualifiedPhotos[i]);
      setDownloadedCount(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    setDownloadingAll(false);
  };


  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0c0e12]">
      {/* Sticky Frosted Glass Gallery Header (Natural theme, clean hairline border) */}
      <header className="sticky top-0 z-30 w-full bg-[#0c0e12]/95 backdrop-blur-md border-b border-neutral-800 px-3 sm:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Title & Count - grouped cleanly on the left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-neutral-700 shadow-sm flex-shrink-0 bg-neutral-900">
              <img
                src="/odyssey_shutter.png"
                alt="HackOdyssey Medallion"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight whitespace-nowrap">
                <span className="sm:hidden">Your Moments</span>
                <span className="hidden sm:inline">Your Odyssey Moments</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/80 flex-shrink-0">
                {qualifiedPhotos.length}
              </span>
            </div>
          </div>

          {/* Action Buttons - aligned on the right */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onReset}
              title="Search with another selfie"
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition active:scale-95 text-xs font-medium shadow-sm"
            >
              <Camera className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden md:inline">Search Again</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              title="Download all matched photographs"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg gold-action-btn transition active:scale-95 text-xs font-semibold disabled:opacity-60 shadow"
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-900" />
                  <span>({downloadedCount}/{qualifiedPhotos.length})</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-neutral-900" />
                  <span className="whitespace-nowrap">Download All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Gallery Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-8 py-3 sm:py-6">
        {/* Subtle structured gallery helper banner */}
        <div className="mb-3.5 sm:mb-6 p-2.5 sm:p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="leading-tight">Tap any photo to view in high resolution. If you miss any of your moments, please contact with us.</span>
          </div>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-800 text-[11px] font-mono text-neutral-300 flex-shrink-0">
            ≥ 50% Match
          </span>
        </div>


        {/* Adaptive Photography Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
          {qualifiedPhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={index}
              onView={onViewPhoto}
              onDownload={downloadSinglePhoto}
            />
          ))}
        </div>

      </main>
    </div>
  );
}

