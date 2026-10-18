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
      <header className="sticky top-0 z-30 w-full bg-[#0c0e12]/95 backdrop-blur-md border-b border-neutral-800 px-3 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Stats */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-neutral-700 shadow flex-shrink-0 bg-neutral-900">
              <img
                src="/odyssey_shutter.png"
                alt="HackOdyssey Medallion"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                  Your Odyssey Moments
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                  <Images className="w-3 h-3 text-neutral-400" />
                  {qualifiedPhotos.length} Photos
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate hidden sm:block">
                The Odyssey Hackathon 2K26 • Matched Photographs (≥ 50% Match)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile Photo Count Badge */}
            <span className="sm:hidden text-xs font-semibold text-neutral-300 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-md">
              {qualifiedPhotos.length}
            </span>

            <button
              type="button"
              onClick={onReset}
              title="Search with another selfie"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition active:scale-95 text-xs font-medium shadow-sm"
            >
              <Camera className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden xs:inline sm:inline">Search Again</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              title="Download all matched photographs"
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg gold-action-btn transition active:scale-95 text-xs font-semibold disabled:opacity-60 shadow"
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-900" />
                  <span>({downloadedCount}/{qualifiedPhotos.length})</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-neutral-900" />
                  <span>Download All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Gallery Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-8 py-4 sm:py-6">
        {/* Subtle gallery helper banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-4 px-1 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Tap any photo to view in high resolution. If you miss any of your moments, please contact with us.</span>
          </div>
          <span className="text-[11px] font-mono hidden md:inline text-neutral-500">
            ≥ 50% Match Confidence
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

