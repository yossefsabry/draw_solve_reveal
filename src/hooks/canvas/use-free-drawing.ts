import { useState, useRef } from "react";
import { AnyDrawingObject, DrawObject, DrawingMode } from "@/components/drawing/types";

interface UseFreeDrawingProps {
  color: string;
  brushSize: number;
  scale: number;
  offset: { x: number; y: number };
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  keyPressed: { [key: string]: boolean };
  mode: DrawingMode;
}

export const useFreeDrawing = ({
  color,
  brushSize,
  scale,
  offset,
  objects,
  setObjects,
  keyPressed,
  mode
}: UseFreeDrawingProps) => {
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Start free drawing
  const startFreeDrawing = (pos: { x: number; y: number }) => {
    setCurrentPath([pos]);
    lastPosRef.current = pos;
    startPosRef.current = pos;
  };
  
  // Continue free drawing
  const continueFreeDrawing = (pos: { x: number; y: number }) => {
    // Determine straight line constraints
    let currentPos = pos;
    
    if (keyPressed.ctrl && lastPosRef.current && startPosRef.current) {
      // Calculate the horizontal and vertical distances
      const deltaX = Math.abs(pos.x - startPosRef.current.x);
      const deltaY = Math.abs(pos.y - startPosRef.current.y);
      
      if (deltaX >= deltaY) {
        // Draw a horizontal line (keep the same Y coordinate)
        currentPos = {
          x: pos.x,
          y: startPosRef.current.y
        };
      } else {
        // Draw a vertical line (keep the same X coordinate)
        currentPos = {
          x: startPosRef.current.x,
          y: pos.y
        };
      }
    }
    
    setCurrentPath(prev => [...prev, currentPos]);
    lastPosRef.current = currentPos;
  };
  
  // Finish free drawing
  const finishFreeDrawing = (endPos?: { x: number; y: number }) => {
    if (currentPath.length > 1) {
      let pathToSave = currentPath;
      
      // If Ctrl was pressed, only save start and end points for clean straight lines
      if (keyPressed.ctrl && startPosRef.current) {
        const finalEndPoint = endPos || currentPath[currentPath.length - 1];
        pathToSave = [startPosRef.current, finalEndPoint];
      }
      
      // Create new drawing object
      const newObject: DrawObject = {
        type: 'draw',
        points: pathToSave,
        color: mode === "erase" ? "transparent" : color,
        lineWidth: brushSize
      };
      
      // For eraser, mark it as an eraser
      if (mode === "erase") {
        // @ts-ignore - Adding a custom property for eraser identification
        newObject.isEraser = true;
      }
      
      setObjects([...objects, newObject]);
      setCurrentPath([]);
      lastPosRef.current = null;
      startPosRef.current = null;
      return newObject;
    }
    
    setCurrentPath([]);
    lastPosRef.current = null;
    startPosRef.current = null;
    return null;
  };

  return {
    startFreeDrawing,
    continueFreeDrawing,
    finishFreeDrawing,
    currentPath
  };
};
