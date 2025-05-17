
import React from "react";

interface GuideLinesProps {
  cursorPosition: { x: number; y: number } | null;
  scale: number;
  offset: { x: number; y: number };
  rulerSize: number;
  canvasWidth: number;
  canvasHeight: number;
}

const GuideLines: React.FC<GuideLinesProps> = ({
  cursorPosition,
  scale,
  offset,
  rulerSize,
  canvasWidth,
  canvasHeight
}) => {
  // Don't render guidelines if no cursor position
  if (!cursorPosition) {
    return null;
  }

  // Calculate the actual position with transform
  const actualX = cursorPosition.x * scale + offset.x;
  const actualY = cursorPosition.y * scale + offset.y;

  return (
    <>
      {/* Vertical guide line */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: actualX + rulerSize,
          top: rulerSize,
          width: '1px',
          height: canvasHeight,
          backgroundColor: 'rgba(255, 100, 100, 0.8)', // Bright red with opacity
          boxShadow: '0 0 2px #fff' // White glow for better visibility
        }}
      />
      
      {/* Horizontal guide line */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: rulerSize,
          top: actualY + rulerSize,
          height: '1px',
          width: canvasWidth,
          backgroundColor: 'rgba(255, 100, 100, 0.8)', // Bright red with opacity
          boxShadow: '0 0 2px #fff' // White glow for better visibility
        }}
      />
    </>
  );
};

export default GuideLines;
