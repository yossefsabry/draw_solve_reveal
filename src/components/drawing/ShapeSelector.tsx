
import React from "react";
import { 
  Circle, 
  Square, 
  Triangle, 
  Minus, 
  ArrowRight, 
  Shapes 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { ShapeTool } from "./types";

interface ShapeSelectorProps {
  isOpen: boolean;
  isMobile: boolean;
  isShapeMode: boolean;
  onOpenChange: (open: boolean) => void;
  onShapeSelect: (shape: ShapeTool) => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  isOpen,
  isMobile,
  isShapeMode,
  onOpenChange,
  onShapeSelect,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={isShapeMode ? "default" : "outline"}
          size={isMobile ? "sm" : "icon"}
          className={isShapeMode ? "tool-active" : ""}
        >
          <Shapes className="h-5 w-5" />
          {isMobile && <span className="ml-1">Shapes</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem
            value="rectangle"
            onClick={() => onShapeSelect("rectangle")}
            aria-label="Rectangle shape"
          >
            <Square className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="circle"
            onClick={() => onShapeSelect("circle")}
            aria-label="Circle shape"
          >
            <Circle className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="triangle"
            onClick={() => onShapeSelect("triangle")}
            aria-label="Triangle shape"
          >
            <Triangle className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="line"
            onClick={() => onShapeSelect("line")}
            aria-label="Line shape"
          >
            <Minus className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="arrow"
            onClick={() => onShapeSelect("arrow")}
            aria-label="Arrow shape"
          >
            <ArrowRight className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </PopoverContent>
    </Popover>
  );
};

export default ShapeSelector;
