"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, Upload, AlertCircle, Sparkles } from "lucide-react";

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

  // Check device camera count
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Initialize or restart camera
  const startCamera = useCallback(async () => {
    setIsReady(false);
    setPermissionError(null);

    // Stop existing stream if any
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
      // Clean up stream on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Capture frame to canvas and export base64 JPEG
  const handleCapture = () => {
    if (!videoRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If facing user, mirror horizontally for natural selfie photo
    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Export compressed JPEG under 1.5MB
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);

    // Stop tracks after capture
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    onCapture(dataUrl);
  };

  // Switch between front and back camera
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // File fallback upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("INVALID_IMAGE", "Please select a valid JPEG or PNG image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError("IMAGE_TOO_LARGE", "Image file exceeds maximum 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        onCapture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Video Container */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
        {permissionError ? (
          <div className="p-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100">Camera Access Required</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">{permissionError}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition"
              >
                Try Camera Again
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Selfie
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

            {/* Face Guide Oval */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-[50%] border-2 border-dashed border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.25)] flex flex-col items-center justify-between py-6">
                <span className="text-[11px] font-medium uppercase tracking-wider text-indigo-300 bg-zinc-950/80 px-3 py-1 rounded-full border border-indigo-500/30 backdrop-blur-sm">
                  Position Face Here
                </span>
                <span className="text-[10px] text-zinc-400 bg-zinc-950/70 px-2.5 py-0.5 rounded-full">
                  Single person only
                </span>
              </div>
            </div>

            {/* Top Toolbar overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  title="Switch Camera"
                  aria-label="Switch Camera"
                  className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6 px-6">
              {/* File upload fallback button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload from device"
                aria-label="Upload photo from device"
                className="p-3.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition"
              >
                <Upload className="w-5 h-5" />
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isReady}
                aria-label="Take Selfie"
                className="relative group p-1 rounded-full bg-white/20 hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-95 transition-transform">
                  <div className="w-14 h-14 rounded-full border-2 border-zinc-950 bg-white flex items-center justify-center">
                    <Camera className="w-6 h-6 text-zinc-900" />
                  </div>
                </div>
              </button>

              {/* Spacer for symmetrical layout */}
              <div className="w-12 h-12" />
            </div>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Privacy note */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400 text-center">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>Your selfie is used only to find your event photos and is never stored.</span>
      </div>
    </div>
  );
}
