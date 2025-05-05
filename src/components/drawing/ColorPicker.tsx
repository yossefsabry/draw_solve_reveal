
import React from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Available colors for the color picker
const COLORS = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FF8000", // Orange
  "#8000FF", // Purple
  "#0080FF", // Light Blue
];

// Gradient colors
const GRADIENT_COLORS = [
  "linear-gradient(to right, #ee9ca7, #ffdde1)",
  "linear-gradient(to right, #c1c161, #d4d4b1)",
  "linear-gradient(to right, #243949, #517fa4)",
  "linear-gradient(to top, #e6b980, #eacda3)",
  "linear-gradient(to top, #d299c2, #fef9d7)",
  "linear-gradient(to top, #accbee, #e7f0fd)",
];

interface ColorPickerProps {
  color: string;
  mode: string;
  isMobile: boolean;
  onColorChange: (color: string) => void;
  onModeChange: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  mode,
  isMobile,
  onColorChange,
  onModeChange,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size={isMobile ? "sm" : "icon"} className="relative">
          <Palette className="h-5 w-5" />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          {isMobile && <span className="ml-1">Colors</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Basic Colors</h4>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  className={`w-6 h-6 rounded-full border border-gray-300 cursor-pointer transition-transform hover:scale-125 ${
                    color === colorOption && mode !== "erase" ? "ring-2 ring-black dark:ring-white" : ""
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => {
                    onColorChange(colorOption);
                    onModeChange();
                  }}
                  aria-label={`Select ${colorOption} color`}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Gradient Palettes</h4>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_COLORS.map((gradientColor, index) => (
                <button
                  key={index}
                  className="w-full h-8 rounded cursor-pointer transition-transform hover:scale-105"
                  style={{ background: gradientColor }}
                  onClick={() => {
                    // Just use a fixed color for each gradient
                    const gradientBaseColors = [
                      "#ee9ca7",
                      "#c1c161",
                      "#243949",
                      "#e6b980",
                      "#d299c2",
                      "#accbee",
                    ];
                    onColorChange(
                      gradientBaseColors[index % gradientBaseColors.length]
                    );
                    onModeChange();
                  }}
                  aria-label={`Select gradient color ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
