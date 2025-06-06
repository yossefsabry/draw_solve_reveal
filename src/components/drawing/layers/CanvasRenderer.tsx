
import React, { useRef, useEffect } from "react";
import { AnyDrawingObject } from "../types";
import { drawObjects, drawGrid } from "../utils/CanvasRenderingUtils";

interface CanvasRendererProps {
  width: number;
  height: number;
  objects: AnyDrawingObject[];
  scale: number;
  offset: { x: number; y: number };
  color: string;
  brushSize: number;
  mode: string;
  showGrid?: boolean;
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
  mode,
  showGrid = false,
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
      willReadFrequently: false,
      alpha: true,
    });
    
    if (!context) return;
    
    ctx.current = context;
    
    // Apply initial pen settings
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalAlpha = 1.0;
    
    // Pass the reference up
    onCanvasRef(canvas);
    
    return () => {
      onCanvasRef(null);
    };
  }, []);

  // Update pen style when relevant props change
  useEffect(() => {
    if (!ctx.current) return;
    ctx.current.strokeStyle = color;
    ctx.current.lineWidth = brushSize;
    ctx.current.lineCap = "round";
    ctx.current.lineJoin = "round";
    ctx.current.globalAlpha = 1.0;
  }, [color, brushSize, mode]);

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
      ctx.current.strokeStyle = color;
      ctx.current.lineWidth = brushSize;
      ctx.current.lineCap = "round";
      ctx.current.lineJoin = "round";
      ctx.current.globalAlpha = 1.0;
    }
    
    // Redraw after resize
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(redrawObjects);
  }, [width, height]);

  // Update rendering when objects, scale, offset, or grid change
  useEffect(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(redrawObjects);
  }, [objects, scale, offset, showGrid]);

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
    
    // Draw black background
    ctx.current.fillStyle = "#000000";
    ctx.current.fillRect(0, 0, visibleWidth, visibleHeight);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx.current, visibleWidth, visibleHeight, scale, offset);
    }
    
    // Draw all objects
    drawObjects(ctx.current, objects, visibleWidth, visibleHeight, scale, offset);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        marginTop: 26, // Ruler size
        marginLeft: 26, // Ruler size
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default CanvasRenderer;
