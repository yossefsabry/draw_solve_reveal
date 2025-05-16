
import React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-30">
      <Button 
        className="bg-gray-800 p-2 rounded-md shadow-lg text-white hover:bg-gray-700 transition-colors" 
        onClick={onZoomIn} 
        aria-label="Zoom in"
        variant="ghost"
      >
        <ZoomIn size={20} />
      </Button>
      
      <Button 
        className="bg-gray-800 p-2 rounded-md shadow-lg text-white hover:bg-gray-700 transition-colors" 
        onClick={onZoomOut} 
        aria-label="Zoom out"
        variant="ghost"
      >
        <ZoomOut size={20} />
      </Button>
      
      <div className="text-center bg-gray-800 p-2 rounded-md shadow-lg text-sm font-semibold text-white">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default ZoomControls;
