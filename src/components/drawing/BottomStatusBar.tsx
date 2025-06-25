
import React from 'react';

interface BottomStatusBarProps {
  drawingMode: string;
  mode: string;
  brushSize: number;
  color: string;
  is2D: boolean;
  zoom: number;
  selectedShape?: string;
}

const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  drawingMode,
  mode,
  brushSize,
  color,
  is2D,
  zoom,
  selectedShape
}) => {
  return (
    <div className="h-8 bg-[#181818] border-t border-neutral-800 flex items-center px-4 text-xs">
      <span>Mode: {drawingMode.toUpperCase()} - {mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
      <span className="ml-6">Brush Size: {brushSize}px</span>
      <span className="ml-6">Color: {color}</span>
      {is2D && <span className="ml-6">Zoom: {Math.round(zoom * 100)}%</span>}
      {mode === "shape" && selectedShape && <span className="ml-6">Shape: {selectedShape}</span>}
    </div>
  );
};

export default BottomStatusBar;
