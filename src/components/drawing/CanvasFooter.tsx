
import React from "react";
import { RotateCcw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasFooterProps {
  isLoading: boolean;
  onClear: () => void;
  onSolve: () => void;
}

const CanvasFooter: React.FC<CanvasFooterProps> = ({
  isLoading,
  onClear,
  onSolve,
}) => {
  return (
    <div className="flex justify-between p-4 border-t">
      <Button
        variant="outline"
        onClick={onClear}
        className="flex items-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Clear
      </Button>

      <Button
        disabled={isLoading}
        onClick={onSolve}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="loading-spinner h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Solving...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Solve
          </>
        )}
      </Button>
    </div>
  );
};

export default CanvasFooter;
