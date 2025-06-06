
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { saveCanvasAsImage } from "./utils/CanvasRenderingUtils";

interface CanvasFooterProps {
  isLoading: boolean;
  onClear: () => void;
  onSolve: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const CanvasFooter: React.FC<CanvasFooterProps> = ({
  isLoading,
  onClear,
  onSolve,
  canvasRef
}) => {
  const handleSaveImage = () => {
    if (canvasRef?.current) {
      saveCanvasAsImage(canvasRef.current);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border-t bg-background">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveImage}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Save Image
        </Button>
      </div>
      
      <Button
        onClick={onSolve}
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90"
      >
        {isLoading ? "Solving..." : "Solve Math"}
      </Button>
    </div>
  );
};

export default CanvasFooter;
