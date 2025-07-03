
import { useState, useRef, useEffect } from "react";
import { AnyDrawingObject, DrawingMode } from "@/components/drawing/types";
import { useZoomPan } from "./canvas/use-zoom-pan";
import { useKeyboardControl } from "./canvas/use-keyboard-control";
import { usePointerPosition } from "./canvas/use-pointer-position";
import { useFreeDrawing } from "./canvas/use-free-drawing";
import { useObjectManipulation } from "./canvas/use-object-manipulation";
import { useHistoryState } from "./use-history-state";

interface UseCanvasDrawingProps {
  mode: DrawingMode;
  color: string;
  brushSize: number;
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
}

export const useCanvasDrawing = ({ 
  mode, 
  color, 
  brushSize, 
  objects,
  setObjects
}: UseCanvasDrawingProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement | null>(null);
  
  // Use history state for undo/redo
  const {
    state: historyObjects,
    setState: setHistoryObjects,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistoryState<AnyDrawingObject[]>(objects);
  
  // Sync history state with props
  useEffect(() => {
    if (JSON.stringify(historyObjects) !== JSON.stringify(objects)) {
      setObjects(historyObjects);
    }
  }, [historyObjects, objects, setObjects]);
  
  // Use our extracted hooks
  const { keyPressed } = useKeyboardControl();
  const { 
    scale, offset, isPanning, lastMousePosRef, 
    handleWheel, setDirectScale, startPanning, handlePanning, stopPanning, setIsPanning
  } = useZoomPan();
  const { 
    cursorPosition, getPointerPosition, updateCursorPosition, handleMouseLeave 
  } = usePointerPosition(scale, offset);
  const { 
    startFreeDrawing, continueFreeDrawing, finishFreeDrawing, currentPath 
  } = useFreeDrawing({
    color: mode === "erase" ? "#000000" : color,
    brushSize,
    scale,
    offset,
    objects: historyObjects,
    setObjects: setHistoryObjects,
    keyPressed,
    mode
  });
  const { 
    selectedShape, setSelectedShape, startMovingObject, moveSelectedObject, stopMovingObject 
  } = useObjectManipulation({ objects: historyObjects, setObjects: setHistoryObjects });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z for redo
      else if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Drawing functions with straight line support
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // If space key is pressed, start panning instead of drawing
    if (keyPressed.space) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startPanning(clientX, clientY);
      return;
    }
    
    setIsDrawing(true);
    
    const pos = getPointerPosition(e, lastMousePosRef.current);
    lastMousePosRef.current = pos;
    
    if (mode === "draw" || mode === "erase") {
      startFreeDrawing(pos);
    }
  };
  
  // Handle pointer movement with straight line logic
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Update cursor position for guidelines
    let pos = getPointerPosition(e, lastMousePosRef.current);
    
    // Apply straight line constraints when drawing
    if (isDrawing && (mode === "draw" || mode === "erase") && lastMousePosRef.current) {
      if (keyPressed.shift || (keyPressed.ctrl && keyPressed.shift)) {
        const startPos = currentPath[0] || lastMousePosRef.current;
        const deltaX = pos.x - startPos.x;
        const deltaY = pos.y - startPos.y;
        
        if (keyPressed.ctrl && keyPressed.shift) {
          // Lock to 90-degree increments (0°, 90°, 180°, 270°)
          const angle = Math.atan2(deltaY, deltaX);
          const snapAngle = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          pos = {
            x: startPos.x + Math.cos(snapAngle) * distance,
            y: startPos.y + Math.sin(snapAngle) * distance
          };
        } else if (keyPressed.shift) {
          // Lock to straight line (horizontal or vertical based on dominant direction)
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            pos = { x: pos.x, y: startPos.y }; // Horizontal line
          } else {
            pos = { x: startPos.x, y: pos.y }; // Vertical line
          }
        }
      }
    }
    
    updateCursorPosition(pos);
    
    // Handle panning when space is pressed and mouse is moving
    if (isPanning && lastMousePosRef.current) {
      const clientX = 'touches' in e ? 
        (e.touches.length > 0 ? e.touches[0].clientX : lastMousePosRef.current.x) : 
        e.clientX;
      const clientY = 'touches' in e ? 
        (e.touches.length > 0 ? e.touches[0].clientY : lastMousePosRef.current.y) : 
        e.clientY;
      
      handlePanning(clientX, clientY);
      return;
    }
    
    if (!isDrawing) return;
    
    // Get current position
    const currentPos = pos;
    
    if (mode === "draw" || mode === "erase") {
      continueFreeDrawing(currentPos);
    }
    
    lastMousePosRef.current = currentPos;
  };

  // Stop drawing
  const stopDrawing = () => {
    if (isPanning) {
      stopPanning();
      return;
    }
    
    if (!isDrawing) return;
    
    if (mode === "draw" || mode === "erase") {
      finishFreeDrawing();
    }
    
    // Reset references and state
    lastMousePosRef.current = null;
    setIsDrawing(false);
    setSelectedShape(null);
  };

  return {
    isDrawing,
    selectedShape,
    drawingLayerRef,
    startDrawing,
    stopDrawing,
    handleMove,
    handleWheel,
    handleMouseLeave,
    setSelectedShape,
    scale,
    offset,
    isPanning,
    keyPressed,
    setDirectScale,
    cursorPosition,
    currentPath,
    // History functions
    undo,
    redo,
    canUndo,
    canRedo
  };
};
