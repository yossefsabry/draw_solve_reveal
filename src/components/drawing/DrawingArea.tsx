import React, { useRef, useEffect, useState } from "react";
import { useCanvasDrawing } from "@/hooks/use-canvas-drawing";
import { AnyDrawingObject } from "@/components/drawing/types";
import Rulers from "./Rulers";

interface DrawingAreaProps {
  mode: "draw";
  color: string;
  brushSize: number;
  showGrid: boolean;
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const DrawingArea: React.FC<DrawingAreaProps> = ({
  mode,
  color,
  brushSize,
  showGrid,
  objects,
  setObjects,
  zoom,
  onZoomChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  const rulerSize = 30;

  const {
    isDrawing,
    startDrawing,
    stopDrawing,
    handleMove,
    handleMouseLeave,
    cursorPosition,
    drawingPath
  } = useCanvasDrawing({
    mode,
    color,
    brushSize,
    objects,
    setObjects
  });

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom delta
    const delta = -e.deltaY * 0.001;
    const zoomFactor = Math.exp(delta);
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 5.0);
    
    // Calculate the point in world coordinates before zoom
    const worldX = (mouseX - offset.x) / zoom;
    const worldY = (mouseY - offset.y) / zoom;
    
    // Calculate new offset to keep the same world point under the mouse
    const newOffsetX = mouseX - worldX * newZoom;
    const newOffsetY = mouseY - worldY * newZoom;
    
    setOffset({ x: newOffsetX, y: newOffsetY });
    onZoomChange(newZoom);
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.ctrlKey || e.metaKey) { // Middle mouse or Ctrl+click for panning
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    if (mode === "draw") {
      startDrawing(e);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    handleMove(e);
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    
    stopDrawing();
  };

  // Canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width - rulerSize;
        const height = rect.height - rulerSize;
        setCanvasSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transform
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 0.5 / zoom;
      const gridSize = 20;
      
      const startX = Math.floor(-offset.x / zoom / gridSize) * gridSize;
      const startY = Math.floor(-offset.y / zoom / gridSize) * gridSize;
      const endX = startX + (canvas.width / zoom) + gridSize;
      const endY = startY + (canvas.height / zoom) + gridSize;
      
      for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw objects
    objects.forEach(obj => {
      if (obj.type === 'draw' && obj.points && obj.points.length > 1) {
        ctx.save();
        ctx.strokeStyle = obj.color || '#ffffff';
        ctx.lineWidth = (obj.lineWidth || 2) / zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        obj.points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw current drawing path
    if (isDrawing && drawingPath && drawingPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize / zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(drawingPath[0].x, drawingPath[0].y);
      drawingPath.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [objects, showGrid, zoom, offset, canvasSize, isDrawing, drawingPath, color, brushSize]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden bg-gray-900"
      style={{ cursor: isPanning ? 'grabbing' : 'crosshair' }}
    >
      <Rulers 
        width={canvasSize.width} 
        height={canvasSize.height} 
        zoom={zoom} 
        offset={offset}
        rulerSize={rulerSize} 
      />
      
      <canvas
        ref={canvasRef}
        className="absolute"
        style={{
          left: rulerSize,
          top: rulerSize,
          width: canvasSize.width,
          height: canvasSize.height,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />
    </div>
  );
};

export default DrawingArea;
