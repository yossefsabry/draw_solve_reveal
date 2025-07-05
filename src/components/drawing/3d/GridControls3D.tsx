
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Grid3X3, Eye, EyeOff, Settings } from 'lucide-react';

interface GridControls3DProps {
  showGrid: boolean;
  gridMode: 'standard' | 'detailed' | 'minimal';
  showAxes: boolean;
  showLabels: boolean;
  onToggleGrid: () => void;
  onGridModeChange: (mode: 'standard' | 'detailed' | 'minimal') => void;
  onToggleAxes: () => void;
  onToggleLabels: () => void;
}

const GridControls3D: React.FC<GridControls3DProps> = ({
  showGrid,
  gridMode,
  showAxes,
  showLabels,
  onToggleGrid,
  onGridModeChange,
  onToggleAxes,
  onToggleLabels
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={showGrid ? "default" : "outline"}
        size="sm"
        onClick={onToggleGrid}
        className="flex items-center gap-2"
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">3D Options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onGridModeChange('minimal')}>
            <div className="flex items-center justify-between w-full">
              <span>Minimal Grid</span>
              {gridMode === 'minimal' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onGridModeChange('standard')}>
            <div className="flex items-center justify-between w-full">
              <span>Standard Grid</span>
              {gridMode === 'standard' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onGridModeChange('detailed')}>
            <div className="flex items-center justify-between w-full">
              <span>Detailed Grid</span>
              {gridMode === 'detailed' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleAxes}>
            <div className="flex items-center justify-between w-full">
              <span>Show Axes</span>
              {showAxes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleLabels}>
            <div className="flex items-center justify-between w-full">
              <span>Show Labels</span>
              {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GridControls3D;
