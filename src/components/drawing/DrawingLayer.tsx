
import React, { useEffect, useRef } from "react";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "./types";
import { drawShapePreview } from "./ShapeDrawingUtils";
import { PenType } from "./PenSelector";

interface DrawingLayerProps {
  isDrawing: boolean;
  mode: DrawingMode;
  color: string;
  brushSize: number;
  objects: AnyDrawingObject[];
  penType: PenType;
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
  onPointerLeave: (e: React.MouseEvent | React.TouchEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
}

const DrawingLayer: React.FC<DrawingLayerProps> = ({
  isDrawing,
  mode,
  color,
  brushSize,
  objects,
  penType,
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
  onPointerLeave,
  onWheel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const rafId = useRef<number | null>(null);

  // Initialize canvas context with optimized settings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Use willReadFrequently: true for better performance
    const context = canvas.getContext("2d", { 
      willReadFrequently: true,
      alpha: true, // Enable transparency
    });
    
    if (!context) return;
    
    ctx.current = context;
    
    // Set high-quality rendering defaults
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    
    // Enable image smoothing for better quality
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    
    if (onCanvasRef) {
      onCanvasRef(canvas);
    }
  }, []);

  // Update drawing context when color, brush size, or pen type changes
  useEffect(() => {
    if (!ctx.current) return;
    
    ctx.current.strokeStyle = color;
    ctx.current.lineWidth = brushSize;
    
    // Configure pen styles based on pen type
    switch (penType) {
      case "brush":
        ctx.current.lineCap = "round";
        ctx.current.lineJoin = "round";
        break;
      case "pencil":
        ctx.current.lineCap = "round";
        ctx.current.lineJoin = "round";
        break;
      case "pen":
        ctx.current.lineCap = "round";
        ctx.current.lineJoin = "round";
        break;
      case "marker":
        ctx.current.lineCap = "square";
        ctx.current.lineJoin = "round";
        break;
      case "calligraphy":
        ctx.current.lineCap = "butt";
        ctx.current.lineJoin = "miter";
        break;
      case "highlighter":
        ctx.current.lineCap = "round";
        ctx.current.lineJoin = "round";
        ctx.current.globalAlpha = 0.5; // Semi-transparent for highlighter
        break;
      default:
        ctx.current.lineCap = "round";
        ctx.current.lineJoin = "round";
        ctx.current.globalAlpha = 1.0;
    }
    
    if (mode === "erase") {
      // Set up eraser mode
      ctx.current.globalCompositeOperation = "destination-out";
    } else {
      // Reset to normal drawing mode
      ctx.current.globalCompositeOperation = "source-over";
    }
  }, [color, brushSize, penType, mode]);
  
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
      // Scale context for high DPI displays
      ctx.current.scale(devicePixelRatio, devicePixelRatio);
      
      // Restore defaults
      ctx.current.lineCap = "round";
      ctx.current.lineJoin = "round";
      ctx.current.strokeStyle = color;
      ctx.current.lineWidth = brushSize;
    }
    
    // Use requestAnimationFrame for smoother redrawing
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(redrawObjects);
  }, [width, height]);

  // Update the canvas when scale, offset, or objects change
  useEffect(() => {
    // Use requestAnimationFrame for smoother updates
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(redrawObjects);
  }, [scale, offset, objects]);

  // Clean up any animation frames on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Optimized redraw function for better performance
  const redrawObjects = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx.current) return;
    
    // Get the visible canvas dimensions
    const visibleWidth = canvas.width / (window.devicePixelRatio || 1);
    const visibleHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Clear only the visible area
    ctx.current.clearRect(0, 0, visibleWidth, visibleHeight);
    
    // Apply zoom and pan transformations
    ctx.current.save();
    ctx.current.translate(offset.x, offset.y);
    ctx.current.scale(scale, scale);
    
    // Draw all objects with optimized rendering
    objects.forEach(obj => {
      // Skip rendering objects that are completely outside the visible area
      // This is a simple optimization that avoids unnecessary drawing
      if (!isObjectVisible(obj, visibleWidth, visibleHeight, scale, offset)) {
        return;
      }
      
      ctx.current!.save();
      
      // Set object-specific properties
      ctx.current!.strokeStyle = obj.color || "#FFFFFF";
      ctx.current!.lineWidth = obj.lineWidth;
      
      // Set drawing mode based on object type
      ctx.current!.globalCompositeOperation = "source-over";
      
      // Apply specific rendering based on object type
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
          ctx.current!.fillStyle = obj.color || "#FFFFFF";
          ctx.current!.fillText(obj.text, obj.x, obj.y);
          break;
        case 'draw':
          // Draw free-hand paths with optimized algorithm
          if (obj.points && obj.points.length > 1) {
            ctx.current!.beginPath();
            ctx.current!.moveTo(obj.points[0].x, obj.points[0].y);
            
            // Use optimized path rendering for better performance
            // When there are many points, we can skip some for better performance
            const stride = obj.points.length > 100 ? 2 : 1;
            
            for (let i = stride; i < obj.points.length; i += stride) {
              // Use quadratic curves for smoother lines
              if (i < obj.points.length - 1) {
                const xc = (obj.points[i].x + obj.points[i + 1].x) / 2;
                const yc = (obj.points[i].y + obj.points[i + 1].y) / 2;
                ctx.current!.quadraticCurveTo(
                  obj.points[i].x, 
                  obj.points[i].y, 
                  xc, 
                  yc
                );
              } else {
                ctx.current!.lineTo(obj.points[i].x, obj.points[i].y);
              }
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
  
  // Helper function to determine if an object is visible in the current viewport
  const isObjectVisible = (
    obj: AnyDrawingObject, 
    visibleWidth: number, 
    visibleHeight: number, 
    scale: number, 
    offset: {x: number, y: number}
  ) => {
    // Simple bounding box check
    let objX = 0, objY = 0, objWidth = 0, objHeight = 0;
    
    switch (obj.type) {
      case 'rectangle':
        objX = obj.x * scale + offset.x;
        objY = obj.y * scale + offset.y;
        objWidth = obj.width * scale;
        objHeight = obj.height * scale;
        break;
      case 'circle':
        objX = (obj.x - obj.radius) * scale + offset.x;
        objY = (obj.y - obj.radius) * scale + offset.y;
        objWidth = obj.radius * 2 * scale;
        objHeight = obj.radius * 2 * scale;
        break;
      case 'draw':
        if (!obj.points || obj.points.length === 0) return false;
        
        // Find bounding box of the drawing
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        obj.points.forEach(point => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });
        
        objX = minX * scale + offset.x;
        objY = minY * scale + offset.y;
        objWidth = (maxX - minX) * scale;
        objHeight = (maxY - minY) * scale;
        break;
      // Handle other shape types as needed
      default:
        // For other shapes, assume they're visible
        return true;
    }
    
    // Check if the object is within the visible canvas area
    return (
      objX + objWidth >= 0 &&
      objY + objHeight >= 0 &&
      objX <= visibleWidth &&
      objY <= visibleHeight
    );
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
        touchAction: 'none',
        background: 'black' // Black background
      }}
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerLeave}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
      onWheel={onWheel}
    />
  );
};

export default DrawingLayer;
