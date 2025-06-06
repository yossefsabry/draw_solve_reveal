
import React from "react";
import { 
  Circle, 
  Square, 
  Triangle, 
  Minus, 
  ArrowRight, 
  Shapes,
  Type,
  Hexagon
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
          className={`${isShapeMode ? "bg-primary text-primary-foreground ring-2 ring-primary" : ""} transition-all`}
        >
          <Shapes className="h-5 w-5" />
          {isMobile && <span className="ml-1">Shapes</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <h4 className="font-medium mb-2">Shape Tools</h4>
        <ToggleGroup type="single" variant="outline" className="grid grid-cols-3 gap-2">
          <ToggleGroupItem
            value="rectangle"
            onClick={() => onShapeSelect("rectangle")}
            aria-label="Rectangle shape"
            className="h-12 w-12"
          >
            <Square className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="circle"
            onClick={() => onShapeSelect("circle")}
            aria-label="Circle shape"
            className="h-12 w-12"
          >
            <Circle className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="triangle"
            onClick={() => onShapeSelect("triangle")}
            aria-label="Triangle shape"
            className="h-12 w-12"
          >
            <Triangle className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="line"
            onClick={() => onShapeSelect("line")}
            aria-label="Line shape"
            className="h-12 w-12"
          >
            <Minus className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="arrow"
            onClick={() => onShapeSelect("arrow")}
            aria-label="Arrow shape"
            className="h-12 w-12"
          >
            <ArrowRight className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="text"
            onClick={() => onShapeSelect("text")}
            aria-label="Text tool"
            className="h-12 w-12"
          >
            <Type className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="ellipse"
            onClick={() => onShapeSelect("ellipse")}
            aria-label="Ellipse shape"
            className="h-12 w-12"
          >
            <Circle className="h-5 w-5 transform scale-x-150" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="polygon"
            onClick={() => onShapeSelect("polygon")}
            aria-label="Polygon shape"
            className="h-12 w-12"
          >
            <Hexagon className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </PopoverContent>
    </Popover>
  );
};

export default ShapeSelector;
