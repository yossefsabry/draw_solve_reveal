import React, { useRef, useEffect, useState } from "react";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "./types";
import { drawShapePreview } from "./ShapeDrawingUtils";

interface DrawingAreaProps {
  isDrawing: boolean;
  mode: DrawingMode;
  color: string;
  brushSize: number;
  objects: AnyDrawingObject[];
  selectedShape: any;
  shapeTool: ShapeTool;
  onObjectsChange: (objects: AnyDrawingObject[]) => void;
  onSelectedShapeChange: (shape: any) => void;
  onDrawingStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onDrawingEnd: () => void;
  onCanvasRef?: (ref: HTMLCanvasElement | null) => void;
}

const DrawingArea: React.FC<DrawingAreaProps> = ({
  isDrawing,
  mode,
  color,
  brushSize,
  objects,
  selectedShape,
  shapeTool,
  onObjectsChange,
  onSelectedShapeChange,
  onDrawingStart,
  onDrawingEnd,
  onCanvasRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingCtx, setDrawingCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [bgPattern, setBgPattern] = useState<HTMLImageElement | null>(null);
  const [drawingPath, setDrawingPath] = useState<any[]>([]);
  
  // Store the start point and current mouse position for shape drawing
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const canvasStateRef = useRef<ImageData | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const drawingLayer = drawingLayerRef.current;
    if (!canvas || !drawingLayer) return;
    
    const context = canvas.getContext("2d");
    const drawingContext = drawingLayer.getContext("2d");
    if (!context || !drawingContext) return;
    
    // Set canvas size to match its display size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      drawingLayer.width = width;
      drawingLayer.height = height;
      
      // Restore context settings after resize
      if (context && drawingContext) {
        context.lineCap = "round";
        context.lineJoin = "round";
        drawingContext.lineCap = "round";
        drawingContext.lineJoin = "round";
        drawingContext.strokeStyle = color;
        drawingContext.lineWidth = brushSize;
        drawBackground();
        redrawObjects();
      }
    };
    
    // Create an enhanced background pattern
    const pattern = new Image();
    pattern.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjhmOGZiIiAvPgogIDxwYXRoIGQ9Ik0gMCAwIEwgNDAgNDAiIHN0cm9rZT0iI2UwZTBlOCIgc3Ryb2tlLXdpZHRoPSIxIiAvPgogIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgNDAiIHN0cm9rZT0iI2UwZTBlOCIgc3Ryb2tlLXdpZHRoPSIxIiAvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiNjY2NjZGQiIC8+Cjwvc3ZnPg==";
    
    pattern.onload = () => {
      setBgPattern(pattern);
      drawBackground();
    };
    
    resizeCanvas();
    setCtx(context);
    setDrawingCtx(drawingContext);
    
    // Pass the canvas reference to the parent if callback provided
    if (onCanvasRef) {
      onCanvasRef(drawingLayer);
    }
    
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Update drawing context when color or brush size changes
  useEffect(() => {
    if (!drawingCtx) return;
    drawingCtx.strokeStyle = color;
    drawingCtx.lineWidth = brushSize;
  }, [drawingCtx, color, brushSize]);

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

  // Additional event handlers for improved drawing
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (drawingCtx) {
      if (mode === "draw") {
        drawingCtx.beginPath();
        drawingCtx.globalCompositeOperation = "source-over";
        
        const pos = getPointerPosition(e);
        drawingCtx.moveTo(pos.x, pos.y);
        startPointRef.current = pos;
      } else if (mode === "erase") {
        drawingCtx.globalCompositeOperation = "destination-out";
        drawingCtx.beginPath();
        
        const pos = getPointerPosition(e);
        drawingCtx.moveTo(pos.x, pos.y);
      } else if (mode === "shape") {
        const pos = getPointerPosition(e);
        startPointRef.current = pos;
        
        // Save the current canvas state for shape preview
        if (drawingLayerRef.current) {
          canvasStateRef.current = drawingCtx.getImageData(
            0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height
          );
        }
      }
    }
    onDrawingStart(e);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPosition(e);
    lastMousePosRef.current = pos;
    
    if (isDrawing && drawingCtx) {
      if (mode === "draw") {
        drawingCtx.lineTo(pos.x, pos.y);
        drawingCtx.stroke();
        
        const paths = [...drawingPath, pos];
        setDrawingPath(paths);
        
        // Store the free-hand drawing
        if (paths.length > 5) { // Wait until we have enough points to represent a meaningful stroke
          const newPath = {
            type: "draw",
            points: [...paths],
            color: color,
            lineWidth: brushSize
          };
          
          // We'll update the objects at the end of the drawing to avoid unnecessary state updates
          if (!startPointRef.current) {
            startPointRef.current = paths[0];
          }
        }
      } else if (mode === "erase") {
        drawingCtx.lineTo(pos.x, pos.y);
        drawingCtx.stroke();
      } else if (mode === "shape" && startPointRef.current && canvasStateRef.current) {
        // Restore the saved canvas state before drawing the preview
        drawingCtx.putImageData(canvasStateRef.current, 0, 0);
        
        // Draw the shape preview
        drawingCtx.save();
        drawingCtx.strokeStyle = color;
        drawingCtx.lineWidth = brushSize;
        drawingCtx.globalCompositeOperation = "source-over";
        
        const { x: startX, y: startY } = startPointRef.current;
        drawShapePreview(drawingCtx, shapeTool, startX, startY, pos.x, pos.y);
        
        drawingCtx.restore();
      } else if (mode === "move" && selectedShape) {
        const { index, offsetX, offsetY } = selectedShape;
        const obj = { ...objects[index] };
        const dx = pos.x - offsetX;
        const dy = pos.y - offsetY;
        
        // Update object position based on its type
        if (obj.type === 'rectangle' || obj.type === 'circle' || obj.type === 'text') {
          obj.x = dx;
          obj.y = dy;
        } else if (obj.type === 'line' || obj.type === 'arrow') {
          const width = obj.x2 - obj.x1;
          const height = obj.y2 - obj.y1;
          obj.x1 = dx;
          obj.y1 = dy;
          obj.x2 = dx + width;
          obj.y2 = dy + height;
        } else if (obj.type === 'triangle') {
          // Calculate the center of the triangle
          const centerX = (obj.x1 + obj.x2 + obj.x3) / 3;
          const centerY = (obj.y1 + obj.y2 + obj.y3) / 3;
          
          // Calculate the offsets from center for each point
          const offset1X = obj.x1 - centerX;
          const offset1Y = obj.y1 - centerY;
          const offset2X = obj.x2 - centerX;
          const offset2Y = obj.y2 - centerY;
          const offset3X = obj.x3 - centerX;
          const offset3Y = obj.y3 - centerY;
          
          // Apply the new center
          const newCenterX = dx + (offset1X + offset2X + offset3X) / 3;
          const newCenterY = dy + (offset1Y + offset2Y + offset3Y) / 3;
          
          // Update the triangle points
          obj.x1 = newCenterX + offset1X;
          obj.y1 = newCenterY + offset1Y;
          obj.x2 = newCenterX + offset2X;
          obj.y2 = newCenterY + offset2Y;
          obj.x3 = newCenterX + offset3X;
          obj.y3 = newCenterY + offset3Y;
        }
        
        // Update the objects array with the modified object
        const updatedObjects = [...objects];
        updatedObjects[index] = obj;
        onObjectsChange(updatedObjects);
        
        // Update the selected shape with the new offset
        onSelectedShapeChange({
          ...selectedShape,
          offsetX: pos.x - dx,
          offsetY: pos.y - dy
        });
      }
    }
  };

  const handlePointerUp = () => {
    if (drawingCtx) {
      drawingCtx.closePath();
      if (mode === "draw" && drawingPath.length > 1) {
        // Save the free-hand drawing to objects
        const newPath = {
          type: "draw",
          points: [...drawingPath],
          color: color,
          lineWidth: brushSize
        };
        
        if (drawingPath.length > 5) {
          onObjectsChange([...objects, newPath]);
        }
      } else if (mode === "erase") {
        drawingCtx.globalCompositeOperation = "source-over";
      }
    }
    
    // Clear temp references
    startPointRef.current = null;
    canvasStateRef.current = null;
    
    onDrawingEnd();
    setDrawingPath([]);
  };

  // Draw background pattern
  const drawBackground = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !bgPattern) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create pattern and fill
    const pattern = context.createPattern(bgPattern, "repeat");
    if (pattern) {
      context.fillStyle = pattern;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Redraw all objects on the canvas
  const redrawObjects = () => {
    if (!drawingCtx || !drawingLayerRef.current) return;
    
    // Don't clear when redrawing objects if we're in the middle of drawing
    if (!isDrawing) {
      drawingCtx.clearRect(0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height);
    }
    
    objects.forEach(obj => {
      drawingCtx.save();
      drawingCtx.strokeStyle = obj.color;
      drawingCtx.lineWidth = obj.lineWidth;
      drawingCtx.globalCompositeOperation = "source-over"; // Ensure all objects draw normally
      
      switch (obj.type) {
        case 'rectangle':
          drawingCtx.beginPath();
          drawingCtx.rect(obj.x, obj.y, obj.width, obj.height);
          drawingCtx.stroke();
          break;
        case 'circle':
          drawingCtx.beginPath();
          drawingCtx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
          drawingCtx.stroke();
          break;
        case 'triangle':
          drawingCtx.beginPath();
          drawingCtx.moveTo(obj.x1, obj.y1);
          drawingCtx.lineTo(obj.x2, obj.y2);
          drawingCtx.lineTo(obj.x3, obj.y3);
          drawingCtx.closePath();
          drawingCtx.stroke();
          break;
        case 'line':
          drawingCtx.beginPath();
          drawingCtx.moveTo(obj.x1, obj.y1);
          drawingCtx.lineTo(obj.x2, obj.y2);
          drawingCtx.stroke();
          break;
        case 'arrow':
          // Draw the line
          drawingCtx.beginPath();
          drawingCtx.moveTo(obj.x1, obj.y1);
          drawingCtx.lineTo(obj.x2, obj.y2);
          drawingCtx.stroke();
          
          // Calculate the arrow head
          const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
          const headLength = 15; // Length of arrow head
          
          // Draw the arrow head
          drawingCtx.beginPath();
          drawingCtx.moveTo(obj.x2, obj.y2);
          drawingCtx.lineTo(
            obj.x2 - headLength * Math.cos(angle - Math.PI / 6),
            obj.y2 - headLength * Math.sin(angle - Math.PI / 6)
          );
          drawingCtx.moveTo(obj.x2, obj.y2);
          drawingCtx.lineTo(
            obj.x2 - headLength * Math.cos(angle + Math.PI / 6),
            obj.y2 - headLength * Math.sin(angle + Math.PI / 6)
          );
          drawingCtx.stroke();
          break;
        case 'text':
          drawingCtx.font = '24px Arial';
          drawingCtx.fillStyle = obj.color;
          drawingCtx.fillText(obj.text, obj.x, obj.y);
          break;
        case 'draw':
          // Draw free-hand paths
          if (obj.points && obj.points.length > 1) {
            drawingCtx.beginPath();
            drawingCtx.moveTo(obj.points[0].x, obj.points[0].y);
            
            for (let i = 1; i < obj.points.length; i++) {
              drawingCtx.lineTo(obj.points[i].x, obj.points[i].y);
            }
            
            drawingCtx.stroke();
          }
          break;
      }
      
      drawingCtx.restore();
    });
  };

  // Call redrawObjects whenever objects change
  useEffect(() => {
    redrawObjects();
  }, [objects]);

  // Pass canvas ref to parent
  useEffect(() => {
    if (onCanvasRef && drawingLayerRef.current) {
      onCanvasRef(drawingLayerRef.current);
    }
  }, [drawingLayerRef.current, onCanvasRef]);

  return (
    <div className="flex-grow relative">
      {/* Background canvas (fixed pattern) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-white dark:bg-gray-800 canvas-container"
      />
      {/* Drawing layer (for actual drawing) */}
      <canvas
        ref={drawingLayerRef}
        className="absolute inset-0 z-10 canvas-container"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
};

export default DrawingArea;
