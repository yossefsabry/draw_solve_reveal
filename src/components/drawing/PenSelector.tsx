
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
  // Pen type configuration with icons and tooltips
  const penTypes = [
    { type: "brush" as PenType, icon: <Brush />, tooltip: "Brush" },
    { type: "pencil" as PenType, icon: <Pencil />, tooltip: "Pencil" },
    { type: "pen" as PenType, icon: <Pen />, tooltip: "Pen" },
    { type: "marker" as PenType, icon: <PencilLine />, tooltip: "Marker" },
    { type: "calligraphy" as PenType, icon: <Paintbrush />, tooltip: "Calligraphy" },
    { type: "highlighter" as PenType, icon: <PaintbrushVertical />, tooltip: "Highlighter" },
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
        <div className="grid grid-cols-3 gap-2">
          {penTypes.map((pen) => (
            <Tooltip key={pen.type}>
              <TooltipTrigger asChild>
                <Button
                  variant={activePenType === pen.type ? "default" : "outline"}
                  size="icon"
                  onClick={() => {
                    onPenTypeChange(pen.type);
                  }}
                  className={`${activePenType === pen.type ? "tool-active" : ""} w-full h-14 flex flex-col items-center justify-center gap-1`}
                >
                  <div>{pen.icon}</div>
                  <div className="text-xs">{pen.tooltip}</div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{pen.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PenSelector;
