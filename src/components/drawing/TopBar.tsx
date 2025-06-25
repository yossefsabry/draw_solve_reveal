
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";

interface TopBarProps {
  is3D: boolean;
  onToggle2D3D: () => void;
  showLeftSidebar: boolean;
  onToggleLeftSidebar: () => void;
  showRightSidebar: boolean;
  onToggleRightSidebar: () => void;
  isMobile: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  is3D,
  onToggle2D3D,
  showLeftSidebar,
  onToggleLeftSidebar,
  showRightSidebar,
  onToggleRightSidebar,
  isMobile
}) => {
  return (
    <div className="flex justify-between items-center p-2 bg-[#181818] border-b border-neutral-800">
      <div className="flex items-center gap-4">
        {/* 2D/3D Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm">2D</span>
          <Switch checked={is3D} onCheckedChange={onToggle2D3D} />
          <span className="text-sm">3D</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Sidebar visibility controls */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleLeftSidebar}
          className="flex items-center gap-1"
        >
          {showLeftSidebar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          Tools
        </Button>
        
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleRightSidebar}
            className="flex items-center gap-1"
          >
            {showRightSidebar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Options
          </Button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
