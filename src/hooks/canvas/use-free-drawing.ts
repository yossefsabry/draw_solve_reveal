import { useState, useRef } from "react";
import { AnyDrawingObject, DrawObject } from "@/components/drawing/types";

interface UseFreeDrawingProps {
  color: string;
  brushSize: number;
  scale: number;
  offset: { x: number; y: number };
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  keyPressed: { [key: string]: boolean };
}

export const useFreeDrawing = ({
  color,
  brushSize,
  scale,
  offset,
  objects,
  setObjects,
  keyPressed
}: UseFreeDrawingProps) => {
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Start a new drawing path
  const startDrawingPath = (pos: { x: number; y: number }) => {
    setDrawingPath([pos]);
    lastPosRef.current = pos;
  };
  
  // Add to the current drawing path
  const addToDrawingPath = (pos: { x: number; y: number }, canvas: HTMLCanvasElement | null) => {
    // Handle straight line drawing when ctrl is pressed
    let currentPos = pos;
    if (keyPressed.ctrl && lastPosRef.current) {
      // Calculate the horizontal and vertical distances
      const deltaX = Math.abs(pos.x - lastPosRef.current.x);
      const deltaY = Math.abs(pos.y - lastPosRef.current.y);
      
      if (deltaX >= deltaY) {
        // Draw a horizontal line (keep the same Y coordinate)
        currentPos = {
          x: pos.x,
          y: lastPosRef.current.y
        };
      } else {
        // Draw a vertical line (keep the same X coordinate)
        currentPos = {
          x: lastPosRef.current.x,
          y: pos.y
        };
      }
    }
    
    setDrawingPath(prev => [...prev, currentPos]);
    
    // Draw directly to canvas with improved line smoothing
    if (canvas && lastPosRef.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        // Improved line drawing with better smoothing
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        
        if (keyPressed.ctrl) {
          // Draw straight line when Ctrl is pressed
          ctx.lineTo(currentPos.x, currentPos.y);
        } else {
          // Simple smoothing for more natural strokes
          const midX = (lastPosRef.current.x + currentPos.x) / 2;
          const midY = (lastPosRef.current.y + currentPos.y) / 2;
          ctx.quadraticCurveTo(
            lastPosRef.current.x, 
            lastPosRef.current.y,
            midX, midY
          );
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
      // Add free-hand drawing to objects
      const newObject: DrawObject = {
        type: 'draw',
        points: drawingPath,
        color: color || '#ffffff', // Default to white if no color specified
        lineWidth: brushSize
      };
      
      setObjects([...objects, newObject]);
      setDrawingPath([]);
      lastPosRef.current = null;
      return newObject;
    }
    
    setDrawingPath([]);
    lastPosRef.current = null;
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
