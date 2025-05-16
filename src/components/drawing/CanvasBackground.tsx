
import React, { useEffect, useRef, useState } from "react";

interface CanvasBackgroundProps {
  scale: number;
  offset: { x: number; y: number };
  width: number;
  height: number;
  rulerSize: number;
}

const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ 
  scale, 
  offset, 
  width, 
  height,
  rulerSize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgPattern, setBgPattern] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    // Create a white background pattern with subtle grid
    const pattern = new Image();
    // Using a white/light gray grid pattern
    pattern.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmZmZmZmIiAvPgogIDxwYXRoIGQ9Ik0gMCAwIEwgNDAgNDAiIHN0cm9rZT0iI2YwZjBmMCIgc3Ryb2tlLXdpZHRoPSIxIiAvPgogIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgNDAiIHN0cm9rZT0iI2YwZjBmMCIgc3Ryb2tlLXdpZHRoPSIxIiAvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiNlMGUwZTAiIC8+Cjwvc3ZnPg==";
    
    pattern.onload = () => {
      setBgPattern(pattern);
      drawBackground();
    };
  }, []);

  useEffect(() => {
    if (bgPattern) {
      drawBackground();
    }
  }, [scale, offset, width, height, bgPattern]);

  // Draw background pattern
  const drawBackground = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !bgPattern) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    context.save();
    
    // Apply transformations for zoom/pan
    context.translate(offset.x, offset.y);
    context.scale(scale, scale);
    
    // Create pattern and fill
    const pattern = context.createPattern(bgPattern, "repeat");
    if (pattern) {
      context.fillStyle = pattern;
      // Fill a large area to ensure the pattern covers the viewport even when panned
      const width = canvas.width / scale;
      const height = canvas.height / scale;
      context.fillRect(-width, -height, width * 3, height * 3);
    }
    
    // Restore context state
    context.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 bg-white dark:bg-gray-800 canvas-container"
      style={{ 
        marginTop: rulerSize, 
        marginLeft: rulerSize,
        width: width - rulerSize,
        height: height - rulerSize 
      }}
      width={width - rulerSize}
      height={height - rulerSize}
    />
  );
};

export default CanvasBackground;
