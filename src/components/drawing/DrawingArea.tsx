
import React, { useRef, useEffect, useState } from "react";
import { AnyDrawingObject, DrawingMode } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import Rulers from "./Rulers";
import ZoomControls from "./ZoomControls";
import CanvasBackground from "./CanvasBackground";
import DrawingLayer from "./DrawingLayer";
import CanvasOverlays from "./CanvasOverlays";
import GuideLines from "./GuideLines";

interface DrawingAreaProps {
  isDrawing: boolean;
  mode: DrawingMode;
  color: string;
  brushSize: number;
  objects: AnyDrawingObject[];
  selectedShape: any;
  showGrid?: boolean;
  onObjectsChange: (objects: AnyDrawingObject[]) => void;
  onSelectedShapeChange: (shape: any) => void;
  onDrawingStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onDrawingEnd: () => void;
  onCanvasRef?: (ref: HTMLCanvasElement | null) => void;
  handleWheel?: (e: React.WheelEvent) => void;
  handleMove?: (e: React.MouseEvent | React.TouchEvent) => void;
  handleMouseLeave?: () => void;
  scale?: number;
  offset?: { x: number; y: number };
  isPanning?: boolean;
  onSetScale?: (newScale: number) => void;
  cursorPosition?: { x: number; y: number } | null;
}

const DrawingArea: React.FC<DrawingAreaProps> = ({
  isDrawing,
  mode,
  color,
  brushSize,
  objects,
  selectedShape,
  showGrid = false,
  onObjectsChange,
  onSelectedShapeChange,
  onDrawingStart,
  onDrawingEnd,
  onCanvasRef,
  handleWheel,
  handleMove,
  handleMouseLeave,
  scale = 1,
  offset = { x: 0, y: 0 },
  isPanning = false,
  onSetScale,
  cursorPosition = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  const RULER_SIZE = 26;
  
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

  const handlePointerLeave = () => {
    if (handleMouseLeave) {
      handleMouseLeave();
    }
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
    if (onSetScale) {
      const newScale = Math.min(scale * 1.1, 4.28);
      onSetScale(newScale);
    }
  };
  
  const zoomOut = () => {
    if (onSetScale) {
      const newScale = Math.max(scale * 0.9, 0.5);
      onSetScale(newScale);
    }
  };
  
  const handleZoomChange = (newScale: number) => {
    if (onSetScale) {
      onSetScale(newScale);
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
          onZoomChange={handleZoomChange}
        />
        
        <div className="relative w-full h-full">
          {/* Rulers */}
          <Rulers 
            scale={scale}
            offset={offset}
            width={containerSize.width}
            height={containerSize.height}
            cursorPosition={cursorPosition}
          />
          
          {/* Guide lines */}
          <GuideLines
            cursorPosition={cursorPosition}
            scale={scale}
            offset={offset}
            rulerSize={RULER_SIZE}
            canvasWidth={containerSize.width}
            canvasHeight={containerSize.height}
          />
          
          {/* Background canvas (black pattern) */}
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
            showGrid={showGrid}
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
            onPointerLeave={handlePointerLeave}
            onWheel={handleWheel || (() => {})}
            cursorPosition={cursorPosition}
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default DrawingArea;
