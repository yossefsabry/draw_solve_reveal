
import { AnyDrawingObject } from "./types";

// Simplified utility for finding objects at position (mostly for future use)
export const findObjectAtPosition = (
  objects: AnyDrawingObject[], 
  x: number, 
  y: number
): number => {
  // Simple implementation for draw objects
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    if (obj.type === 'draw' && obj.points) {
      // Check if point is near any of the drawing points
      for (const point of obj.points) {
        const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
        if (distance < 10) { // 10px tolerance
          return i;
        }
      }
    }
  }
  return -1;
};

// Placeholder functions for compatibility
export const createShapeObject = () => null;
export const drawShapePreview = () => {};
