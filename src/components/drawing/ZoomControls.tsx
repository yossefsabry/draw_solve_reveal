import React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}
const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut
}) => {
  return <div className="fixed top-52 right-4 flex flex-col gap-2 z-30">
      <button className="bg-gray-800 p-2 rounded-md shadow-lg text-white hover:bg-gray-700 transition-colors" onClick={onZoomIn} aria-label="Zoom in">
        <ZoomIn size={20} />
      </button>
      <button className="bg-gray-800 p-2 rounded-md shadow-lg text-white hover:bg-gray-700 transition-colors" onClick={onZoomOut} aria-label="Zoom out">
        <ZoomOut size={20} />
      </button>
      <div className="text-center bg-gray-800 p-2 rounded-md shadow-lg text-sm font-semibold text-white">
        {Math.round(scale * 100)}%
      </div>
    </div>;
};
export default ZoomControls;