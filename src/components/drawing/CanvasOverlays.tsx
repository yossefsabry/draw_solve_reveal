
import React, { useEffect, useState } from "react";
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
  const [orientation, setOrientation] = useState<string | undefined>(undefined);
  const isMobile = useIsMobile();
  
  // Monitor orientation changes
  useEffect(() => {
    const updateOrientation = () => {
      if (window.screen.orientation) {
        setOrientation(window.screen.orientation.type);
      } else if (window.orientation !== undefined) {
        // Fallback for older browsers
        const angle = window.orientation;
        if (angle === 0 || angle === 180) {
          setOrientation('portrait');
        } else {
          setOrientation('landscape');
        }
      }
    };
    
    // Initial check
    updateOrientation();
    
    // Event listeners
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);
    
    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

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
