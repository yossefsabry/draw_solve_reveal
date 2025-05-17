
import { useState, useRef } from "react";

// Constants for min and max zoom
const MIN_ZOOM = 0.5; // 50%
const MAX_ZOOM = 4.28; // 428%

export interface ZoomPanState {
  scale: number;
  offset: { x: number; y: number };
  isPanning: boolean;
}

export const useZoomPan = () => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const zoomIntensityRef = useRef(0.1); // Controls zoom sensitivity

  // Handle wheel events for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Smoother zooming - smaller delta for better control
    const delta = -e.deltaY * 0.005; 
    const zoomFactor = Math.exp(delta);
    
    // Apply zoom limits
    const newScale = Math.min(Math.max(scale * zoomFactor, MIN_ZOOM), MAX_ZOOM);
    
    // Get the mouse position relative to the canvas
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate new offset to zoom toward mouse cursor
    const newOffset = {
      x: offset.x - (mouseX / scale - mouseX / newScale) * newScale,
      y: offset.y - (mouseY / scale - mouseY / newScale) * newScale
    };
    
    setScale(newScale);
    setOffset(newOffset);
  };

  // Direct zoom change method
  const setDirectScale = (newScale: number) => {
    // Clamp the scale value between MIN_ZOOM and MAX_ZOOM
    const clampedScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
    
    // Reference to canvas for zooming to center
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate new offset to zoom toward center
      const newOffset = {
        x: offset.x - (centerX / scale - centerX / clampedScale) * clampedScale,
        y: offset.y - (centerY / scale - centerY / clampedScale) * clampedScale
      };
      
      setScale(clampedScale);
      setOffset(newOffset);
    } else {
      setScale(clampedScale);
    }
  };

  // Start panning
  const startPanning = (clientX: number, clientY: number) => {
    setIsPanning(true);
    lastMousePosRef.current = { x: clientX, y: clientY };
  };

  // Handle panning movement
  const handlePanning = (clientX: number, clientY: number) => {
    if (!isPanning || !lastMousePosRef.current) return;
    
    const deltaX = clientX - lastMousePosRef.current.x;
    const deltaY = clientY - lastMousePosRef.current.y;
    
    setOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    lastMousePosRef.current = { x: clientX, y: clientY };
  };

  // Stop panning
  const stopPanning = () => {
    setIsPanning(false);
    lastMousePosRef.current = null;
  };

  return {
    scale,
    offset,
    isPanning,
    lastMousePosRef,
    handleWheel,
    setDirectScale,
    startPanning,
    handlePanning,
    stopPanning,
    setIsPanning
  };
};
