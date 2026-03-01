"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PerspectiveGridProps {
  /** Additional CSS classes for the grid container */
  className?: string;
  /** Number of tiles per row/column (default: 40) */
  gridSize?: number;
  /** Whether to show the gradient overlay (default: true) */
  showOverlay?: boolean;
  /** Fade radius percentage for the gradient overlay (default: 80) */
  fadeRadius?: number;
}

const TILT_INTENSITY = 15;

export function PerspectiveGrid({
  className,
  gridSize = 40,
  showOverlay = true,
  fadeRadius = 80,
}: PerspectiveGridProps) {
  const [mounted, setMounted] = useState(false);
  const [tilt, setTilt] = useState({ x: 30, y: -5 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: 30 - y * TILT_INTENSITY,
      y: -5 + x * TILT_INTENSITY,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 30, y: -5 });
  }, []);

  const tiles = useMemo(() => Array.from({ length: gridSize * gridSize }), [gridSize]);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-white dark:bg-black",
        "[--fade-stop:#ffffff] dark:[--fade-stop:#000000]",
        className
      )}
      style={{
        perspective: "2000px",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute w-[80rem] aspect-square grid origin-center transition-transform duration-150 ease-out"
        style={{
          left: "50%",
          top: "50%",
          transform:
            `translate(-50%, -50%) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotateZ(20deg) scale(2)`,
          transformStyle: "preserve-3d",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {mounted &&
          tiles.map((_, i) => (
            <div
              key={i}
              className="tile min-h-[1px] min-w-[1px] border border-gray-300 dark:border-gray-700 bg-transparent transition-colors duration-[1500ms] hover:duration-0"
            />
          ))}
      </div>

      {showOverlay && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle, transparent 25%, var(--fade-stop) ${fadeRadius}%)`,
          }}
        />
      )}
    </div>
  );
}
