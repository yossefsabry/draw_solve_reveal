
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Grid3X3 } from "lucide-react";

interface GridToggleProps {
  showGrid: boolean;
  onToggle: (show: boolean) => void;
}

const GridToggle: React.FC<GridToggleProps> = ({ showGrid, onToggle }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={() => onToggle(!showGrid)}
            className={`${showGrid ? "bg-primary text-primary-foreground ring-2 ring-primary" : ""} transition-all`}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Grid</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{showGrid ? "Hide Grid" : "Show Grid"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GridToggle;
