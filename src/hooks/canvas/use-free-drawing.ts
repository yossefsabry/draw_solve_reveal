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
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Start a new drawing path
  const startDrawingPath = (pos: { x: number; y: number }) => {
    setDrawingPath([pos]);
    lastPosRef.current = pos;
    startPosRef.current = pos;
  };
  
  // Add to the current drawing path with improved performance
  const addToDrawingPath = (pos: { x: number; y: number }, canvas: HTMLCanvasElement | null) => {
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
    
    setDrawingPath(prev => [...prev, currentPos]);
    
    // Draw directly to canvas with optimized performance
    if (canvas && lastPosRef.current) {
      const ctx = canvas.getContext('2d', { willReadFrequently: false });
      if (ctx) {
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);
        
        // Basic pen settings
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 1.0;
        
        // Handle eraser mode
        if (mode === "erase") {
          ctx.globalCompositeOperation = "destination-out";
        } else {
          ctx.globalCompositeOperation = "source-over";
        }
        
        // Optimized line drawing
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        
        if (keyPressed.ctrl && startPosRef.current) {
          // Draw straight line when Ctrl is pressed
          ctx.moveTo(startPosRef.current.x, startPosRef.current.y);
          ctx.lineTo(currentPos.x, currentPos.y);
        } else {
          // Simple line to for better performance
          ctx.lineTo(currentPos.x, currentPos.y);
        }
        
        ctx.stroke();
        ctx.restore();
      }
    }
    
    lastPosRef.current = currentPos;
  };
  
  // Complete the drawing and add it to objects
  const finishDrawingPath = () => {
    if (drawingPath.length > 1) {
      let pathToSave = drawingPath;
      
      // If Ctrl was pressed, only save start and end points for clean straight lines
      if (keyPressed.ctrl && startPosRef.current) {
        const endPoint = drawingPath[drawingPath.length - 1];
        pathToSave = [startPosRef.current, endPoint];
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
      setDrawingPath([]);
      lastPosRef.current = null;
      startPosRef.current = null;
      return newObject;
    }
    
    setDrawingPath([]);
    lastPosRef.current = null;
    startPosRef.current = null;
    return null;
  };

  return {
    drawingPath,
    lastPosRef,
    startDrawingPath,
    addToDrawingPath,
    finishDrawingPath
  };
};
