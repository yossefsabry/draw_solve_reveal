
import React, { useRef, useEffect, useState } from "react";
import { AnyDrawingObject, DrawingMode, ShapeTool } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import Rulers from "./Rulers";
import ZoomControls from "./ZoomControls";
import CanvasBackground from "./CanvasBackground";
import DrawingLayer from "./DrawingLayer";
import CanvasOverlays from "./CanvasOverlays";

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
  handleWheel?: (e: React.WheelEvent) => void;
  handleMove?: (e: React.MouseEvent | React.TouchEvent) => void;
  scale?: number;
  offset?: { x: number; y: number };
  isPanning?: boolean;
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
  handleWheel,
  handleMove,
  scale = 1,
  offset = { x: 0, y: 0 },
  isPanning = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const RULER_SIZE = 24; // Match the ruler size from Rulers component
  
  // Initialize container size
  useEffect(() => {
    const updateContainerSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
    };
    
    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  // Handle pointer events for drawing
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (handleMove) {
      handleMove(e);
    }
    onDrawingStart(e);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (handleMove) {
      handleMove(e);
    }
    
    if (isDrawing && !isPanning) {
      const pos = getPointerPosition(e);
      const paths = [...drawingPath, pos];
      setDrawingPath(paths);
    }
  };

  const handlePointerUp = () => {
    onDrawingEnd();
    setDrawingPath([]);
  };

  // Helper to get pointer position for both mouse and touch events with zoom/pan adjustments
  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Adjust for zoom and pan
    const x = (clientX - rect.left - offset.x) / scale;
    const y = (clientY - rect.top - offset.y) / scale;
    
    return { x, y };
  };

  // Zoom control handlers
  const zoomIn = () => {
    const newScale = Math.min(scale * 1.2, 10);
    if (scale !== newScale && handleWheel) {
      const wheelEvent = new WheelEvent('wheel', { deltaY: -120 }) as unknown as React.WheelEvent;
      handleWheel(wheelEvent);
    }
  };
  
  const zoomOut = () => {
    const newScale = Math.max(scale / 1.2, 0.1);
    if (scale !== newScale && handleWheel) {
      const wheelEvent = new WheelEvent('wheel', { deltaY: 120 }) as unknown as React.WheelEvent;
      handleWheel(wheelEvent);
    }
  };

  return (
    <ScrollArea className="flex-grow relative h-full w-full overflow-hidden">
      <div className="flex-grow relative h-full w-full" ref={containerRef}>
        {/* Canvas overlays - zoom info and panning indicator */}
        <CanvasOverlays 
          isPanning={isPanning} 
          scale={scale} 
        />
        
        {/* Zoom controls */}
        <ZoomControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
        />
        
        {/* Rulers */}
        <Rulers 
          scale={scale}
          offset={offset}
          width={containerSize.width}
          height={containerSize.height}
        />
        
        {/* Background canvas (white pattern) */}
        <CanvasBackground
          scale={scale}
          offset={offset}
          width={containerSize.width}
          height={containerSize.height}
          rulerSize={RULER_SIZE}
        />
        
        {/* Drawing layer (for actual drawing) */}
        <DrawingLayer
          isDrawing={isDrawing}
          mode={mode}
          color={color}
          brushSize={brushSize}
          objects={objects}
          scale={scale}
          offset={offset}
          isPanning={isPanning}
          rulerSize={RULER_SIZE}
          width={containerSize.width}
          height={containerSize.height}
          onCanvasRef={onCanvasRef || (() => {})}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel || (() => {})}
        />
      </div>
    </ScrollArea>
  );
};

export default DrawingArea;
