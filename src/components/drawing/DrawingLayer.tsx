
import React from "react";
import { AnyDrawingObject, DrawingMode } from "./types";
import CanvasElement from "./layers/CanvasElement";
import EraserCursor from "./layers/EraserCursor";
import CanvasRenderer from "./layers/CanvasRenderer";

interface DrawingLayerProps {
  isDrawing: boolean;
  mode: DrawingMode;
  color: string;
  brushSize: number;
  objects: AnyDrawingObject[];
  showGrid?: boolean;
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
  cursorPosition?: { x: number; y: number } | null;
}

const DrawingLayer: React.FC<DrawingLayerProps> = ({
  isDrawing,
  mode,
  color,
  brushSize,
  objects,
  showGrid = false,
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
  cursorPosition,
}) => {
  // Calculate adjusted dimensions without the ruler
  const canvasWidth = width - rulerSize;
  const canvasHeight = height - rulerSize;

  return (
    <>
      {/* Main canvas element that handles all interactions */}
      <CanvasElement
        rulerSize={rulerSize}
        width={width}
        height={height}
        isPanning={isPanning}
        mode={mode}
        onCanvasRef={onCanvasRef}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerLeave}
        onWheel={onWheel}
      />
      
      {/* Canvas renderer with grid support */}
      <CanvasRenderer
        width={canvasWidth}
        height={canvasHeight}
        objects={objects}
        scale={scale}
        offset={offset}
        color={color}
        brushSize={brushSize}
        mode={mode}
        showGrid={showGrid}
        onCanvasRef={() => {}} // This renderer doesn't need the ref
      />
      
      {/* Eraser cursor indicator */}
      {mode === "erase" && (
        <EraserCursor
          cursorPosition={cursorPosition}
          brushSize={brushSize}
          scale={scale}
          offset={offset}
        />
      )}
    </>
  );
};

export default DrawingLayer;
