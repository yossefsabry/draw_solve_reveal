
import { useState } from "react";
import { AnyDrawingObject } from "@/components/drawing/types";
import { findObjectAtPosition } from "@/components/drawing/ShapeDrawingUtils";

interface UseObjectManipulationProps {
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
}

export const useObjectManipulation = ({
  objects,
  setObjects
}: UseObjectManipulationProps) => {
  const [selectedShape, setSelectedShape] = useState<any>(null);
  
  // Start moving an object
  const startMovingObject = (pos: { x: number; y: number }) => {
    // Check if we're clicking on a shape
    const clickedObjectIndex = findObjectAtPosition(objects, pos.x, pos.y);
    if (clickedObjectIndex !== -1) {
      const obj = objects[clickedObjectIndex];
      
      // Handle different object types based on their structure
      if (obj.type === 'triangle' || obj.type === 'line' || obj.type === 'arrow') {
        setSelectedShape({
          index: clickedObjectIndex,
          offsetX: pos.x - obj.x1,
          offsetY: pos.y - obj.y1,
        });
      } else if (obj.type === 'person' || obj.type === 'house' || obj.type === 'star') {
        // These objects use x1, y1 coordinates
        setSelectedShape({
          index: clickedObjectIndex,
          offsetX: pos.x - obj.x1,
          offsetY: pos.y - obj.y1,
        });
      } else if (obj.type === 'draw') {
        setSelectedShape({
          index: clickedObjectIndex,
          offsetX: pos.x - obj.points[0].x,
          offsetY: pos.y - obj.points[0].y,
        });
      } else if (obj.type === 'polygon') {
        // For polygons, use the first point as reference
        const firstPoint = obj.points[0];
        setSelectedShape({
          index: clickedObjectIndex,
          offsetX: pos.x - firstPoint.x,
          offsetY: pos.y - firstPoint.y,
        });
      } else if ('x' in obj && 'y' in obj) {
        // For objects with x, y properties (rectangle, circle, ellipse, text, math)
        setSelectedShape({
          index: clickedObjectIndex,
          offsetX: pos.x - obj.x,
          offsetY: pos.y - obj.y,
        });
      }
      
      return true;
    }
    
    return false;
  };
  
  // Move the selected object
  const moveSelectedObject = (pos: { x: number; y: number }) => {
    if (!selectedShape) return;
    
    const obj = {...objects[selectedShape.index]};
    const deltaX = pos.x - selectedShape.offsetX;
    const deltaY = pos.y - selectedShape.offsetY;
    
    const updatedObjects = [...objects];
    
    if (obj.type === 'rectangle' || obj.type === 'circle' || obj.type === 'ellipse') {
      updatedObjects[selectedShape.index] = {
        ...obj,
        x: deltaX,
        y: deltaY
      };
    } else if (obj.type === 'triangle') {
      const width = obj.x2 - obj.x1;
      const height = obj.y2 - obj.y1;
      const width2 = obj.x3 - obj.x1;
      const height2 = obj.y3 - obj.y1;
      
      updatedObjects[selectedShape.index] = {
        ...obj,
        x1: deltaX,
        y1: deltaY,
        x2: deltaX + width,
        y2: deltaY + height,
        x3: deltaX + width2,
        y3: deltaY + height2
      };
    } else if (obj.type === 'line' || obj.type === 'arrow') {
      const width = obj.x2 - obj.x1;
      const height = obj.y2 - obj.y1;
      
      updatedObjects[selectedShape.index] = {
        ...obj,
        x1: deltaX,
        y1: deltaY,
        x2: deltaX + width,
        y2: deltaY + height
      };
    } else if (obj.type === 'person' || obj.type === 'house' || obj.type === 'star') {
      const width = obj.x2 - obj.x1;
      const height = obj.y2 - obj.y1;
      
      updatedObjects[selectedShape.index] = {
        ...obj,
        x1: deltaX,
        y1: deltaY,
        x2: deltaX + width,
        y2: deltaY + height
      };
    } else if (obj.type === 'draw' && obj.points && obj.points.length > 0) {
      const offsetX = deltaX - obj.points[0].x;
      const offsetY = deltaY - obj.points[0].y;
      
      updatedObjects[selectedShape.index] = {
        ...obj,
        points: obj.points.map(p => ({
          x: p.x + offsetX,
          y: p.y + offsetY
        }))
      };
    } else if (obj.type === 'polygon') {
      // For polygons, move all points relative to the first point
      const firstPoint = obj.points[0];
      const offsetX = deltaX - firstPoint.x;
      const offsetY = deltaY - firstPoint.y;
      
      updatedObjects[selectedShape.index] = {
        ...obj,
        points: obj.points.map(p => ({
          x: p.x + offsetX,
          y: p.y + offsetY
        }))
      };
    } else if (obj.type === 'text' || obj.type === 'math') {
      updatedObjects[selectedShape.index] = {
        ...obj,
        x: deltaX,
        y: deltaY
      };
    }
    
    setObjects(updatedObjects);
  };
  
  // Stop moving the object
  const stopMovingObject = () => {
    setSelectedShape(null);
  };

  return {
    selectedShape,
    setSelectedShape,
    startMovingObject,
    moveSelectedObject,
    stopMovingObject
  };
};
