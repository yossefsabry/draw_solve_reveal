
import React from "react";
import { AnyDrawingObject, DrawingMode } from "./types";
import { PenType } from "./PenSelector";
import CanvasElement from "./layers/CanvasElement";
import EraserCursor from "./layers/EraserCursor";
import CanvasRenderer from "./layers/CanvasRenderer";

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
  cursorPosition?: { x: number; y: number } | null;
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
