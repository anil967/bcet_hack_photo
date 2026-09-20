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

  const thumbUrl = getFullPhotoUrl(photo.thumbnailUrl);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(photo);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(photo, index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(photo, index);
        }
      }}
      aria-label={`View photo ${photo.fileName}`}
      className="group relative aspect-square rounded-none overflow-hidden bg-[#0c0805] border border-[#f39c12]/30 hover:border-[#ffd700] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(243,156,18,0.35)] focus:outline-none focus:ring-2 focus:ring-[#ffd700] cursor-pointer"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#140c06] via-[#24150b] to-[#140c06] animate-pulse" />
      )}

      <img
        src={thumbUrl}
        alt={photo.fileName}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Gold Match badge */}
      {photo.matchScore && (
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#0a0705]/85 backdrop-blur-md border border-[#ffd700]/50 text-[10px] font-heading tracking-wider font-semibold text-[#ffd700]">
          ODYSSEY MATCH
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705]/95 via-[#0a0705]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
        <div className="text-xs font-heading font-medium text-[#e0d5c1] truncate max-w-[65%]">
          {photo.fileName}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadClick}
            title="Download photograph"
            aria-label={`Download ${photo.fileName}`}
            className="p-2 bg-[#1c130b] hover:bg-[#2e1d0f] text-[#ffd700] border border-[#f39c12]/40 transition shadow"
          >
            {downloaded ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          <div
            title="View Fullscreen"
            className="p-2 gold-action-btn transition shadow"
          >
            <Maximize2 className="w-4 h-4 text-[#0a0705]" />
          </div>
        </div>
      </div>
    </div>
  );
}
