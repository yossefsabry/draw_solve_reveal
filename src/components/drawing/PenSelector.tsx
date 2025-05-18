
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brush, PencilLine, Pen, 
  PaintbrushVertical, Pencil, Paintbrush 
} from "lucide-react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";

export type PenType = "brush" | "pencil" | "pen" | "marker" | "calligraphy" | "highlighter";

interface PenSelectorProps {
  activePenType: PenType;
  onPenTypeChange: (penType: PenType) => void;
}

const PenSelector: React.FC<PenSelectorProps> = ({ activePenType, onPenTypeChange }) => {
  // Pen type configuration with icons, tooltips and descriptions
  const penTypes = [
    { 
      type: "brush" as PenType, 
      icon: <Brush />, 
      tooltip: "Brush", 
      description: "Soft edges with pressure sensitivity"
    },
    { 
      type: "pencil" as PenType, 
      icon: <Pencil />, 
      tooltip: "Pencil", 
      description: "Thin, light strokes"
    },
    { 
      type: "pen" as PenType, 
      icon: <Pen />, 
      tooltip: "Pen", 
      description: "Clean, consistent lines"
    },
    { 
      type: "marker" as PenType, 
      icon: <PencilLine />, 
      tooltip: "Marker", 
      description: "Thick, bold strokes"
    },
    { 
      type: "calligraphy" as PenType, 
      icon: <Paintbrush />, 
      tooltip: "Calligraphy", 
      description: "Angled strokes with varying width"
    },
    { 
      type: "highlighter" as PenType, 
      icon: <PaintbrushVertical />, 
      tooltip: "Highlighter", 
      description: "Semi-transparent wide strokes"
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
                variant="outline" 
                className="flex items-center gap-2 h-10"
                size="sm"
              >
                {activePen.icon}
                <span className="hidden sm:inline">{activePen.tooltip}</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select Pen Type</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <PopoverContent className="w-64 p-3">
        <h4 className="font-medium mb-2">Pen Types</h4>
        <div className="grid grid-cols-2 gap-2">
          {penTypes.map((pen) => (
            <TooltipProvider key={pen.type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activePenType === pen.type ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPenTypeChange(pen.type)}
                    className={`${activePenType === pen.type ? "tool-active" : ""} w-full h-20 flex flex-col items-center justify-center gap-1 p-2`}
                  >
                    <div className="text-lg">{pen.icon}</div>
                    <div className="text-xs font-medium">{pen.tooltip}</div>
                    <div className="text-[10px] text-muted-foreground text-center leading-tight">
                      {pen.description}
                    </div>
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
