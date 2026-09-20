import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';
import { AppError } from '../types';

interface ErrorAlertProps {
  error: AppError;
  onDismiss: () => void;
  onRetry: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onDismiss,
  onRetry,
}) => {
  return (
    <div className="w-full bg-[#1A1118] border border-rose-500/30 rounded-2xl p-4 sm:p-5 text-left mb-6 relative animate-in fade-in duration-200">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="flex-1 pr-6">
          <h4 className="text-sm sm:text-base font-semibold text-rose-200 tracking-tight">
            {error.title}
          </h4>
          <p className="text-xs sm:text-sm text-rose-300/80 mt-1 leading-relaxed">
            {error.message}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-100 text-xs font-medium transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-rose-400/60 hover:text-rose-200 hover:bg-rose-500/10 transition cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
