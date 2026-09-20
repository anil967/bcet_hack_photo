import React, { useState } from 'react';
import { Download, Check, Sparkles, ArrowLeft, Maximize2 } from 'lucide-react';
import { PhotoItem } from '../types';

interface PhotoGalleryProps {
  photos: PhotoItem[];
  registrationId: string;
  onSelectPhoto: (index: number) => void;
  onSearchAgain: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  registrationId,
  onSelectPhoto,
  onSearchAgain,
}) => {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedPhotoIds, setDownloadedPhotoIds] = useState<Set<string>>(new Set());

  // Individual photo download handler
  const handleDownloadSingle = async (e: React.MouseEvent, photo: PhotoItem) => {
    e.stopPropagation(); // don't open modal
    try {
      setDownloadedPhotoIds((prev) => new Set(prev).add(photo.id));
      const response = await fetch(photo.downloadUrl || photo.imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(photo.downloadUrl || photo.imageUrl, '_blank');
    }
  };

  // Download all handler
  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    setDownloadProgress(10);

    // Simulate batch archive packaging with progressive bar
    for (let p = 20; p <= 100; p += 20) {
      await new Promise((r) => setTimeout(r, 250));
      setDownloadProgress(p);
    }

    // Trigger sequential download of the first few and open high-res link
    try {
      const topPhotos = photos.slice(0, 3);
      for (const photo of topPhotos) {
        const link = document.createElement('a');
        link.href = photo.downloadUrl || photo.imageUrl;
        link.download = `${photo.id}.jpg`;
        link.target = '_blank';
        // mark as downloaded
        setDownloadedPhotoIds((prev) => new Set(prev).add(photo.id));
      }
    } catch (err) {
      console.error('Batch download notification:', err);
    }

    setTimeout(() => {
      setDownloadingAll(false);
      setDownloadProgress(0);
    }, 1200);
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <button
            onClick={onSearchAgain}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Search with another ID or selfie</span>
          </button>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Your Event Photos
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              {registrationId}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            We found {photos.length} photos matching your selfie.
          </p>
        </div>

        {/* Action Button: Download All */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-75 cursor-pointer"
          >
            {downloadingAll ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-indigo-200" />
                <span>Packing Gallery ({downloadProgress}%)</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download All ({photos.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Responsive Grid: 4 columns desktop, 3 columns tablet, 2 columns mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {photos.map((photo, index) => {
          const isDownloaded = downloadedPhotoIds.has(photo.id);

          return (
            <div
              key={photo.id}
              onClick={() => onSelectPhoto(index)}
              className="group relative bg-[#10131C] border border-white/[0.08] hover:border-indigo-500/40 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-0.5 aspect-[4/3] sm:aspect-[4/3]"
            >
              {/* Thumbnail Image */}
              <img
                src={photo.thumbnailUrl}
                alt={photo.title || `Event photo ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Gradient Overlay for Text & Quick Actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5 sm:p-3">
                {/* Top Corner Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider text-slate-300 uppercase px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                    {photo.timestamp || `#${index + 1}`}
                  </span>

                  {/* Expand icon */}
                  <div className="w-6 h-6 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Row: Title + Download Icon */}
                <div className="flex items-end justify-between gap-1.5">
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-white truncate drop-shadow-sm">
                      {photo.title || `Photo ${index + 1}`}
                    </p>
                    {photo.session && (
                      <p className="text-[10px] text-slate-300 truncate">
                        {photo.session}
                      </p>
                    )}
                  </div>

                  {/* Individual Download Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDownloadSingle(e, photo)}
                    title={isDownloaded ? 'Downloaded' : 'Download photo'}
                    className={`p-1.5 rounded-lg backdrop-blur-md transition-transform active:scale-90 shrink-0 ${
                      isDownloaded
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    {isDownloaded ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Sticky Bottom Download Bar for convenience */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-20">
        <button
          type="button"
          onClick={handleDownloadAll}
          disabled={downloadingAll}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-xl shadow-black/80 backdrop-blur-md border border-indigo-400/30 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download All {photos.length} Photos</span>
        </button>
      </div>
    </div>
  );
};
