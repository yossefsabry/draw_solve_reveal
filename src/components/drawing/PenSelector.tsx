
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brush, PencilLine, Pen, 
  PaintbrushVertical, Pencil, Paintbrush,
  Pipette, Eraser
} from "lucide-react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";

export type PenType = "brush" | "pencil" | "pen" | "marker" | "calligraphy" | "highlighter" | "spray" | "charcoal";

interface PenSelectorProps {
  activePenType: PenType;
  onPenTypeChange: (penType: PenType) => void;
}

const PenSelector: React.FC<PenSelectorProps> = ({ activePenType, onPenTypeChange }) => {
  // Simplified pen types with shorter names
  const penTypes = [
    { 
      type: "brush" as PenType, 
      icon: <Brush />, 
      tooltip: "Brush", 
      description: "Soft brush"
    },
    { 
      type: "pencil" as PenType, 
      icon: <Pencil />, 
      tooltip: "Pencil", 
      description: "Thin lines"
    },
    { 
      type: "pen" as PenType, 
      icon: <Pen />, 
      tooltip: "Pen", 
      description: "Clean ink"
    },
    { 
      type: "marker" as PenType, 
      icon: <PencilLine />, 
      tooltip: "Marker", 
      description: "Bold strokes"
    },
    { 
      type: "calligraphy" as PenType, 
      icon: <Paintbrush />, 
      tooltip: "Calli", 
      description: "Angled pen"
    },
    { 
      type: "highlighter" as PenType, 
      icon: <PaintbrushVertical />, 
      tooltip: "Light", 
      description: "Transparent"
    },
    { 
      type: "spray" as PenType, 
      icon: <Pipette />, 
      tooltip: "Spray", 
      description: "Airbrush"
    },
    { 
      type: "charcoal" as PenType, 
      icon: <Eraser />, 
      tooltip: "Coal", 
      description: "Textured"
    },
  ];

  // Find the active pen to display on the trigger button
  const activePen = penTypes.find(pen => pen.type === activePenType) || penTypes[0];

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button 
                variant={activePenType ? "default" : "outline"}
                className={`flex items-center gap-2 h-10 ${activePenType ? "bg-primary text-primary-foreground ring-2 ring-primary" : ""}`}
                size="sm"
              >
                {activePen.icon}
                <span className="hidden sm:inline">{activePen.tooltip}</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select Drawing Tool</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <PopoverContent className="w-80 p-3">
        <div className="grid grid-cols-4 gap-2">
          {penTypes.map((pen) => (
            <TooltipProvider key={pen.type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activePenType === pen.type ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPenTypeChange(pen.type)}
                    className={`${
                      activePenType === pen.type 
                        ? "bg-primary text-primary-foreground ring-2 ring-primary shadow-md" 
                        : "hover:bg-secondary"
                    } w-full h-16 flex flex-col items-center justify-center gap-1 p-1 transition-all`}
                  >
                    <div className="text-base">{pen.icon}</div>
                    <div className="text-xs font-medium">{pen.tooltip}</div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{pen.tooltip}: {pen.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PenSelector;
