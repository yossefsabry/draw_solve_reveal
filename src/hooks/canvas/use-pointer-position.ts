
import { useState } from "react";

export const usePointerPosition = (scale: number, offset: { x: number; y: number }) => {
  const [cursorPosition, setCursorPosition] = useState<{ x: number, y: number } | null>(null);

  // Helper to get pointer position for both mouse and touch events with zoom/pan adjustments
  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent, lastPos?: { x: number; y: number } | null) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return lastPos || { x: 0, y: 0 };
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Adjust for zoom and pan
    const x = (clientX - rect.left - offset.x) / scale;
    const y = (clientY - rect.top - offset.y) / scale;
    
    return { x, y };
  };

  // Method to update cursor position
  const updateCursorPosition = (pos: { x: number, y: number } | null) => {
    setCursorPosition(pos);
  };

  // Handle mouse leave events
  const handleMouseLeave = () => {
    setCursorPosition(null);
  };

  return {
    cursorPosition,
    getPointerPosition,
    updateCursorPosition,
    handleMouseLeave
  };
};
