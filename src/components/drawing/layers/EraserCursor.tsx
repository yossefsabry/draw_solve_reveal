
import React from "react";

interface EraserCursorProps {
  cursorPosition: { x: number; y: number } | null | undefined;
  brushSize: number;
  scale: number;
  offset: { x: number; y: number };
}

const EraserCursor: React.FC<EraserCursorProps> = ({ 
  cursorPosition, 
  brushSize, 
  scale,
  offset
}) => {
  if (!cursorPosition) return null;
  
  // Calculate the centered position
  const left = cursorPosition.x * scale + offset.x;
  const top = cursorPosition.y * scale + offset.y;
  
  return (
    <div 
      className="absolute pointer-events-none z-20 border-2 border-white rounded-full opacity-70"
      style={{
        width: brushSize * 2 * scale,
        height: brushSize * 2 * scale,
        transform: 'translate(-50%, -50%)',
        left: `${left}px`,
        top: `${top}px`,
        boxShadow: '0 0 3px rgba(0,0,0,0.5)' // Add slight shadow for better visibility
      }}
    />
  );
};

export default EraserCursor;
