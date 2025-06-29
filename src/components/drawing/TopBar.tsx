
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, RotateCcw, Undo, Redo } from "lucide-react";

interface TopBarProps {
  is3D: boolean;
  onToggle2D3D: () => void;
  showLeftSidebar: boolean;
  onToggleLeftSidebar: () => void;
  showRightSidebar: boolean;
  onToggleRightSidebar: () => void;
  isMobile: boolean;
  onResetView?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  is3D,
  onToggle2D3D,
  showLeftSidebar,
  onToggleLeftSidebar,
  showRightSidebar,
  onToggleRightSidebar,
  isMobile,
  onResetView,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  return (
    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-6">
        {/* 2D/3D Toggle */}
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">2D</span>
          <Switch 
            checked={is3D} 
            onCheckedChange={onToggle2D3D}
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">3D</span>
        </div>
        
        {/* Reset View Button */}
        {!is3D && onResetView && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetView}
            className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-4 py-2"
            title="Reset view to center (0,0)"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset View</span>
          </Button>
        )}
        
        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
            <span className="hidden sm:inline">Undo</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
            <span className="hidden sm:inline">Redo</span>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Sidebar visibility controls */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleLeftSidebar}
          className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-4 py-2"
        >
          {showLeftSidebar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="hidden sm:inline">Tools</span>
        </Button>
        
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleRightSidebar}
            className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-4 py-2"
          >
            {showRightSidebar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">Options</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
