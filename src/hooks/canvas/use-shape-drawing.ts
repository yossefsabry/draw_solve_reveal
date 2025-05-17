
import { useRef, useState } from "react";
import { ShapeTool, AnyDrawingObject } from "@/components/drawing/types";
import { createShapeObject, drawShapePreview } from "@/components/drawing/ShapeDrawingUtils";

interface UseShapeDrawingProps {
  shapeTool: ShapeTool;
  color: string;
  brushSize: number;
  scale: number;
  offset: { x: number; y: number };
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  keyPressed: { [key: string]: boolean };
}

export const useShapeDrawing = ({
  shapeTool,
  color,
  brushSize,
  scale,
  offset,
  objects,
  setObjects,
  keyPressed
}: UseShapeDrawingProps) => {
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasStateRef = useRef<ImageData | null>(null);
  
  // Start shape drawing
  const startShapeDrawing = (pos: { x: number; y: number }, canvas: HTMLCanvasElement | null) => {
    startPointRef.current = pos;
    
    // Save canvas state for preview
    if (canvas) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvasStateRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  // Preview shape during drawing
  const previewShape = (pos: { x: number; y: number }, canvas: HTMLCanvasElement | null) => {
    if (!startPointRef.current || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx && canvasStateRef.current) {
      // Restore the original canvas state
      ctx.putImageData(canvasStateRef.current, 0, 0);
      
      // Draw the shape preview
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      
      // If Ctrl is pressed, ensure horizontal line for shape drawing
      if (keyPressed.ctrl && (shapeTool === "line" || shapeTool === "arrow")) {
        const straightPos = {
          x: pos.x,
          y: startPointRef.current.y
        };
        drawShapePreview(ctx, shapeTool, startPointRef.current.x, startPointRef.current.y, straightPos.x, straightPos.y);
      } else {
        drawShapePreview(ctx, shapeTool, startPointRef.current.x, startPointRef.current.y, pos.x, pos.y);
      }
      
      ctx.restore();
    }
  };
  
  // Finish shape drawing
  const finishShapeDrawing = (endPos: { x: number; y: number } | null) => {
    if (!startPointRef.current || !endPos) return null;
    
    let finalEndPos = { ...endPos };
    
    // If Ctrl is pressed and it's a line/arrow, make it horizontal
    if (keyPressed.ctrl && (shapeTool === "line" || shapeTool === "arrow")) {
      finalEndPos = {
        x: endPos.x,
        y: startPointRef.current.y // Keep the same Y coordinate
      };
    }
    
    const newObject = createShapeObject(
      shapeTool, 
      startPointRef.current.x, 
      startPointRef.current.y, 
      finalEndPos.x, 
      finalEndPos.y, 
      color || '#ffffff', 
      brushSize
    );
    
    // Clear refs
    canvasStateRef.current = null;
    startPointRef.current = null;
    
    if (newObject) {
      setObjects([...objects, newObject]);
      return newObject;
    }
    
    return null;
  };

  return {
    startShapeDrawing,
    previewShape,
    finishShapeDrawing,
    canvasStateRef,
    startPointRef
  };
};
