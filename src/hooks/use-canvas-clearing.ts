
import { useCallback } from 'react';
import { AnyDrawingObject } from '@/components/drawing/types';

interface UseClearCanvasProps {
  setObjects: (objects: AnyDrawingObject[]) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  pushToUndo?: (objects: AnyDrawingObject[]) => void;
  resetOtherStates?: () => void;
}

export const useClearCanvas = ({
  setObjects,
  canvasRef,
  pushToUndo,
  resetOtherStates
}: UseClearCanvasProps) => {
  
  const clearAll = useCallback(() => {
    // Save current state to undo stack if available
    if (pushToUndo) {
      // We'll need to get current objects from parent
      pushToUndo([]);
    }
    
    // Clear all drawing objects
    setObjects([]);
    
    // Clear the canvas completely
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear the entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Fill with black background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    // Reset any other states
    if (resetOtherStates) {
      resetOtherStates();
    }
  }, [setObjects, canvasRef, pushToUndo, resetOtherStates]);

  return { clearAll };
};
