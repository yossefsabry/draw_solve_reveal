
import React from "react";
import { Menu } from "lucide-react";
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
          <div className="grid grid-cols-2 gap-4">
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
                <Button
                  variant={isEraseActive ? "default" : "outline"}
                  onClick={toggleEraserMode}
                  className="w-full"
                >
                  Eraser
                </Button>
                
                <Button
                  variant={isMoveActive ? "default" : "outline"}
                  onClick={toggleMoveMode}
                  className="w-full"
                >
                  Move
                </Button>
                
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
            <h3 className="font-medium text-sm mb-3">Pen Types</h3>
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
