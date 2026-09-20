import React from 'react';
import { SearchX, Camera, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onRetakeSelfie: () => void;
  onTryAgain: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onRetakeSelfie,
  onTryAgain,
}) => {
  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 bg-[#10131C] border border-white/[0.08] rounded-2xl sm:rounded-3xl text-center flex flex-col items-center animate-in fade-in duration-300">
      {/* Calm, non-alarming iconography */}
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
        No matching photos found
      </h3>

      <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-sm">
        We couldn't find a matching photo. Try taking another selfie with better lighting.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onRetakeSelfie}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Retake Selfie</span>
        </button>

        <button
          type="button"
          onClick={onTryAgain}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-slate-200 hover:text-white text-sm font-medium transition active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};
