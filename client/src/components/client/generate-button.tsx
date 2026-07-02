"use client";

import { GoDownload } from "react-icons/go";

export function GenerateButton({
  onGenerate,
  isDisabled,
  isLoading,
  showDownload,
  creditsRemaining,
  characterCount,
  characterLimit,
  buttonText = "Generate Speech",
  className,
  fullWidth,
  showCharacterCount,
  showCredits,
}: {
  onGenerate: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  showDownload?: boolean;
  creditsRemaining: number;
  characterCount?: number;
  characterLimit?: number;
  buttonText?: string;
  className?: string;
  fullWidth?: boolean;
  showCharacterCount?: boolean;
  showCredits?: boolean;
}) {
  return (
    <div
      className={`flex w-full flex-col-reverse items-center gap-3 md:flex-row md:justify-between ${className ?? ""}`}
    >
      <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 md:w-auto">
        {showCredits && (
          <span className="text-xs text-text-tertiary">
            {creditsRemaining.toLocaleString()} credits remaining
          </span>
        )}
        {showCharacterCount &&
          characterCount !== undefined &&
          characterLimit !== undefined && (
            <span className="text-xs text-text-tertiary">
              <span className="tabular-nums">{characterCount}</span>
              <span className="mx-px">/</span>
              <span className="tabular-nums">{characterLimit}</span>
              <span className="ml-1 hidden sm:inline">characters</span>
            </span>
          )}
      </div>

      <div
        className={`flex items-center gap-3 ${fullWidth ? "w-full" : "w-full md:w-auto"}`}
      >
        {showDownload && (
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-tertiary transition-colors hover:bg-surface-secondary disabled:opacity-40"
            type="button"
            disabled
          >
            <GoDownload className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={onGenerate}
          disabled={isDisabled || isLoading}
          className="relative h-9 w-full overflow-hidden rounded-lg bg-text-primary px-4 text-sm font-medium text-white transition-all duration-150 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-1 w-1 animate-pulse-dot rounded-full bg-white/70" style={{ animationDelay: "0ms" }} />
              <span className="h-1 w-1 animate-pulse-dot rounded-full bg-white/70" style={{ animationDelay: "200ms" }} />
              <span className="h-1 w-1 animate-pulse-dot rounded-full bg-white/70" style={{ animationDelay: "400ms" }} />
            </span>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </div>
  );
}
