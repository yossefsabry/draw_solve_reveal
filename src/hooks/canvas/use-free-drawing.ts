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
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  
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
        // A more "brush-like" effect
        ctx.shadowBlur = 1;
        ctx.shadowColor = color;
        break;
        
      case "pencil":
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // Pencil can have a thinner line
        ctx.lineWidth = Math.max(1, brushSize * 0.7);
        ctx.shadowBlur = 0;
        break;
        
      case "pen":
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = brushSize * 1.2;
        ctx.shadowBlur = 0;
        break;
        
      case "marker":
        ctx.lineCap = "square";
        ctx.lineJoin = "bevel";
        ctx.shadowBlur = 0;
        break;
        
      case "calligraphy":
        // Calligraphy has varying line width based on angle
        ctx.lineCap = "butt";
        ctx.lineJoin = "miter";
        ctx.lineWidth = brushSize * 1.5;
        ctx.shadowBlur = 0;
        
        // Rotate for calligraphy effect
        ctx.setTransform(1, 0, 0.5, 1, 0, 0);
        break;
        
      case "highlighter":
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 0.4; // Semi-transparent
        ctx.shadowBlur = 0;
        break;
        
      default:
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 0;
    }
    
    // Handle eraser mode
    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1.0; // Ensure full opacity for eraser
      ctx.shadowBlur = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any transforms
    } else {
      ctx.globalCompositeOperation = "source-over";
    }
  };
  
  // Start a new drawing path
  const startDrawingPath = (pos: { x: number; y: number }) => {
    setDrawingPath([pos]);
    lastPosRef.current = pos;
    startPosRef.current = pos;
  };
  
  // Add to the current drawing path
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
          // Use the start position for better straight lines
          ctx.moveTo(startPosRef.current!.x, startPosRef.current!.y);
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
        
        // Reset transform for calligraphy
        if (penType === "calligraphy" && mode !== "erase") {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        
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
      
      // Add free-hand drawing to objects
      const newObject: DrawObject = {
        type: 'draw',
        points: pathToSave,
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
