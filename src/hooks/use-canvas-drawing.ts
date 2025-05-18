
import { useState, useRef } from "react";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "@/components/drawing/types";
import { useZoomPan } from "./canvas/use-zoom-pan";
import { useKeyboardControl } from "./canvas/use-keyboard-control";
import { usePointerPosition } from "./canvas/use-pointer-position";
import { useShapeDrawing } from "./canvas/use-shape-drawing";
import { useFreeDrawing } from "./canvas/use-free-drawing";
import { useObjectManipulation } from "./canvas/use-object-manipulation";
import { PenType } from "@/components/drawing/PenSelector";

interface UseCanvasDrawingProps {
  mode: DrawingMode;
  color: string;
  brushSize: number;
  shapeTool: ShapeTool;
  penType: PenType;
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
}

export const useCanvasDrawing = ({ 
  mode, 
  color, 
  brushSize, 
  shapeTool,
  penType,
  objects,
  setObjects
}: UseCanvasDrawingProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement | null>(null);
  
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
    drawingPath, startDrawingPath, addToDrawingPath, finishDrawingPath 
  } = useFreeDrawing({
    color: mode === "erase" ? "#000000" : color, // Use background color for eraser
    brushSize,
    scale,
    offset,
    objects,
    setObjects,
    keyPressed,
    penType,
    mode
  });
  const { 
    startShapeDrawing, previewShape, finishShapeDrawing, canvasStateRef, startPointRef 
  } = useShapeDrawing({
    shapeTool,
    color,
    brushSize,
    scale,
    offset,
    objects,
    setObjects,
    keyPressed
  });
  const { 
    selectedShape, setSelectedShape, startMovingObject, moveSelectedObject, stopMovingObject 
  } = useObjectManipulation({ objects, setObjects });

  // Drawing functions
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
      startDrawingPath(pos);
    } else if (mode === "shape") {
      startShapeDrawing(pos, drawingLayerRef.current);
    } else if (mode === "move") {
      startMovingObject(pos);
    }
  };
  
  // Handle pointer movement
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Update cursor position for guidelines
    const pos = getPointerPosition(e, lastMousePosRef.current);
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
    const currentPos = getPointerPosition(e, lastMousePosRef.current);
    
    if (mode === "draw" || mode === "erase") {
      addToDrawingPath(currentPos, drawingLayerRef.current);
    } else if (mode === "shape") {
      previewShape(currentPos, drawingLayerRef.current);
    } else if (mode === "move") {
      moveSelectedObject(currentPos);
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
      finishDrawingPath();
    } else if (mode === "shape") {
      finishShapeDrawing(lastMousePosRef.current);
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
    drawingPath
  };
};
