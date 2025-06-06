
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brush, PencilLine, Pen, 
  PaintbrushVertical, Pencil, Paintbrush,
  Pipette, Eraser2
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
  // Enhanced pen types with more options like GIMP
  const penTypes = [
    { 
      type: "brush" as PenType, 
      icon: <Brush />, 
      tooltip: "Brush", 
      description: "Soft artistic brush"
    },
    { 
      type: "pencil" as PenType, 
      icon: <Pencil />, 
      tooltip: "Pencil", 
      description: "Precise thin lines"
    },
    { 
      type: "pen" as PenType, 
      icon: <Pen />, 
      tooltip: "Pen", 
      description: "Clean consistent ink"
    },
    { 
      type: "marker" as PenType, 
      icon: <PencilLine />, 
      tooltip: "Marker", 
      description: "Bold thick strokes"
    },
    { 
      type: "calligraphy" as PenType, 
      icon: <Paintbrush />, 
      tooltip: "Calligraphy", 
      description: "Angled artistic pen"
    },
    { 
      type: "highlighter" as PenType, 
      icon: <PaintbrushVertical />, 
      tooltip: "Highlighter", 
      description: "Transparent overlay"
    },
    { 
      type: "spray" as PenType, 
      icon: <Pipette />, 
      tooltip: "Spray", 
      description: "Airbrush effect"
    },
    { 
      type: "charcoal" as PenType, 
      icon: <Eraser2 />, 
      tooltip: "Charcoal", 
      description: "Textured artistic tool"
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
        <h4 className="font-medium mb-3">Drawing Tools</h4>
        <div className="grid grid-cols-2 gap-2">
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
                    } w-full h-20 flex flex-col items-center justify-center gap-1 p-2 transition-all`}
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
