"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { RefreshCw, Upload, AlertCircle, Sparkles } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onError: (code: string, message: string) => void;
}

export function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isReady, setIsReady] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsReady(false);
    setPermissionError(null);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = "Camera API is not supported by your browser. Please upload a photo instead.";
      setPermissionError(msg);
      onError("CAMERA_NOT_SUPPORTED", msg);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => setIsReady(true)).catch(() => {});
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      let msg = "Camera access is required. Please allow camera permissions in your browser.";
      let code = "CAMERA_PERMISSION_DENIED";

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        msg = "Camera permission was denied. Please update your browser site settings.";
        code = "CAMERA_PERMISSION_DENIED";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        msg = "No camera found on this device. You can upload a selfie below.";
        code = "CAMERA_NOT_FOUND";
      }

      setPermissionError(msg);
      onError(code, msg);
    }
  }, [facingMode, onError]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Helper to downscale large uploaded photos to max 800px for instant upload
  const resizeImageToMax = (dataUrl: string, maxDim = 800, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleCapture = () => {
    if (!videoRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;

    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;

    // Downscale if camera stream is ultra-high res (4K/1080p) to keep upload under 80KB
    const maxDim = 800;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    onCapture(dataUrl);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("INVALID_IMAGE", "Please select a valid JPEG or PNG image file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      onError("IMAGE_TOO_LARGE", "Image file exceeds maximum 15MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        // Downscale uploaded image client-side to ~60KB for instant network transmission
        const optimized = await resizeImageToMax(reader.result, 800, 0.82);
        onCapture(optimized);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
      {/* Video Frame: Clean modern rounded card with subtle hairline border */}
      <div className="relative w-full aspect-[3/4] max-h-[50vh] sm:max-h-[58vh] bg-neutral-950 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex items-center justify-center">
        {permissionError ? (
          <div className="p-5 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Camera Access Required</h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">{permissionError}</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full max-w-xs">
              <button
                type="button"
                onClick={startCamera}
                className="w-full px-3 py-2 text-xs font-medium odyssey-secondary-btn"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 text-xs font-medium gold-action-btn flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                facingMode === "user" ? "-scale-x-100" : ""
              } ${isReady ? "opacity-100" : "opacity-0"}`}
            />

            {/* Minimalist Face Reticle: Clean, ultra-crisp subtle guide without neon glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[60%] max-w-[200px] aspect-[3/4] rounded-full border-2 border-dashed border-white/30" />
            </div>

            {/* Top right camera toggle */}
            {hasMultipleCameras && (
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={toggleCamera}
                  title="Switch Camera"
                  aria-label="Switch Camera"
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-neutral-700/80 backdrop-blur-md transition shadow-md active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Camera Controls Bar: Neatly structured and balanced */}
      <div className="w-full flex items-center justify-center gap-5 mt-4">
        {/* Upload file fallback */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload photo from device"
          aria-label="Upload photo from device"
          className="p-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition active:scale-95 shadow-md"
        >
          <Upload className="w-5 h-5" />
        </button>

        {/* Primary Shutter Button with HackOdyssey Spartan Medallion (Clean natural ring, zero neon blur) */}
        <button
          type="button"
          onClick={handleCapture}
          disabled={!isReady}
          aria-label="Take Selfie"
          title="Take Selfie"
          className="relative group p-1 rounded-full bg-neutral-800 border-2 border-neutral-600 hover:border-neutral-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg active:scale-95"
        >
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden flex items-center justify-center bg-neutral-950 border border-neutral-700">
            <img
              src="/odyssey_shutter.png"
              alt="Take Selfie"
              className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
            />
          </div>
        </button>

        {/* Symmetrical placeholder / camera switch on mobile */}
        {hasMultipleCameras ? (
          <button
            type="button"
            onClick={toggleCamera}
            title="Switch Camera"
            aria-label="Switch Camera"
            className="p-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition active:scale-95 shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}
      </div>


      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}
