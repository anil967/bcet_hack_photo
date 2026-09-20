"use client";

import React, { useState } from "react";
import { Download, Camera, Check, Sparkles, Loader2 } from "lucide-react";
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

  // Safe batch download: downloads sequentially with short delay
  const handleDownloadAll = async () => {
    if (downloadingAll || photos.length === 0) return;

    setDownloadingAll(true);
    setDownloadedCount(0);

    for (let i = 0; i < photos.length; i++) {
      downloadSinglePhoto(photos[i]);
      setDownloadedCount(i + 1);
      // 300ms pause to avoid overwhelming browser download manager
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    setDownloadingAll(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Your Event Photos</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {photos.length} found
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Matching photographs from the event gallery.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition"
          >
            <Camera className="w-4 h-4" />
            <span>Search Again</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition disabled:opacity-60"
          >
            {downloadingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Downloading ({downloadedCount}/{photos.length})...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Responsive Gallery Grid: 4 cols desktop, 3 cols tablet, 2 cols mobile */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
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
