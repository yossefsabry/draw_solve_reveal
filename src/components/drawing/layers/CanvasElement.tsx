
import React from "react";

interface CanvasElementProps {
  rulerSize: number;
  width: number;
  height: number;
  isPanning: boolean;
  mode: string;
  onCanvasRef: (ref: HTMLCanvasElement | null) => void;
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseMove: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseUp: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseLeave: (e: React.MouseEvent | React.TouchEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  rulerSize,
  width,
  height,
  isPanning,
  mode,
  onCanvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel
}) => {
  return (
    <canvas
      ref={onCanvasRef}
      className="absolute inset-0 z-10 canvas-container"
      style={{ 
        marginTop: rulerSize, 
        marginLeft: rulerSize,
        width: width - rulerSize,
        height: height - rulerSize,
        cursor: isPanning ? 'grab' : (mode === 'erase' ? 'none' : 'crosshair'),
        touchAction: 'none',
        background: 'black' // Black background
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onMouseDown}
      onTouchMove={onMouseMove}
      onTouchEnd={onMouseUp}
      onWheel={onWheel}
    />
  );
};

export default CanvasElement;
