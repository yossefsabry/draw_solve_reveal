
import React, { useEffect, useRef } from "react";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "./types";
import { drawShapePreview } from "./ShapeDrawingUtils";

interface DrawingLayerProps {
  isDrawing: boolean;
  mode: DrawingMode;
  color: string;
  brushSize: number;
  objects: AnyDrawingObject[];
  scale: number;
  offset: { x: number; y: number };
  isPanning: boolean;
  rulerSize: number;
  width: number;
  height: number;
  onCanvasRef: (ref: HTMLCanvasElement | null) => void;
  onPointerDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onPointerMove: (e: React.MouseEvent | React.TouchEvent) => void;
  onPointerUp: (e: React.MouseEvent | React.TouchEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
}

const DrawingLayer: React.FC<DrawingLayerProps> = ({
  isDrawing,
  mode,
  color,
  brushSize,
  objects,
  scale,
  offset,
  isPanning,
  rulerSize,
  width,
  height,
  onCanvasRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    
    ctx.current = context;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    
    if (onCanvasRef) {
      onCanvasRef(canvas);
    }
  }, []);

  // Update drawing context when color or brush size changes
  useEffect(() => {
    if (!ctx.current) return;
    ctx.current.strokeStyle = color;
    ctx.current.lineWidth = brushSize;
  }, [color, brushSize]);
  
  // Update canvas dimensions when container size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set actual pixel dimensions for canvas (important for high-DPI displays)
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = (width - rulerSize) * devicePixelRatio;
    canvas.height = (height - rulerSize) * devicePixelRatio;
    canvas.style.width = `${width - rulerSize}px`;
    canvas.style.height = `${height - rulerSize}px`;
    
    if (ctx.current) {
      ctx.current.scale(devicePixelRatio, devicePixelRatio);
      ctx.current.lineCap = "round";
      ctx.current.lineJoin = "round";
      ctx.current.strokeStyle = color;
      ctx.current.lineWidth = brushSize;
    }
    
    redrawObjects();
  }, [width, height]);

  // Update the canvas when scale or offset changes
  useEffect(() => {
    redrawObjects();
  }, [scale, offset, objects]);

  // Redraw all objects on the canvas
  const redrawObjects = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx.current) return;
    
    // Clear the canvas
    ctx.current.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    
    // Apply zoom and pan transformations
    ctx.current.save();
    ctx.current.translate(offset.x, offset.y);
    ctx.current.scale(scale, scale);
    
    // Draw all objects
    objects.forEach(obj => {
      ctx.current!.save();
      ctx.current!.strokeStyle = obj.color;
      ctx.current!.lineWidth = obj.lineWidth;
      ctx.current!.globalCompositeOperation = "source-over"; // Ensure all objects draw normally
      
      switch (obj.type) {
        case 'rectangle':
          ctx.current!.beginPath();
          ctx.current!.rect(obj.x, obj.y, obj.width, obj.height);
          ctx.current!.stroke();
          break;
        case 'circle':
          ctx.current!.beginPath();
          ctx.current!.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
          ctx.current!.stroke();
          break;
        case 'triangle':
          ctx.current!.beginPath();
          ctx.current!.moveTo(obj.x1, obj.y1);
          ctx.current!.lineTo(obj.x2, obj.y2);
          ctx.current!.lineTo(obj.x3, obj.y3);
          ctx.current!.closePath();
          ctx.current!.stroke();
          break;
        case 'line':
          ctx.current!.beginPath();
          ctx.current!.moveTo(obj.x1, obj.y1);
          ctx.current!.lineTo(obj.x2, obj.y2);
          ctx.current!.stroke();
          break;
        case 'arrow':
          // Draw the line
          ctx.current!.beginPath();
          ctx.current!.moveTo(obj.x1, obj.y1);
          ctx.current!.lineTo(obj.x2, obj.y2);
          ctx.current!.stroke();
          
          // Calculate the arrow head
          const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
          const headLength = 15; // Length of arrow head
          
          // Draw the arrow head
          ctx.current!.beginPath();
          ctx.current!.moveTo(obj.x2, obj.y2);
          ctx.current!.lineTo(
            obj.x2 - headLength * Math.cos(angle - Math.PI / 6),
            obj.y2 - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.current!.moveTo(obj.x2, obj.y2);
          ctx.current!.lineTo(
            obj.x2 - headLength * Math.cos(angle + Math.PI / 6),
            obj.y2 - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.current!.stroke();
          break;
        case 'text':
          ctx.current!.font = '24px Arial';
          ctx.current!.fillStyle = obj.color;
          ctx.current!.fillText(obj.text, obj.x, obj.y);
          break;
        case 'draw':
          // Draw free-hand paths
          if (obj.points && obj.points.length > 1) {
            ctx.current!.beginPath();
            ctx.current!.moveTo(obj.points[0].x, obj.points[0].y);
            
            for (let i = 1; i < obj.points.length; i++) {
              ctx.current!.lineTo(obj.points[i].x, obj.points[i].y);
            }
            
            ctx.current!.stroke();
          }
          break;
      }
      
      ctx.current!.restore();
    });
    
    // Restore the context to its original state
    ctx.current.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 canvas-container"
      style={{ 
        marginTop: rulerSize, 
        marginLeft: rulerSize,
        width: width - rulerSize,
        height: height - rulerSize,
        cursor: isPanning ? 'grab' : 'crosshair',
        touchAction: 'none'
      }}
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
      onWheel={onWheel}
    />
  );
};

export default DrawingLayer;
