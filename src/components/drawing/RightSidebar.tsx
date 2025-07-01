
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Undo, Redo } from "lucide-react";

interface RightSidebarProps {
  show: boolean;
  isMobile: boolean;
  onClearAll: () => void;
  objects: any[];
  results: any[];
  customTexts: any[];
  is2D: boolean;
  isSolving: boolean;
  onSolve: () => void;
  zoom: number;
  zoomInput: string;
  onZoomInputChange: (value: string) => void;
  onZoomInputBlur: () => void;
  onZoomInputKeyDown: (e: React.KeyboardEvent) => void;
  minZoom: number;
  maxZoom: number;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  color: string;
  onColorChange: (color: string) => void;
  mode: string;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  show,
  isMobile,
  onClearAll,
  objects,
  results,
  customTexts,
  is2D,
  isSolving,
  onSolve,
  zoom,
  zoomInput,
  onZoomInputChange,
  onZoomInputBlur,
  onZoomInputKeyDown,
  minZoom,
  maxZoom,
  brushSize,
  onBrushSizeChange,
  color,
  onColorChange,
  mode,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }
      // Ctrl+Shift+Z or Ctrl+Y for redo
      else if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        onRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo]);

  if (!(isMobile ? show : true)) return null;

  return (
    <div className="flex flex-col w-full md:w-56 bg-[#181818] border-t md:border-t-0 md:border-l border-neutral-800 p-4 gap-6 overflow-y-auto max-h-full">
      {/* Undo/Redo Buttons */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 flex items-center gap-2" 
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
          Undo
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 flex items-center gap-2" 
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
          Redo
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex-1" 
          onClick={onClearAll}
          disabled={objects.length === 0 && results.length === 0 && customTexts.length === 0}
        >
          Clear All
        </Button>
        
        {is2D && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            disabled={isSolving}
            onClick={onSolve}
          >
            {isSolving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Solving...
              </span>
            ) : (
              "Solve"
            )}
          </Button>
        )}
      </div>
      
      {/* Zoom Control - only for 2D mode */}
      {is2D && (
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Zoom</label>
          <input
            type="text"
            value={zoomInput}
            onChange={e => onZoomInputChange(e.target.value)}
            onBlur={onZoomInputBlur}
            onKeyDown={onZoomInputKeyDown}
            className="w-full px-2 py-1 rounded bg-background text-foreground border border-border"
          />
          <div className="text-xs mt-1">{Math.round(zoom * 100)}%</div>
        </div>
      )}
      
      <div>
        <label className="block mb-2 text-sm font-medium">Brush/Eraser Size</label>
        <input
          type="range"
          min={1}
          max={50}
          value={brushSize}
          onChange={e => onBrushSizeChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs mt-1">{brushSize}px</div>
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Color</label>
        <input
          type="color"
          value={color}
          onChange={e => onColorChange(e.target.value)}
          className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
          disabled={mode === "erase"}
        />
      </div>
    </div>
  );
};

export default RightSidebar;
