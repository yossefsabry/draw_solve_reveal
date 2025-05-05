
import React, { useRef, useEffect, useState } from "react";
import { AnyDrawingObject } from "./types";

interface DrawingAreaProps {
  isDrawing: boolean;
  mode: string;
  color: string;
  brushSize: number;
  objects: AnyDrawingObject[];
  selectedShape: any;
  shapeTool: string;
  onObjectsChange: (objects: AnyDrawingObject[]) => void;
  onSelectedShapeChange: (shape: any) => void;
  onDrawingStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onDrawingMove: (e: React.MouseEvent | React.TouchEvent) => void;
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
  onDrawingMove,
  onDrawingEnd,
  onCanvasRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingCtx, setDrawingCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [bgPattern, setBgPattern] = useState<HTMLImageElement | null>(null);

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
    
    // Clear drawing layer
    drawingCtx.clearRect(0, 0, drawingLayerRef.current.width, drawingLayerRef.current.height);
    
    objects.forEach(obj => {
      drawingCtx.save();
      drawingCtx.strokeStyle = obj.color;
      drawingCtx.lineWidth = obj.lineWidth;
      
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
      }
      
      drawingCtx.restore();
    });
  };

  // Call redrawObjects whenever objects change
  useEffect(() => {
    redrawObjects();
  }, [objects]);

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
        onMouseDown={onDrawingStart}
        onMouseMove={onDrawingMove}
        onMouseUp={onDrawingEnd}
        onMouseLeave={onDrawingEnd}
        onTouchStart={onDrawingStart}
        onTouchMove={onDrawingMove}
        onTouchEnd={onDrawingEnd}
      />
    </div>
  );
};

export default DrawingArea;
