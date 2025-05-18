
import React from "react";
import { Menu, Eraser, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DrawingMode, ShapeTool } from "./types";
import ColorPicker from "./ColorPicker";
import BrushSizeControl from "./BrushSizeControl";
import ShapeSelector from "./ShapeSelector";
import PenSelector, { PenType } from "./PenSelector";

interface MobileToolMenuProps {
  color: string;
  brushSize: number;
  mode: DrawingMode;
  isShapesOpen: boolean;
  penType: PenType;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onModeChange: (mode: DrawingMode) => void;
  onShapesOpenChange: (open: boolean) => void;
  onShapeSelect: (shape: ShapeTool) => void;
  onPenTypeChange: (penType: PenType) => void;
  toggleEraserMode: () => void;
  toggleMoveMode: () => void;
  isEraseActive: boolean;
  isMoveActive: boolean;
}

const MobileToolMenu: React.FC<MobileToolMenuProps> = ({
  color,
  brushSize,
  mode,
  isShapesOpen,
  penType,
  onColorChange,
  onBrushSizeChange,
  onModeChange,
  onShapesOpenChange,
  onShapeSelect,
  onPenTypeChange,
  toggleEraserMode,
  toggleMoveMode,
  isEraseActive,
  isMoveActive
}) => {
  const setDrawMode = () => {
    onModeChange("draw");
  };

  return (
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle tools menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="pb-6">
        <DrawerHeader className="text-center">
          <DrawerTitle>Drawing Tools</DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Color & Brush</h3>
              <div className="flex flex-col gap-4">
                <ColorPicker
                  color={color}
                  mode={mode}
                  isMobile={true}
                  onColorChange={onColorChange}
                  onModeChange={setDrawMode}
                />
                <BrushSizeControl
                  brushSize={brushSize}
                  onBrushSizeChange={onBrushSizeChange}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Tools</h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isEraseActive ? "default" : "outline"}
                    onClick={toggleEraserMode}
                    className="flex-1 gap-2"
                  >
                    <Eraser className="h-4 w-4" />
                    Eraser
                  </Button>
                  
                  <Button
                    variant={isMoveActive ? "default" : "outline"}
                    onClick={toggleMoveMode}
                    className="flex-1 gap-2"
                  >
                    <Move className="h-4 w-4" />
                    Move
                  </Button>
                </div>
                
                {isEraseActive && (
                  <div className="bg-muted p-3 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Eraser Size</h4>
                    <input 
                      type="range" 
                      min="5" 
                      max="50" 
                      value={brushSize} 
                      onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                      className="w-full" 
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div 
                        className="bg-gray-400 rounded-full" 
                        style={{ 
                          width: `${brushSize * 2}px`, 
                          height: `${brushSize * 2}px` 
                        }}
                      ></div>
                      <div className="text-sm">{brushSize}px</div>
                    </div>
                  </div>
                )}
                
                <ShapeSelector
                  isOpen={isShapesOpen}
                  isMobile={true}
                  isShapeMode={mode === "shape"}
                  onOpenChange={onShapesOpenChange}
                  onShapeSelect={onShapeSelect}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <PenSelector 
              activePenType={penType} 
              onPenTypeChange={onPenTypeChange} 
            />
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileToolMenu;
