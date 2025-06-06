
import React from "react";
import { Eraser, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DrawingMode } from "./types";
import ColorPicker from "./ColorPicker";
import BrushSizeControl from "./BrushSizeControl";

interface ToolBarProps {
  color: string;
  brushSize: number;
  mode: DrawingMode;
  isMobile: boolean;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onModeChange: (mode: DrawingMode) => void;
}

const ToolBar: React.FC<ToolBarProps> = ({
  color,
  brushSize,
  mode,
  isMobile,
  onColorChange,
  onBrushSizeChange,
  onModeChange,
}) => {
  const toggleEraserMode = () => {
    onModeChange(mode === "erase" ? "draw" : "erase");
  };

  const setDrawMode = () => {
    onModeChange("draw");
  };

  return (
    <div className="flex flex-wrap gap-2 p-2">
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

      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mode === "erase" ? "default" : "outline"}
                size={isMobile ? "sm" : "icon"}
                onClick={toggleEraserMode}
                className={mode === "erase" ? "bg-primary text-primary-foreground" : ""}
              >
                <Eraser className="h-5 w-5" />
                {isMobile && <span className="ml-1">Erase</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{mode === "erase" ? "Stop Erasing" : "Eraser Tool"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ToolBar;
