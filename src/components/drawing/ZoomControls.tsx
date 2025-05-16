
import React, { useState, useEffect, KeyboardEvent } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (newScale: number) => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onZoomChange
}) => {
  const [zoomValue, setZoomValue] = useState<string>(Math.round(scale * 100).toString());
  const isMobile = useIsMobile();
  
  // Update the input field when scale prop changes
  useEffect(() => {
    setZoomValue(Math.round(scale * 100).toString());
  }, [scale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyZoomChange();
    }
  };
  
  const applyZoomChange = () => {
    const newZoomValue = parseInt(zoomValue, 10);
    if (!isNaN(newZoomValue) && newZoomValue > 0) {
      // Convert percentage to scale factor (e.g., 100% -> 1.0)
      onZoomChange(newZoomValue / 100);
    } else {
      // Reset to current scale if invalid input
      setZoomValue(Math.round(scale * 100).toString());
    }
  };

  // Ensure direct button clicks work properly
  const handleZoomInClick = () => {
    onZoomIn();
  };

  const handleZoomOutClick = () => {
    onZoomOut();
  };

  const positionClass = isMobile ? "bottom-24" : "bottom-20";

  return (
    <div className={`fixed ${positionClass} left-4 flex flex-col gap-2 z-30`}>
      <Button 
        className="bg-gray-800 p-2 rounded-md shadow-lg text-white hover:bg-gray-700 transition-colors" 
        onClick={handleZoomInClick} 
        aria-label="Zoom in"
        variant="ghost"
        size="icon"
      >
        <ZoomIn size={20} />
      </Button>
      
      <Button 
        className="bg-gray-800 p-2 rounded-md shadow-lg text-white hover:bg-gray-700 transition-colors" 
        onClick={handleZoomOutClick} 
        aria-label="Zoom out"
        variant="ghost"
        size="icon"
      >
        <ZoomOut size={20} />
      </Button>
      
      <Input
        type="text"
        className="w-16 text-center bg-gray-800 text-white border-none p-2"
        value={zoomValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={applyZoomChange}
        aria-label="Zoom percentage"
      />
    </div>
  );
};

export default ZoomControls;
