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
    <div className="w-full max-w-md mx-auto">
      {/* Video Frame */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-[#0c0805] rounded-none border-2 border-[#f39c12]/40 shadow-[0_12px_45px_rgba(0,0,0,0.95)] overflow-hidden flex items-center justify-center">
        {permissionError ? (
          <div className="p-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-[#f8f5ee]">Camera Access Required</h3>
            <p className="text-sm text-[#c9bba8] leading-relaxed max-w-xs">{permissionError}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 text-xs font-heading tracking-wider odyssey-secondary-btn rounded-none"
              >
                Try Camera Again
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-heading tracking-wider gold-action-btn rounded-none flex items-center justify-center gap-2"
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

            {/* Golden Face Guide Oval */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-[50%] border-2 border-dashed border-[#ffd700]/70 shadow-[0_0_30px_rgba(243,156,18,0.35)] flex flex-col items-center justify-between py-6">
                <span className="text-[11px] font-heading font-semibold uppercase tracking-[0.16em] text-[#ffd700] bg-[#0c0805]/90 px-3 py-1 border border-[#f39c12]/50 backdrop-blur-sm">
                  Position Face Here
                </span>
                <span className="text-[10px] font-heading tracking-wider text-[#d4b96a] bg-[#0c0805]/85 px-2.5 py-0.5 border border-[#f39c12]/30">
                  Single person only
                </span>
              </div>
            </div>

            {/* Camera Switch button */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  title="Switch Camera"
                  aria-label="Switch Camera"
                  className="p-2.5 bg-[#140d07]/80 hover:bg-[#23170d] text-[#ffd700] border border-[#f39c12]/40 backdrop-blur-md transition shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bottom Shutter & Upload Controls */}
            <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6 px-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload from device"
                aria-label="Upload photo from device"
                className="p-3.5 bg-[#140d07]/80 hover:bg-[#23170d] text-[#ffd700] border border-[#f39c12]/40 backdrop-blur-md transition hover:border-[#ffd700]"
              >
                <Upload className="w-5 h-5" />
              </button>

              {/* Shutter Button with Golden Beacon Ring */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isReady}
                aria-label="Take Selfie"
                className="relative group p-1.5 rounded-full bg-[#f39c12]/30 hover:bg-[#f39c12]/50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(243,156,18,0.4)]"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffd700] via-[#f39c12] to-[#b78103] flex items-center justify-center shadow-lg group-hover:scale-95 transition-transform">
                  <div className="w-13 h-13 rounded-full border border-[#0a0705] bg-[#0a0705] flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#ffd700]" />
                  </div>
                </div>
              </button>

              <div className="w-12 h-12" />
            </div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#a89680] text-center font-heading tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
        <span>Your selfie is used solely to discover your Odyssey photos and is never stored.</span>
      </div>
    </div>
  );
}
