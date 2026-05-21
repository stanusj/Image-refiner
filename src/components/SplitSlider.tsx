import React, { useState, useRef, useEffect } from 'react';
import { ImageAdjustments } from '../types';
import { Eye, Sparkles } from 'lucide-react';

interface SplitSliderProps {
  imageSrc: string;
  adjustments: ImageAdjustments;
  className?: string;
  zoom: number; // percentage (e.g. 100)
}

export const SplitSlider: React.FC<SplitSliderProps> = ({
  imageSrc,
  adjustments,
  className = '',
  zoom,
}) => {
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up dragging handlers
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitRatio(ratio);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only handle left clicks or touches
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    handleMove(e.clientX);
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  // Setup styles for adjustments
  const filterString = [
    `brightness(${adjustments.brightness}%)`,
    `contrast(${adjustments.contrast}%)`,
    `saturate(${adjustments.saturation}%)`,
    `blur(${adjustments.blur / 2}px)`,
  ].join(' ');

  // Exposure uses opacity overlay in standard color terms or styling.
  // We can also model exposure via a mix of brightness/contrast or an overlay.
  // We'll also apply warmth tint and vignette.
  const getWarmthOverlayStyle = () => {
    const intensity = Math.abs(adjustments.warmth) / 250; // Max warmth is 50, so max opacity ~0.2
    if (adjustments.warmth === 0) return { display: 'none' };
    
    return {
      backgroundColor: adjustments.warmth > 0 ? '#ff8c00' : '#00bfff',
      opacity: intensity,
      mixBlendMode: 'color' as const,
    };
  };

  const getVignetteOverlayStyle = () => {
    const opacity = adjustments.vignette / 120; // max vignette 100, opacity ~0.83
    if (adjustments.vignette === 0) return { display: 'none' };

    return {
      background: `radial-gradient(circle, transparent 40%, rgba(0, 0, 0, ${opacity}) 100%)`,
    };
  };

  const getExposureOverlayStyle = () => {
    const value = adjustments.exposure - 100;
    if (value === 0) return { display: 'none' };
    
    return {
      backgroundColor: value > 0 ? '#ffffff' : '#000000',
      opacity: Math.abs(value) / 200, // up to 0.5 opacity for max exposure
      mixBlendMode: value > 0 ? ('screen' as const) : ('multiply' as const),
    };
  };

  const zoomStyle = {
    transform: `scale(${zoom / 100})`,
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <div
      id="split-workspace-slider"
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800/80 cursor-ew-resize ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      {/* 1. After (Processed Image) - Full background */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center" style={zoomStyle}>
          <img
            src={imageSrc}
            alt="Processed View"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none"
            style={{ filter: filterString }}
          />
          {/* Temperature/Warmth Filter Layer */}
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-75" 
            style={getWarmthOverlayStyle()} 
          />
          {/* Exposure Filter Layer */}
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-75" 
            style={getExposureOverlayStyle()} 
          />
          {/* Vignette Layer */}
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-75" 
            style={getVignetteOverlayStyle()} 
          />
        </div>
      </div>

      {/* 2. Before (Original Image) - Clipped Overlay */}
      <div
        className="absolute inset-o left-0 top-0 bottom-0 h-full overflow-hidden border-r border-transparent"
        style={{ width: `${splitRatio}%` }}
      >
        {/* Inside is the identical image dimensioned exactly matching the parent for pixel-matching alignment */}
        <div 
          className="absolute left-0 top-0 h-full overflow-hidden flex items-center justify-center"
          style={{ width: containerRef.current?.getBoundingClientRect().width || '100vw' }}
        >
          <div className="relative w-full h-full flex items-center justify-center" style={zoomStyle}>
            <img
              src={imageSrc}
              alt="Original Raw View"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Slider Interactive Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
        style={{ left: `${splitRatio}%` }}
      >
        {/* Slider Handle Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-neutral-200 flex items-center justify-center active:scale-95 transition-transform duration-100">
          <div className="flex gap-0.5 text-neutral-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-90">
              <path d="m18 15-6-6-6 6" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="-rotate-90">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. Tiny Badges for visual orientation */}
      <div className="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white/95 flex items-center gap-1.5 pointer-events-none">
        <Eye size={12} className="text-neutral-400" />
        <span>Before / Original</span>
      </div>
      <div className="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-md bg-white/95 shadow-lg text-xs font-semibold text-neutral-900 flex items-center gap-1.5 pointer-events-none">
        <Sparkles size={12} className="text-amber-600 fill-amber-300" />
        <span>After / Touch-Up</span>
      </div>

      {/* Overlay guide overlay when dragging */}
      {isDragging && (
        <div className="absolute inset-0 bg-transparent pointer-events-none z-10" />
      )}
    </div>
  );
};
