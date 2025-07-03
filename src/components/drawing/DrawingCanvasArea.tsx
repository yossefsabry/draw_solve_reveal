
import React, { useRef, useEffect, useState } from "react";
import { AnyDrawingObject, DrawingMode } from "./types";
import { ShapeType } from "./ShapeSelector";
import { useZoomPan } from "@/hooks/canvas/use-zoom-pan";
import { usePointerPosition } from "@/hooks/canvas/use-pointer-position";
import { useShapeDrawing } from "@/hooks/canvas/use-shape-drawing";
import { useFreeDrawing } from "@/hooks/canvas/use-free-drawing";
import { useKeyboardControl } from "@/hooks/canvas/use-keyboard-control";
import { renderCanvas } from "./utils/CanvasRenderingUtils";

interface DrawingCanvasAreaProps {
  color: string;
  brushSize: number;
  mode: DrawingMode;
  showGrid: boolean;
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomChange: (zoom: number) => void;
  offset: { x: number; y: number };
  onOffsetChange: (offset: { x: number; y: number }) => void;
  selectedShape: ShapeType;
}

const DrawingCanvasArea: React.FC<DrawingCanvasAreaProps> = ({
  color,
  brushSize,
  mode,
  showGrid,
  objects,
  setObjects,
  canvasRef,
  zoom,
  minZoom,
  maxZoom,
  onZoomChange,
  offset,
  onOffsetChange,
  selectedShape,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPath, setLastPath] = useState<{ x: number; y: number }[]>([]);
  
  // Hooks
  const { keyPressed } = useKeyboardControl();
  const {
    scale,
    offset: zoomOffset,
    isPanning,
    handleWheel,
    setDirectScale,
    startPanning,
    handlePanning,
    stopPanning
  } = useZoomPan();
  
  const { cursorPosition, getPointerPosition, updateCursorPosition, handleMouseLeave } = usePointerPosition(scale, zoomOffset);
  
  const {
    startShapeDrawing,
    previewShape,
    finishShapeDrawing,
    startPointRef
  } = useShapeDrawing({
    shapeTool: selectedShape,
    color,
    brushSize,
    scale,
    offset: zoomOffset,
    objects,
    setObjects,
    keyPressed
  });
  
  const {
    startFreeDrawing,
    continueFreeDrawing,
    finishFreeDrawing,
    currentPath
  } = useFreeDrawing({
    color,
    brushSize,
    scale,
    offset: zoomOffset,
    objects,
    setObjects,
    keyPressed
  });

  // Sync zoom and offset with parent component
  useEffect(() => {
    onZoomChange(scale);
  }, [scale, onZoomChange]);

  useEffect(() => {
    onOffsetChange(zoomOffset);
  }, [zoomOffset, onOffsetChange]);

  // Handle external zoom changes
  useEffect(() => {
    if (Math.abs(zoom - scale) > 0.01) {
      setDirectScale(zoom);
    }
  }, [zoom, scale, setDirectScale]);

  // Canvas setup and rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = containerRef.current;
    if (!container) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Render the canvas
    renderCanvas(canvas, objects, showGrid, scale, zoomOffset, lastPath, color, brushSize, isDrawing && mode === 'draw');
  }, [objects, showGrid, scale, zoomOffset, lastPath, color, brushSize, isDrawing, mode]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (keyPressed.space) {
      startPanning(e.clientX, e.clientY);
      return;
    }

    const pos = getPointerPosition(e);
    setIsDrawing(true);

    if (mode === 'draw') {
      startFreeDrawing(pos);
      setLastPath([pos]);
    } else {
      startShapeDrawing(pos, canvasRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPointerPosition(e);
    updateCursorPosition(pos);

    if (keyPressed.space && isPanning) {
      handlePanning(e.clientX, e.clientY);
      return;
    }

    if (!isDrawing) return;

    if (mode === 'draw') {
      continueFreeDrawing(pos);
      setLastPath(currentPath);
    } else {
      // Show shape preview
      previewShape(pos, canvasRef.current);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (keyPressed.space) {
      stopPanning();
      return;
    }

    if (!isDrawing) return;

    const pos = getPointerPosition(e);
    setIsDrawing(false);
    setLastPath([]);

    if (mode === 'draw') {
      const newObject = finishFreeDrawing(pos);
      if (newObject) {
        // Canvas will be re-rendered by useEffect
      }
    } else {
      const newObject = finishShapeDrawing(pos);
      if (newObject) {
        // Canvas will be re-rendered by useEffect
      }
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      handleMouseDown(mouseEvent as any);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      handleMouseMove(mouseEvent as any);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {
      clientX: 0,
      clientY: 0,
    });
    handleMouseUp(mouseEvent as any);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-black"
      style={{ cursor: keyPressed.space ? (isPanning ? 'grabbing' : 'grab') : 'crosshair' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseLeave();
          if (isDrawing) {
            handleMouseUp({} as any);
          }
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />
      
      {/* Cursor position indicator */}
      {cursorPosition && !keyPressed.space && (
        <div
          className="absolute pointer-events-none text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded"
          style={{
            left: cursorPosition.x * scale + zoomOffset.x + 10,
            top: cursorPosition.y * scale + zoomOffset.y - 25,
          }}
        >
          {Math.round(cursorPosition.x)}, {Math.round(cursorPosition.y)}
        </div>
      )}
    </div>
  );
};

export default DrawingCanvasArea;
