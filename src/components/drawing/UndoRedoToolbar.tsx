
import React from "react";
import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isMobile: boolean;
}

const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isMobile
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
      >
        <Undo className="h-5 w-5" />
        {isMobile && <span className="ml-1">Undo</span>}
      </Button>
      
      <Button
        variant="outline"
        size={isMobile ? "sm" : "icon"}
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
      >
        <Redo className="h-5 w-5" />
        {isMobile && <span className="ml-1">Redo</span>}
      </Button>
    </div>
  );
};

export default UndoRedoToolbar;
