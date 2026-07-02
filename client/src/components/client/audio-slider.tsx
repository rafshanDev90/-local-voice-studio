"use client";

import { useCallback, useId } from "react";

interface AudioSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  leftLabel: string;
  rightLabel: string;
  onChange: (value: number) => void;
}

export function AudioSlider({
  label, value, min, max, step, leftLabel, rightLabel, onChange,
}: AudioSliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange],
  );

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-sm text-text-primary">
          {label}
        </label>
        <span className="text-xs tabular-nums text-text-secondary">
          {value.toFixed(1)}
        </span>
      </div>
      <div className="relative h-7">
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
          style={{ height: "3px" }}
        >
          <div className="h-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-text-primary transition-[width] duration-100"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 z-10 w-full cursor-pointer opacity-0"
        />
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2">
          <div
            className="relative mx-auto"
            style={{ width: "calc(100% - 12px)" }}
          >
            <div
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-300 bg-white shadow-sm transition-transform duration-100 hover:scale-110 active:scale-95"
              style={{ left: `${pct}%`, top: "50%" }}
            />
          </div>
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-2xs text-text-tertiary">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
