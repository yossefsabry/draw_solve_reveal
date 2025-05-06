
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
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg text-sm z-30 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Zoom:</span> Scroll wheel
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Pan:</span> Space + Drag
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Current zoom:</span> {Math.round(scale * 100)}%
        </div>
      </div>
      
      {/* Show panning indicator when space is pressed */}
      {isPanning && (
        <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg z-30 flex items-center gap-3 animate-pulse">
          <Move size={20} />
          <span className="text-base font-medium">Panning Mode</span>
        </div>
      )}
    </>
  );
};

export default CanvasOverlays;
