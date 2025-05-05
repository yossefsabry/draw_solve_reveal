
import React from "react";
import { Slider } from "@/components/ui/slider";

interface BrushSizeControlProps {
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
}

const BrushSizeControl: React.FC<BrushSizeControlProps> = ({
  brushSize,
  onBrushSizeChange,
}) => {
  return (
    <div className="flex items-center gap-2 mr-4">
      <span className="text-sm whitespace-nowrap">Size:</span>
      <Slider
        value={[brushSize]}
        min={1}
        max={20}
        step={1}
        onValueChange={(value) => onBrushSizeChange(value[0])}
        className="w-28 md:w-32"
      />
    </div>
  );
};

export default BrushSizeControl;
