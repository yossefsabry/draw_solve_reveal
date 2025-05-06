
import React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="absolute top-24 right-4 flex flex-col gap-2 z-30">
      <button 
        className="bg-white dark:bg-gray-700 p-2 rounded-md shadow-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
        onClick={onZoomIn}
        aria-label="Zoom in"
      >
        <ZoomIn size={18} />
      </button>
      <button 
        className="bg-white dark:bg-gray-700 p-2 rounded-md shadow-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
        onClick={onZoomOut}
        aria-label="Zoom out"
      >
        <ZoomOut size={18} />
      </button>
      <div className="text-center bg-white dark:bg-gray-700 p-2 rounded-md shadow-md text-xs font-mono">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default ZoomControls;
