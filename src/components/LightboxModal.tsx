import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Calendar, MapPin } from 'lucide-react';
import { PhotoItem } from '../types';

interface LightboxModalProps {
  photos: PhotoItem[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  selectedIndex,
  onClose,
  onNavigate,
}) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const total = photos.length;
  const currentPhoto = selectedIndex !== null && selectedIndex >= 0 && selectedIndex < total 
    ? photos[selectedIndex] 
    : null;

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    const prev = (selectedIndex - 1 + total) % total;
    onNavigate(prev);
  }, [selectedIndex, total, onNavigate]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    const next = (selectedIndex + 1) % total;
    onNavigate(next);
  }, [selectedIndex, total, onNavigate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  // Touch gesture swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> Prev
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Direct download handler
  const handleDownload = async () => {
    if (!currentPhoto) return;
    setIsDownloading(true);

    try {
      // Fetch blob to trigger standard file download
      const response = await fetch(currentPhoto.downloadUrl || currentPhoto.imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${currentPhoto.id || 'event-photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback direct navigation
      window.open(currentPhoto.downloadUrl || currentPhoto.imageUrl, '_blank');
    } finally {
      setTimeout(() => setIsDownloading(false), 600);
    }
  };

  if (!currentPhoto || selectedIndex === null) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#07090F]/95 backdrop-blur-xl flex flex-col justify-between animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div className="w-full h-16 px-4 sm:px-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        {/* Counter */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-xs sm:text-sm font-semibold tracking-wide text-white">
            {selectedIndex + 1} / {total}
          </span>
          {currentPhoto.title && (
            <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-xs md:max-w-md">
              {currentPhoto.title}
            </span>
          )}
        </div>

        {/* Action buttons: Download + Close */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium shadow-md transition active:scale-95 cursor-pointer"
            title="Download full resolution photo"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xs:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white border border-white/10 transition active:scale-95 cursor-pointer"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Area with Navigation Controls */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white backdrop-blur-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
          title="Previous photo (Arrow Left)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Large Photo */}
        <div className="max-w-full max-h-[75vh] sm:max-h-[82vh] flex items-center justify-center">
          <img
            key={currentPhoto.id}
            src={currentPhoto.imageUrl}
            alt={currentPhoto.title || `Event photo ${selectedIndex + 1}`}
            className="max-w-full max-h-[75vh] sm:max-h-[82vh] object-contain rounded-xl shadow-2xl border border-white/[0.08] animate-in zoom-in-95 duration-200"
          />
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white backdrop-blur-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
          title="Next photo (Arrow Right)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Bottom Metadata Bar */}
      <div className="w-full px-4 py-3 sm:px-6 z-20 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          {currentPhoto.session && (
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {currentPhoto.session}
            </span>
          )}
          {currentPhoto.timestamp && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentPhoto.timestamp}
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Use ← and → keys or swipe on mobile to navigate
        </span>
      </div>
    </div>
  );
};
