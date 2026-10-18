"use client";

import React, { useState } from "react";
import { Maximize2, Download, Check, Sparkles } from "lucide-react";
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

  const thumbUrl = getFullPhotoUrl(photo.thumbnailUrl);

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
      className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#120b06] border border-[#f39c12]/25 hover:border-[#ffd700] transition-all duration-300 shadow-md hover:shadow-[0_8px_25px_rgba(243,156,18,0.25)] focus:outline-none focus:ring-2 focus:ring-[#ffd700] cursor-pointer"
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#140c06] via-[#24150b] to-[#140c06] animate-pulse" />
      )}

      {/* Main Photograph */}
      <img
        src={thumbUrl}
        alt={photo.fileName}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Elegant, Unobtrusive Match Pill (Top-Right, does not block faces) */}
      {photo.matchScore && (
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#0a0705]/80 backdrop-blur-md border border-[#ffd700]/30 text-[10px] font-mono font-medium text-[#ffd700] shadow-sm flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-[#ffd700]" />
          <span>{Math.round(photo.matchScore * 100)}%</span>
        </div>
      )}

      {/* Hover Information & Quick Action Bar */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705]/95 via-[#0a0705]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
        <div className="text-xs font-heading font-medium text-[#f0e6d6] truncate max-w-[65%] drop-shadow">
          {photo.fileName}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadClick}
            title="Download high-resolution original"
            aria-label={`Download ${photo.fileName}`}
            className="p-1.5 rounded-md bg-[#1c130b]/90 hover:bg-[#ffd700] text-[#ffd700] hover:text-[#0a0705] border border-[#f39c12]/40 hover:border-[#ffd700] transition shadow-md"
          >
            {downloaded ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>

          <div
            title="View Fullscreen"
            className="p-1.5 rounded-md bg-[#ffd700] text-[#0a0705] hover:bg-white transition shadow-md"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

