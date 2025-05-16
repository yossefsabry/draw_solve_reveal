
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
      {/* Only show panning indicator when space is pressed */}
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
