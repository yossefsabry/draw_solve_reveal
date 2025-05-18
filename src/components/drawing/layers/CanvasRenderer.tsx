
import React, { useRef, useEffect } from "react";
import { AnyDrawingObject } from "../types";
import { PenType } from "../PenSelector";
import { configurePenStyle, drawObjects } from "../utils/CanvasRenderingUtils";

interface CanvasRendererProps {
  width: number;
  height: number;
  objects: AnyDrawingObject[];
  scale: number;
  offset: { x: number; y: number };
  color: string;
  brushSize: number;
  penType: PenType;
  mode: string;
  onCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  width,
  height,
  objects,
  scale,
  offset,
  color,
  brushSize,
  penType,
  mode,
  onCanvasRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const rafId = useRef<number | null>(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Use optimized context settings
    const context = canvas.getContext("2d", { 
      willReadFrequently: true,
      alpha: true, // Enable transparency
    });
    
    if (!context) return;
    
    ctx.current = context;
    
    // Apply initial pen settings
    configurePenStyle(context, penType, color, brushSize, mode === "erase");
    
    // Pass the reference up
    onCanvasRef(canvas);
    
    return () => {
      onCanvasRef(null);
    };
  }, []);

  // Update pen style when relevant props change
  useEffect(() => {
    if (!ctx.current) return;
    configurePenStyle(ctx.current, penType, color, brushSize, mode === "erase");
  }, [penType, color, brushSize, mode]);

  // Update canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set actual pixel dimensions (handling high-DPI)
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * devicePixelRatio);
    canvas.height = Math.round(height * devicePixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    if (ctx.current) {
      // Scale context for high DPI
      ctx.current.scale(devicePixelRatio, devicePixelRatio);
      
      // Restore pen settings after resize
      configurePenStyle(ctx.current, penType, color, brushSize, mode === "erase");
    }
    
    // Redraw after resize
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(redrawObjects);
  }, [width, height]);

  // Update rendering when objects, scale or offset change
  useEffect(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(redrawObjects);
  }, [objects, scale, offset]);

  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Optimized redraw function
  const redrawObjects = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx.current) return;
    
    // Get visible dimensions
    const visibleWidth = canvas.width / (window.devicePixelRatio || 1);
    const visibleHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Clear the canvas
    ctx.current.clearRect(0, 0, visibleWidth, visibleHeight);
    
    // Draw all objects
    drawObjects(ctx.current, objects, visibleWidth, visibleHeight, scale, offset);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default CanvasRenderer;
