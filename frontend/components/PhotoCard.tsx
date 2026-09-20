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
      className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/50 transition-all duration-300 shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
    >
      {/* Skeleton loading shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse" />
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

      {/* Subtle match badge */}
      {photo.matchScore && (
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-zinc-950/75 backdrop-blur-md border border-white/10 text-[10px] font-medium text-indigo-300 opacity-90 group-hover:opacity-100 transition">
          Match
        </div>
      )}

      {/* Hover overlay with action buttons */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
        <div className="text-xs font-medium text-zinc-200 truncate max-w-[65%]">
          {photo.fileName}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadClick}
            title="Download photograph"
            aria-label={`Download ${photo.fileName}`}
            className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 backdrop-blur-md transition shadow"
          >
            {downloaded ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          <div
            title="View Fullscreen"
            className="p-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white backdrop-blur-md transition shadow"
          >
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
