"use client";

import React, { useState } from "react";
import { Download, Camera, Check, Loader2 } from "lucide-react";
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#f39c12]/30">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight bg-gradient-to-r from-white via-[#ffd700] to-[#f39c12] bg-clip-text text-transparent">
              Your Odyssey Moments
            </h2>
            <span className="px-3 py-1 text-xs font-heading font-bold tracking-wider uppercase bg-[#f39c12]/15 text-[#ffd700] border border-[#f39c12]/40">
              {photos.length} Found
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#a89680] font-body mt-1">
            Photographs captured across The Odyssey Hackathon 2K26.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 odyssey-secondary-btn font-heading text-xs tracking-wider uppercase"
          >
            <Camera className="w-4 h-4 text-[#ffd700]" />
            <span>Search Again</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="flex items-center gap-2 px-5 py-2.5 gold-action-btn font-heading text-xs tracking-wider uppercase disabled:opacity-60"
          >
            {downloadingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0a0705]" />
                <span>Downloading ({downloadedCount}/{photos.length})...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#0a0705]" />
                <span>Download All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Responsive Gallery Grid: 4 cols desktop, 3 cols tablet, 2 cols mobile */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
    </div>
  );
}
