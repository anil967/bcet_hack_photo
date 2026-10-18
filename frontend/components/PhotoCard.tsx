"use client";

import React, { useState } from "react";
import { Maximize2, Download, Check } from "lucide-react";
import { PhotoItem, getFullPhotoUrl } from "../lib/api";

interface PhotoCardProps {
  photo: PhotoItem;
  index: number;
  onView: (photo: PhotoItem, index: number) => void;
  onDownload: (photo: PhotoItem) => void;
}

export function PhotoCard({ photo, index, onView, onDownload }: PhotoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const thumbUrl = getFullPhotoUrl(photo.thumbnailUrl) + (retryCount > 0 ? `?retry=${retryCount}` : "");

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(photo);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleMouseEnter = () => {
    // Speculatively preload the full-resolution photo on hover so clicking opens instantly
    const img = new Image();
    img.src = getFullPhotoUrl(photo.imageUrl);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(photo, index)}
      onMouseEnter={handleMouseEnter}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(photo, index);
        }
      }}
      aria-label={`View photo ${photo.fileName}`}
      className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-800/80 animate-pulse" />
      )}

      {/* Main Photograph */}
      <img
        src={thumbUrl}
        alt={photo.fileName}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (retryCount < 2) {
            setTimeout(() => setRetryCount((c) => c + 1), 1500);
          }
        }}
        className={`w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Hover Information & Quick Action Bar */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
        <div className="text-xs font-medium text-white truncate max-w-[65%] drop-shadow">
          {photo.fileName}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadClick}
            title="Download high-resolution original"
            aria-label={`Download ${photo.fileName}`}
            className="p-1.5 rounded-md bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition shadow"
          >
            {downloaded ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>

          <div
            title="View Fullscreen"
            className="p-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-neutral-950 transition shadow font-bold"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}


