import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Upload, SwitchCamera } from 'lucide-react';

interface CameraCaptureProps {
  selfieImage: string | null;
  onCapture: (imageData: string) => void;
  onRetake: () => void;
  disabled?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  selfieImage,
  onCapture,
  onRetake,
  disabled = false,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Open camera stream
  const startCamera = async (overrideFacing?: 'user' | 'environment') => {
    setPermissionDenied(false);
    setErrorMessage(null);
    const targetFacing = overrideFacing || facingMode;

    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser environment');
      }

      // Stop previous stream if any
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.error('Failed to auto-play video:', err);
          });
        };
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setPermissionDenied(true);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setErrorMessage('Camera access was denied. Please allow camera permissions in browser settings.');
      } else {
        setErrorMessage('Could not connect to camera. You can try again or upload a photo directly.');
      }
    }
  };

  // Flip camera if multiple cameras are available
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame from video to canvas
  const handleCapture = () => {
    if (!videoRef.current) return;

    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // If front camera, mirror horizontally just like preview
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopCamera();
      onCapture(dataUrl);
    }
  };

  // Manual file upload fallback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        stopCamera();
        onCapture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Take a Selfie
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Make sure your face is clearly visible and you have good lighting.
          </p>
        </div>
      </div>

      {/* Camera Box Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#0B0E17] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-200 shadow-inner">
        {/* Shutter flash effect */}
        {isShutterFlashing && (
          <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
        )}

        {/* STATE 1: Selfie Captured */}
        {selfieImage ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black/40">
            <img
              src={selfieImage}
              alt="Captured selfie"
              className="w-full h-full object-cover"
            />
            {/* Overlay banner */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10131C]/90 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium backdrop-blur-md shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Selfie captured ✓</span>
            </div>

            {/* Retake Button Floating at bottom */}
            <div className="absolute bottom-3 left-0 right-0 px-4 flex justify-center z-20">
              <button
                type="button"
                onClick={() => {
                  onRetake();
                  startCamera();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10131C]/90 hover:bg-[#1A1F2C] border border-white/10 text-slate-200 hover:text-white text-xs sm:text-sm font-medium backdrop-blur-md transition shadow-md active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Retake</span>
              </button>
            </div>
          </div>
        ) : isCameraActive ? (
          /* STATE 2: Live Camera Stream */
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Subtle Face-Position Guide: Four Corner Brackets */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="relative w-44 h-52 sm:w-56 sm:h-64 border border-transparent">
                {/* Top-Left Bracket */}
                <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-indigo-400/80 rounded-tl-lg" />
                {/* Top-Right Bracket */}
                <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-indigo-400/80 rounded-tr-lg" />
                {/* Bottom-Left Bracket */}
                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-indigo-400/80 rounded-bl-lg" />
                {/* Bottom-Right Bracket */}
                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-indigo-400/80 rounded-br-lg" />

                {/* Gentle center guide label */}
                <div className="absolute -bottom-7 left-0 right-0 text-center">
                  <span className="text-[11px] font-medium text-white/70 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Position your face within the frame
                  </span>
                </div>
              </div>
            </div>

            {/* Controls over camera: Switch Camera button */}
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={toggleFacingMode}
                title="Switch camera"
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-white backdrop-blur-md transition active:scale-95"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Floating Action: Capture Selfie */}
            <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center justify-center gap-3 z-20">
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-2 rounded-xl bg-black/50 hover:bg-black/70 border border-white/10 text-slate-300 hover:text-white text-xs font-medium backdrop-blur-md transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCapture}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Selfie</span>
              </button>
            </div>
          </div>
        ) : permissionDenied ? (
          /* STATE 3: Camera Permission Denied */
          <div className="p-6 text-center max-w-sm flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-white mb-1">
              Camera access is required
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Please allow camera access in your browser settings and try again.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <button
                type="button"
                onClick={() => startCamera()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium transition cursor-pointer active:scale-95"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs sm:text-sm font-medium transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Selfie</span>
              </button>
            </div>
          </div>
        ) : (
          /* STATE 4: Initial Pre-Permission State */
          <div className="p-6 text-center max-w-xs flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-300 mb-3 group-hover:scale-105 transition">
              <Camera className="w-7 h-7 text-indigo-400" />
            </div>

            <div className="space-y-1 mb-4">
              <span className="text-sm font-semibold text-white block">
                Take a Selfie
              </span>
              <span className="text-xs text-slate-400 block">
                Camera access required
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                disabled={disabled}
                onClick={() => startCamera()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera</span>
              </button>

              {/* Upload fallback */}
              <button
                type="button"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-slate-400 hover:text-slate-200 py-1 transition flex items-center justify-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Or upload selfie from files</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden file input for fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
