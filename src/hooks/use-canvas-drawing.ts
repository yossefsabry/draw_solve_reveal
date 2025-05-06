
import { useState, useRef, useEffect } from "react";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "@/components/drawing/types";
import { findObjectAtPosition, createShapeObject } from "@/components/drawing/ShapeDrawingUtils";

interface UseCanvasDrawingProps {
  mode: DrawingMode;
  color: string;
  brushSize: number;
  shapeTool: ShapeTool;
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
}

export const useCanvasDrawing = ({ 
  mode, 
  color, 
  brushSize, 
  shapeTool,
  objects,
  setObjects
}: UseCanvasDrawingProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedShape, setSelectedShape] = useState<any>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasStateRef = useRef<ImageData | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Helper to get pointer position for both mouse and touch events
  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    
    const { x, y } = getPointerPosition(e);
    lastMousePosRef.current = { x, y };
    
    if (mode === "shape") {
      // Save the start point for shape drawing
      startPointRef.current = { x, y };
      
      // Save canvas state for preview
      if (drawingLayerRef.current) {
        const ctx = drawingLayerRef.current.getContext('2d');
        if (ctx) {
          canvasStateRef.current = ctx.getImageData(
            0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height
          );
        }
      }
    } else if (mode === "move") {
      // Check if we're clicking on a shape
      const clickedObjectIndex = findObjectAtPosition(objects, x, y);
      if (clickedObjectIndex !== -1) {
        const obj = objects[clickedObjectIndex];
        setSelectedShape({
          index: clickedObjectIndex,
          offsetX: x - (obj.type === 'rectangle' || 
                        obj.type === 'circle' || 
                        obj.type === 'text' 
                        ? obj.x 
                        : obj.type === 'triangle' || obj.type === 'line' || obj.type === 'arrow'
                          ? obj.x1
                          : obj.points[0].x), // Handle DrawObject case with points array
          offsetY: y - (obj.type === 'rectangle' || 
                        obj.type === 'circle' || 
                        obj.type === 'text' 
                        ? obj.y 
                        : obj.type === 'triangle' || obj.type === 'line' || obj.type === 'arrow'
                          ? obj.y1
                          : obj.points[0].y), // Handle DrawObject case with points array
        });
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    if (mode === "shape" && startPointRef.current && lastMousePosRef.current) {
      // Add the shape to objects array
      const { x: startX, y: startY } = startPointRef.current;
      const { x: endX, y: endY } = lastMousePosRef.current;
      
      const newObject = createShapeObject(shapeTool, startX, startY, endX, endY, color, brushSize);
      
      if (newObject) {
        setObjects([...objects, newObject]);
      }
    } else if (mode === "move") {
      setSelectedShape(null);
    }
    
    // Clear saved canvas state and start point
    canvasStateRef.current = null;
    startPointRef.current = null;
    lastMousePosRef.current = null;
    
    setIsDrawing(false);
  };

  return {
    isDrawing,
    selectedShape,
    canvasRef,
    drawingLayerRef,
    startPointRef,
    canvasStateRef,
    lastMousePosRef,
    getPointerPosition,
    startDrawing,
    stopDrawing,
    setSelectedShape,
    setIsDrawing
  };
};
