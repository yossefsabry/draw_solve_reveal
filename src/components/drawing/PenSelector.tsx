
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brush, PencilLine, Pen, 
  PaintbrushVertical, Pencil, Paintbrush 
} from "lucide-react";

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

  return (
    <div className="flex flex-wrap gap-2">
      {penTypes.map((pen) => (
        <Tooltip key={pen.type} delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant={activePenType === pen.type ? "default" : "outline"}
              size="icon"
              onClick={() => onPenTypeChange(pen.type)}
              className={activePenType === pen.type ? "tool-active" : ""}
            >
              {pen.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{pen.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default PenSelector;
