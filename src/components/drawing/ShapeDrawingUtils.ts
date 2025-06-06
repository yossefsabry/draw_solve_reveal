
import { ShapeTool, AnyDrawingObject, RectangleObject, CircleObject, TriangleObject, LineObject, ArrowObject } from "./types";

// Helper to create shape objects based on start and end points
export const createShapeObject = (
  shapeTool: ShapeTool,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  brushSize: number
): AnyDrawingObject | null => {
  // Ensure minimum size for shapes
  const minSize = 50;
  const width = Math.max(Math.abs(endX - startX), minSize);
  const height = Math.max(Math.abs(endY - startY), minSize);
  
  switch (shapeTool) {
    case "rectangle":
      return {
        type: 'rectangle',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: width,
        height: height,
        color,
        lineWidth: brushSize
      };
    case "circle":
      const radius = Math.max(Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)), minSize / 2);
      return {
        type: 'circle',
        x: startX,
        y: startY,
        radius: radius,
        color,
        lineWidth: brushSize
      };
    case "ellipse":
      return {
        type: 'ellipse',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: width,
        height: height,
        color,
        lineWidth: brushSize
      };
    case "triangle":
      return {
        type: 'triangle',
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        x3: startX - (endX - startX),
        y3: endY,
        color,
        lineWidth: brushSize
      };
    case "line":
      return {
        type: 'line',
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        color,
        lineWidth: brushSize
      };
    case "arrow":
      return {
        type: 'arrow',
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        color,
        lineWidth: brushSize
      };
    case "polygon":
      // Simple hexagon
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;
      const hexRadius = Math.max(Math.abs(endX - startX) / 2, minSize / 2);
      const points = [];
      
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push({
          x: centerX + hexRadius * Math.cos(angle),
          y: centerY + hexRadius * Math.sin(angle)
        });
      }
      
      return {
        type: 'polygon',
        points: points,
        color,
        lineWidth: brushSize
      };
    case "text":
      return {
        type: 'text',
        x: startX,
        y: startY,
        text: "Sample Text",
        color,
        lineWidth: brushSize
      };
    default:
      return null;
  }
};

// Draw shape preview on canvas context
export const drawShapePreview = (
  ctx: CanvasRenderingContext2D,
  shapeTool: ShapeTool,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) => {
  const minSize = 50;
  const width = Math.max(Math.abs(endX - startX), minSize);
  const height = Math.max(Math.abs(endY - startY), minSize);
  
  switch (shapeTool) {
    case "rectangle":
      ctx.beginPath();
      ctx.rect(Math.min(startX, endX), Math.min(startY, endY), width, height);
      ctx.stroke();
      break;
    case "circle":
      ctx.beginPath();
      const radius = Math.max(Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)), minSize / 2);
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      break;
    case "ellipse":
      ctx.beginPath();
      ctx.ellipse(
        (startX + endX) / 2, 
        (startY + endY) / 2, 
        width / 2, 
        height / 2, 
        0, 0, 2 * Math.PI
      );
      ctx.stroke();
      break;
    case "triangle":
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.lineTo(startX - (endX - startX), endY);
      ctx.closePath();
      ctx.stroke();
      break;
    case "line":
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      break;
    case "arrow":
      // Draw the line part
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Calculate the arrow head
      const angle = Math.atan2(endY - startY, endX - startX);
      const headLength = 20;
      
      // Draw the arrow head
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      break;
    case "polygon":
      // Simple hexagon preview
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;
      const hexRadius = Math.max(Math.abs(endX - startX) / 2, minSize / 2);
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const hexAngle = (i * Math.PI) / 3;
        const x = centerX + hexRadius * Math.cos(hexAngle);
        const y = centerY + hexRadius * Math.sin(hexAngle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      break;
    case "text":
      ctx.font = '24px Arial';
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillText("Sample Text", startX, startY);
      break;
  }
};

// Function to find an object at a given position
export const findObjectAtPosition = (
  objects: AnyDrawingObject[], 
  x: number, 
  y: number
): number => {
  // Simple implementation - can be improved with proper hit detection
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    
    // Basic hit detection
    if (obj.type === 'rectangle') {
      if (x >= obj.x && x <= obj.x + obj.width && 
          y >= obj.y && y <= obj.y + obj.height) {
        return i;
      }
    } else if (obj.type === 'circle') {
      const distance = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
      if (distance <= obj.radius) {
        return i;
      }
    } else if (obj.type === 'text') {
      // Simple rectangle hit box for text
      if (x >= obj.x && x <= obj.x + 100 && // Approximate text width
          y >= obj.y - 24 && y <= obj.y) {  // Approximate text height
        return i;
      }
    } else if (obj.type === 'line' || obj.type === 'arrow') {
      // Distance from point to line segment (simplified)
      const distToLine = distanceToLineSegment(
        x, y, 
        obj.x1, obj.y1, 
        obj.x2, obj.y2
      );
      if (distToLine <= 10) { // Threshold for line selection
        return i;
      }
    } else if (obj.type === 'triangle') {
      // Simplified triangle hit detection
      if (isPointInTriangle(
        x, y, 
        obj.x1, obj.y1, 
        obj.x2, obj.y2, 
        obj.x3, obj.y3
      )) {
        return i;
      }
    }
  }
  return -1;
};

// Helper for line hit detection
const distanceToLineSegment = (
  px: number, py: number, 
  x1: number, y1: number, 
  x2: number, y2: number
): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper for triangle hit detection
const isPointInTriangle = (
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number
): boolean => {
  // Calculate area of triangle using cross product
  const area = 0.5 * Math.abs(
    (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
  );
  
  // Calculate area of 3 triangles made between the point and each side
  const area1 = 0.5 * Math.abs((x1 * (y2 - py) + x2 * (py - y1) + px * (y1 - y2)));
  const area2 = 0.5 * Math.abs((x2 * (y3 - py) + x3 * (py - y2) + px * (y2 - y3)));
  const area3 = 0.5 * Math.abs((x3 * (y1 - py) + x1 * (py - y3) + px * (y3 - y1)));
  
  // If sum of 3 areas equals the original triangle area, point is inside
  return Math.abs(area - (area1 + area2 + area3)) < 0.1; // Using a small epsilon for floating point comparison
};
