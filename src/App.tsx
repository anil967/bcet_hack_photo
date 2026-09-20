import React, { useState, useRef } from 'react';
import { Camera, Shield, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { CameraCapture } from './components/CameraCapture';
import { LoadingProgress } from './components/LoadingProgress';
import { PhotoGallery } from './components/PhotoGallery';
import { LightboxModal } from './components/LightboxModal';
import { EmptyState } from './components/EmptyState';
import { ErrorAlert } from './components/ErrorAlert';
import { AppStage, AppError, PhotoItem, SearchPhotosResponse } from './types';
import { searchPhotos } from './services/photoService';

export default function App() {
  const [stage, setStage] = useState<AppStage>('initial');
  const [registrationId, setRegistrationId] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [idValidationMessage, setIdValidationMessage] = useState<string | null>(null);

  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeError, setActiveError] = useState<AppError | null>(null);

  // Stash response while loading animation plays
  const searchResultRef = useRef<SearchPhotosResponse | null>(null);

  // Handle ID input change
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegistrationId(value);
    if (idTouched) {
      if (!value.trim()) {
        setIdValidationMessage('Please enter your registration ID.');
      } else {
        setIdValidationMessage(null);
      }
    }
  };

  // Quick fill demo registration ID
  const handleUseExampleId = (idToUse = 'BCET2026-1024') => {
    setRegistrationId(idToUse);
    setIdTouched(true);
    setIdValidationMessage(null);
    setActiveError(null);
  };

  // Handle selfie capture
  const handleCaptureSelfie = (dataUrl: string) => {
    setSelfieImage(dataUrl);
    setActiveError(null);
  };

  // Handle retake
  const handleRetakeSelfie = () => {
    setSelfieImage(null);
    setActiveError(null);
  };

  // Submit flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdTouched(true);

    if (!registrationId.trim()) {
      setIdValidationMessage('Please enter your registration ID.');
      return;
    }

    if (!selfieImage) {
      return;
    }

    setIdValidationMessage(null);
    setActiveError(null);
    setStage('submitting');

    // Trigger API call in background while animation plays
    try {
      const response = await searchPhotos({
        registrationId: registrationId.trim(),
        selfie: selfieImage,
      });
      searchResultRef.current = response;
    } catch {
      searchResultRef.current = {
        success: false,
        count: 0,
        photos: [],
        errorCode: 'NETWORK_ERROR',
        error: 'Something went wrong',
      };
    }
  };

  // Called when LoadingProgress finishes its 4 visual steps
  const handleLoadingComplete = () => {
    const result = searchResultRef.current;

    if (!result) {
      // Fallback
      setStage('empty');
      return;
    }

    if (!result.success) {
      // Return to initial form and show specific error state
      setStage('initial');

      switch (result.errorCode) {
        case 'NO_FACE':
          setActiveError({
            type: 'no_face',
            title: "We couldn't detect your face",
            message: 'Make sure your face is clearly visible and try again.',
          });
          break;
        case 'MULTIPLE_FACES':
          setActiveError({
            type: 'multiple_faces',
            title: 'Please make sure only one person is visible',
            message: 'Only a single face should appear in the camera frame.',
          });
          break;
        case 'REGISTRATION_NOT_FOUND':
          setActiveError({
            type: 'invalid_id',
            title: 'Registration ID not found',
            message: 'Please check your registration ID and try again.',
          });
          break;
        case 'NETWORK_ERROR':
        default:
          setActiveError({
            type: 'network_error',
            title: 'Something went wrong',
            message: 'Please check your internet connection and try again.',
          });
          break;
      }
      return;
    }

    // Success response
    if (result.count === 0 || result.photos.length === 0) {
      setStage('empty');
      setPhotos([]);
    } else {
      setPhotos(result.photos);
      setStage('gallery');
    }
  };

  // Reset back to initial state
  const handleReset = () => {
    setStage('initial');
    setSelfieImage(null);
    setActiveError(null);
    setSelectedPhotoIndex(null);
  };

  const isSubmitDisabled = !registrationId.trim() || !selfieImage;

  return (
    <div className="min-h-screen bg-[#07090F] text-white flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Simple Header */}
      <Header onReset={handleReset} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* STATE 1: INITIAL STATE (The Form) */}
        {stage === 'initial' && (
          <div className="w-full max-w-xl mx-auto animate-in fade-in duration-300">
            {/* Active Error Banner if any */}
            {activeError && (
              <ErrorAlert
                error={activeError}
                onDismiss={() => setActiveError(null)}
                onRetry={() => setActiveError(null)}
              />
            )}

            {/* Main Centered Card */}
            <div className="bg-[#10131C] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
              {/* Subtle top accent border line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

              {/* Branding and Headings */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Find your event moments</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2.5">
                  Find Your Photos
                </h1>

                <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
                  Enter your registration ID and take a quick selfie to find photos from the event where you appear.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Registration ID Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="registrationId"
                      className="block text-sm font-semibold text-white tracking-wide"
                    >
                      Registration ID
                    </label>

                    {/* Quick Example link */}
                    <button
                      type="button"
                      onClick={() => handleUseExampleId('BCET2026-1024')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
                    >
                      Use example: BCET2026-1024
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="registrationId"
                      type="text"
                      value={registrationId}
                      onChange={handleIdChange}
                      onBlur={() => {
                        setIdTouched(true);
                        if (!registrationId.trim()) {
                          setIdValidationMessage('Please enter your registration ID.');
                        }
                      }}
                      placeholder="Enter your registration ID"
                      className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#0B0E17] border text-white placeholder-slate-500 text-sm sm:text-base transition-colors focus:outline-none focus:ring-2 ${
                        idValidationMessage
                          ? 'border-rose-500/60 focus:ring-rose-500/30'
                          : 'border-white/[0.08] focus:border-indigo-500/60 focus:ring-indigo-500/20'
                      }`}
                    />
                  </div>

                  {/* Validation message if empty */}
                  {idValidationMessage && (
                    <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
                      <span>•</span>
                      <span>{idValidationMessage}</span>
                    </p>
                  )}
                </div>

                {/* Selfie Section */}
                <CameraCapture
                  selfieImage={selfieImage}
                  onCapture={handleCaptureSelfie}
                  onRetake={handleRetakeSelfie}
                />

                {/* Submit Action Area */}
                <div className="pt-2 space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-xl cursor-pointer ${
                      isSubmitDisabled
                        ? 'bg-[#181D2A] text-slate-500 border border-white/[0.04] cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99]'
                    }`}
                  >
                    <span>Submit & Find My Photos</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Privacy Notice */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>🔒 Your selfie is used only to find your event photos.</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Subtle demo tester pills to test error states easily */}
            <div className="mt-8 text-center">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-2 font-medium">
                Prototype Test Cases
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleUseExampleId('BCET2026-1024')}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition"
                  title="Returns 24 matched photos"
                >
                  BCET2026-1024 (24 photos)
                </button>
                <button
                  type="button"
                  onClick={() => handleUseExampleId('TEST-EMPTY')}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition"
                  title="Simulates no photos found"
                >
                  TEST-EMPTY
                </button>
                <button
                  type="button"
                  onClick={() => handleUseExampleId('TEST-FACE')}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition"
                  title="Simulates no face detected"
                >
                  TEST-FACE
                </button>
                <button
                  type="button"
                  onClick={() => handleUseExampleId('TEST-MULTI')}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition"
                  title="Simulates multiple faces"
                >
                  TEST-MULTI
                </button>
                <button
                  type="button"
                  onClick={() => handleUseExampleId('TEST-INVALID')}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition"
                  title="Simulates registration ID not found"
                >
                  TEST-INVALID
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATE 2: SUBMITTING / LOADING STATE */}
        {stage === 'submitting' && (
          <LoadingProgress onComplete={handleLoadingComplete} />
        )}

        {/* STATE 3: PHOTO GALLERY RESULTS */}
        {stage === 'gallery' && (
          <PhotoGallery
            photos={photos}
            registrationId={registrationId}
            onSelectPhoto={(idx) => setSelectedPhotoIndex(idx)}
            onSearchAgain={handleReset}
          />
        )}

        {/* STATE 4: EMPTY STATE */}
        {stage === 'empty' && (
          <EmptyState
            onRetakeSelfie={() => {
              setSelfieImage(null);
              setStage('initial');
            }}
            onTryAgain={() => {
              setStage('initial');
            }}
          />
        )}
      </main>

      {/* Lightbox Modal (Fullscreen photo viewer) */}
      <LightboxModal
        photos={photos}
        selectedIndex={selectedPhotoIndex}
        onClose={() => setSelectedPhotoIndex(null)}
        onNavigate={(idx) => setSelectedPhotoIndex(idx)}
      />

      {/* Minimal Footer */}
      <footer className="w-full border-t border-white/[0.05] py-4 text-center text-xs text-slate-500">
        <p>PhotoFinder • Secure Event Photo Distribution System</p>
      </footer>
    </div>
  );
}
