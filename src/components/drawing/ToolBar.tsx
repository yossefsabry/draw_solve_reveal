
import React from "react";
import { Eraser, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DrawingMode } from "./types";
import ColorPicker from "./ColorPicker";
import BrushSizeControl from "./BrushSizeControl";
import ShapeSelector from "./ShapeSelector";
import MobileToolMenu from "./MobileToolMenu";
import PenSelector, { PenType } from "./PenSelector";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ToolBarProps {
  color: string;
  brushSize: number;
  mode: DrawingMode;
  isMobile: boolean;
  isShapesOpen: boolean;
  penType: PenType;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onModeChange: (mode: DrawingMode) => void;
  onShapesOpenChange: (open: boolean) => void;
  onShapeSelect: (shape: any) => void;
  onPenTypeChange: (penType: PenType) => void;
}

const ToolBar: React.FC<ToolBarProps> = ({
  color,
  brushSize,
  mode,
  isMobile,
  isShapesOpen,
  penType,
  onColorChange,
  onBrushSizeChange,
  onModeChange,
  onShapesOpenChange,
  onShapeSelect,
  onPenTypeChange,
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

  // For orientation changes in mobile
  React.useEffect(() => {
    const handleOrientationChange = () => {
      // Force a re-render when orientation changes
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="flex justify-center p-2">
        <MobileToolMenu
          color={color}
          brushSize={brushSize}
          mode={mode}
          isShapesOpen={isShapesOpen}
          penType={penType}
          onColorChange={onColorChange}
          onBrushSizeChange={onBrushSizeChange}
          onModeChange={onModeChange}
          onShapesOpenChange={onShapesOpenChange}
          onShapeSelect={onShapeSelect}
          onPenTypeChange={onPenTypeChange}
          toggleEraserMode={toggleEraserMode}
          toggleMoveMode={toggleMoveMode}
          isEraseActive={mode === "erase"}
          isMoveActive={mode === "move"}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 p-4">
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
      
      <div className="flex gap-2 items-center">
        <div className="flex-col">
          <div className="text-xs text-muted-foreground mb-1">Pen Types</div>
          <PenSelector 
            activePenType={penType} 
            onPenTypeChange={onPenTypeChange} 
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Popover>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant={mode === "erase" ? "default" : "outline"}
                size="icon"
                className={`${mode === "erase" ? "tool-active" : ""} h-10 w-10`}
              >
                <Eraser className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eraser Tool</p>
          </TooltipContent>
          
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <h4 className="font-medium">Eraser Size</h4>
              <input 
                type="range" 
                min="5" 
                max="50" 
                value={brushSize} 
                onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                className="w-full" 
              />
              <div className="flex items-center justify-between">
                <div 
                  className="bg-gray-400 rounded-full" 
                  style={{ 
                    width: `${brushSize * 2}px`, 
                    height: `${brushSize * 2}px` 
                  }}
                ></div>
                <div className="text-sm">{brushSize}px</div>
              </div>
              <Button 
                variant="default" 
                className="w-full" 
                onClick={toggleEraserMode}
              >
                {mode === "erase" ? "Stop Erasing" : "Start Erasing"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant={mode === "move" ? "default" : "outline"}
              size="icon"
              onClick={toggleMoveMode}
              className={mode === "move" ? "tool-active" : ""}
            >
              <Move className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Move Canvas</p>
          </TooltipContent>
        </Tooltip>

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
