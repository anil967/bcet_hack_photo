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

    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);

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
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
      {/* Video Frame: Max height calibrated for mobile screens */}
      <div className="relative w-full aspect-[3/4] max-h-[50vh] sm:max-h-[58vh] bg-[#0c0805] rounded-sm border-2 border-[#f39c12]/45 shadow-[0_10px_35px_rgba(0,0,0,0.95)] overflow-hidden flex items-center justify-center">
        {permissionError ? (
          <div className="p-5 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-semibold text-[#f8f5ee]">Camera Access Required</h3>
            <p className="text-xs text-[#c9bba8] leading-relaxed max-w-xs">{permissionError}</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full max-w-xs">
              <button
                type="button"
                onClick={startCamera}
                className="w-full px-3 py-2 text-xs font-heading tracking-wider odyssey-secondary-btn"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 text-xs font-heading tracking-wider gold-action-btn flex items-center justify-center gap-1.5"
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

            {/* Golden Face Guide Oval: Clean, unobtrusive glowing biometric reticle */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[62%] max-w-[200px] aspect-[3/4] rounded-[50%] border-2 border-dashed border-[#ffd700]/80 shadow-[0_0_25px_rgba(255,215,0,0.35)] animate-pulse-slow" />
            </div>

            {/* Top right camera toggle */}
            {hasMultipleCameras && (
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={toggleCamera}
                  title="Switch Camera"
                  aria-label="Switch Camera"
                  className="p-2 rounded-full bg-[#140d07]/80 hover:bg-[#23170d] text-[#ffd700] border border-[#f39c12]/40 backdrop-blur-md transition shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Camera Controls Bar (Directly beneath camera frame for zero scrolling) */}
      <div className="w-full flex items-center justify-center gap-5 mt-4">
        {/* Upload file fallback */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload from device"
          aria-label="Upload photo from device"
          className="p-3 rounded-full bg-[#140d07] hover:bg-[#23170d] text-[#ffd700] border border-[#f39c12]/45 transition hover:border-[#ffd700] shadow-md"
        >
          <Upload className="w-5 h-5" />
        </button>

        {/* Primary Shutter Button with HackOdyssey Spartan Medallion */}
        <button
          type="button"
          onClick={handleCapture}
          disabled={!isReady}
          aria-label="Take Selfie"
          title="Take Selfie"
          className="relative group p-1 rounded-full bg-gradient-to-tr from-[#b78103]/50 via-[#ffd700]/70 to-[#f39c12]/50 hover:from-[#ffd700] hover:to-[#ffd700] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(243,156,18,0.5),0_6px_20px_rgba(0,0,0,0.8)] active:scale-90 hover:scale-105"
        >
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#ffd700] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] bg-[#140c06]">
            <img
              src="/odyssey_shutter.png"
              alt="Capture Selfie"
              className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
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
            className="p-3 rounded-full bg-[#140d07] hover:bg-[#23170d] text-[#ffd700] border border-[#f39c12]/45 transition hover:border-[#ffd700] shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-11 h-11" />
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
