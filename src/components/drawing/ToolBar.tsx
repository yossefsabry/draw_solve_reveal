
import React from "react";
import { Eraser, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrawingMode } from "./types";
import ColorPicker from "./ColorPicker";
import BrushSizeControl from "./BrushSizeControl";
import ShapeSelector from "./ShapeSelector";

interface ToolBarProps {
  color: string;
  brushSize: number;
  mode: DrawingMode;
  isMobile: boolean;
  isShapesOpen: boolean;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onModeChange: (mode: DrawingMode) => void;
  onShapesOpenChange: (open: boolean) => void;
  onShapeSelect: (shape: any) => void;
}

const ToolBar: React.FC<ToolBarProps> = ({
  color,
  brushSize,
  mode,
  isMobile,
  isShapesOpen,
  onColorChange,
  onBrushSizeChange,
  onModeChange,
  onShapesOpenChange,
  onShapeSelect,
}) => {
  const toggleEraserMode = () => {
    onModeChange(mode === "erase" ? "draw" : "erase");
  };

  const toggleMoveMode = () => {
    onModeChange(mode === "move" ? "draw" : "move");
  };

  const setDrawMode = () => {
    onModeChange("draw");
  };

  return (
    <div className={`flex flex-wrap gap-2 p-4 border-b ${isMobile ? 'overflow-x-auto pb-6' : ''}`}>
      <ColorPicker
        color={color}
        mode={mode}
        isMobile={isMobile}
        onColorChange={onColorChange}
        onModeChange={setDrawMode}
      />

      <BrushSizeControl 
        brushSize={brushSize} 
        onBrushSizeChange={onBrushSizeChange} 
      />

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={mode === "erase" ? "default" : "outline"}
          size={isMobile ? "sm" : "icon"}
          onClick={toggleEraserMode}
          className={mode === "erase" ? "tool-active" : ""}
        >
          <Eraser className="h-5 w-5" />
          {isMobile && <span className="ml-1">Erase</span>}
        </Button>

        <Button
          variant={mode === "move" ? "default" : "outline"}
          size={isMobile ? "sm" : "icon"}
          onClick={toggleMoveMode}
          className={mode === "move" ? "tool-active" : ""}
        >
          <Move className="h-5 w-5" />
          {isMobile && <span className="ml-1">Move</span>}
        </Button>

        <ShapeSelector
          isOpen={isShapesOpen}
          isMobile={isMobile}
          isShapeMode={mode === "shape"}
          onOpenChange={onShapesOpenChange}
          onShapeSelect={onShapeSelect}
        />
      </div>
    </div>
  );
};

export default ToolBar;
