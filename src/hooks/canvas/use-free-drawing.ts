
import { useState, useRef } from "react";
import { AnyDrawingObject, DrawObject, DrawingMode } from "@/components/drawing/types";
import { PenType } from "@/components/drawing/PenSelector";

interface UseFreeDrawingProps {
  color: string;
  brushSize: number;
  scale: number;
  offset: { x: number; y: number };
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  keyPressed: { [key: string]: boolean };
  penType: PenType;
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
  penType,
  mode
}: UseFreeDrawingProps) => {
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Handle pen configuration based on pen type
  const configurePenSettings = (ctx: CanvasRenderingContext2D) => {
    // Set basic properties
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    
    // Reset any previous settings
    ctx.globalAlpha = 1.0;
    
    // Different pen styles based on pen type
    switch (penType) {
      case "brush":
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        break;
        
      case "pencil":
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // Pencil can have a thinner line
        ctx.lineWidth = Math.max(1, brushSize * 0.8);
        break;
        
      case "pen":
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        break;
        
      case "marker":
        ctx.lineCap = "square";
        ctx.lineJoin = "bevel";
        break;
        
      case "calligraphy":
        // Calligraphy has varying line width based on angle
        ctx.lineCap = "butt";
        ctx.lineJoin = "miter";
        break;
        
      case "highlighter":
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 0.5; // Semi-transparent
        break;
        
      default:
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }
    
    // Handle eraser mode
    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1.0; // Ensure full opacity for eraser
    } else {
      ctx.globalCompositeOperation = "source-over";
    }
  };
  
  // Start a new drawing path
  const startDrawingPath = (pos: { x: number; y: number }) => {
    setDrawingPath([pos]);
    lastPosRef.current = pos;
  };
  
  // Add to the current drawing path
  const addToDrawingPath = (pos: { x: number; y: number }, canvas: HTMLCanvasElement | null) => {
    // Determine straight line constraints
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
        
        // Configure pen settings based on pen type
        configurePenSettings(ctx);
        
        // Improved line drawing with better smoothing
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        
        if (keyPressed.ctrl) {
          // Draw straight line when Ctrl is pressed
          ctx.lineTo(currentPos.x, currentPos.y);
        } else {
          // Apply different smoothing based on pen type
          if (penType === "calligraphy") {
            // Calligraphy pen has no smoothing
            ctx.lineTo(currentPos.x, currentPos.y);
          } else {
            // Enhanced smoothing for most pen types
            const midX = (lastPosRef.current.x + currentPos.x) / 2;
            const midY = (lastPosRef.current.y + currentPos.y) / 2;
            
            // For better performance on high-speed movements, use simple lines
            const distance = Math.sqrt(
              Math.pow(currentPos.x - lastPosRef.current.x, 2) + 
              Math.pow(currentPos.y - lastPosRef.current.y, 2)
            );
            
            if (distance > 20) {
              // For fast movements, use simple line
              ctx.lineTo(currentPos.x, currentPos.y);
            } else {
              // For careful drawing, use quadratic curve for smoother lines
              ctx.quadraticCurveTo(
                lastPosRef.current.x, 
                lastPosRef.current.y,
                midX, midY
              );
            }
          }
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
        color: mode === "erase" ? "#000000" : color, // Use background color for eraser
        lineWidth: brushSize
      };
      
      // For eraser, we need to handle it differently, add a flag to identify it
      if (mode === "erase") {
        // @ts-ignore - Adding a custom property for eraser identification
        newObject.isEraser = true;
      }
      
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
