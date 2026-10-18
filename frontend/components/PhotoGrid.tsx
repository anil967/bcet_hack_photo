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

  // Pre-cache full-resolution images for the top photos in the background
  useEffect(() => {
    if (photos && photos.length > 0) {
      photos.slice(0, 8).forEach((p) => {
        const img = new Image();
        img.src = getFullPhotoUrl(p.imageUrl);
      });
    }
  }, [photos]);

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
    if (downloadingAll || photos.length === 0) return;

    setDownloadingAll(true);
    setDownloadedCount(0);

    for (let i = 0; i < photos.length; i++) {
      downloadSinglePhoto(photos[i]);
      setDownloadedCount(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    setDownloadingAll(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0a0705]">
      {/* Sticky Frosted Glass Gallery Header */}
      <header className="sticky top-0 z-30 w-full bg-[#0a0705]/90 backdrop-blur-md border-b border-[#f39c12]/20 px-3 sm:px-8 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Stats */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-[#ffd700] shadow-[0_0_12px_rgba(243,156,18,0.4)] flex-shrink-0 bg-[#140c06]">
              <img
                src="/odyssey_shutter.png"
                alt="HackOdyssey Medallion"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-heading font-bold tracking-tight bg-gradient-to-r from-white via-[#ffd700] to-[#f39c12] bg-clip-text text-transparent truncate">
                  Your Odyssey Moments
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold bg-[#f39c12]/15 text-[#ffd700] border border-[#f39c12]/35">
                  <Images className="w-3 h-3 text-[#ffd700]" />
                  {photos.length} Photos
                </span>
              </div>
              <p className="text-[11px] text-[#a89680] truncate hidden sm:block">
                The Odyssey Hackathon 2K26 • Official Matched Gallery
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile Photo Count Badge */}
            <span className="sm:hidden text-xs font-heading font-bold text-[#ffd700] px-2 py-1 bg-[#140c06] border border-[#f39c12]/30 rounded-md">
              {photos.length}
            </span>

            <button
              type="button"
              onClick={onReset}
              title="Search with another selfie"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#140c06] hover:bg-[#20140b] text-[#ffd700] border border-[#f39c12]/40 hover:border-[#ffd700] transition active:scale-95 text-xs font-heading tracking-wider uppercase shadow"
            >
              <Camera className="w-3.5 h-3.5 text-[#ffd700]" />
              <span className="hidden xs:inline sm:inline">Search Again</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              title="Download all matched photographs"
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg gold-action-btn transition active:scale-95 text-xs font-heading tracking-wider uppercase disabled:opacity-60 shadow-md"
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0a0705]" />
                  <span>({downloadedCount}/{photos.length})</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#0a0705]" />
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
        <div className="flex items-center justify-between mb-4 px-1 text-xs text-[#8e7a63]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ffd700]/70" />
            <span>Tap any photograph to view in high-resolution full screen.</span>
          </div>
          <span className="text-[11px] font-mono hidden md:inline text-[#a89680]">
            Match Quality: High
          </span>
        </div>

        {/* Adaptive Photography Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
          {photos.map((photo, index) => (
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

