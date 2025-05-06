
import React from "react";
import { Move } from "lucide-react";

interface CanvasOverlaysProps {
  isPanning: boolean;
  scale: number;
}

const CanvasOverlays: React.FC<CanvasOverlaysProps> = ({
  isPanning,
  scale,
}) => {
  return (
    <>
      {/* Zoom/Pan info tooltip */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-xs z-30 opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 mb-1">
          <span className="font-semibold">Zoom:</span> Scroll
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold">Pan:</span> Space + Drag
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="font-semibold">Current zoom:</span> {Math.round(scale * 100)}%
        </div>
      </div>
      
      {/* Show panning indicator when space is pressed */}
      {isPanning && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md z-30 flex items-center gap-2">
          <Move size={16} />
          <span className="text-sm">Panning</span>
        </div>
      )}
    </>
  );
};

export default CanvasOverlays;
