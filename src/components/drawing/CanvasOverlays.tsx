
import React from "react";
import { Move } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CanvasOverlaysProps {
  isPanning: boolean;
  scale: number;
}

const CanvasOverlays: React.FC<CanvasOverlaysProps> = ({
  isPanning,
  scale,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      {/* Zoom/Pan info tooltip - only visible on desktop */}
      {!isMobile && (
        <div className="fixed bottom-24 left-4 bg-gray-800 p-3 rounded-md shadow-lg text-sm z-30 opacity-80 hover:opacity-100 transition-opacity text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white">Zoom:</span> Scroll wheel
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white">Pan:</span> Space + Drag
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Current zoom:</span> {Math.round(scale * 100)}%
          </div>
        </div>
      )}
      
      {/* Show panning indicator when space is pressed */}
      {isPanning && (
        <div className="fixed bottom-32 left-4 bg-gray-800 p-3 rounded-md shadow-lg z-30 flex items-center gap-3 animate-pulse text-white">
          <Move size={20} />
          <span className="text-base font-medium">Panning Mode</span>
        </div>
      )}
    </>
  );
};

export default CanvasOverlays;
