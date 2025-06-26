
import { ShapeTool, AnyDrawingObject } from "./types";

// Find object at position for selection
export const findObjectAtPosition = (
  objects: AnyDrawingObject[],
  x: number,
  y: number
): number => {
  // Check objects in reverse order (last drawn first)
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    
    if (isPointInObject(obj, x, y)) {
      return i;
    }
  }
  
  return -1;
};

// Check if a point is inside an object
const isPointInObject = (obj: AnyDrawingObject, x: number, y: number): boolean => {
  switch (obj.type) {
    case 'rectangle':
      return x >= obj.x && x <= obj.x + obj.width &&
             y >= obj.y && y <= obj.y + obj.height;
    
    case 'circle':
      const distance = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
      return distance <= obj.radius;
    
    case 'ellipse':
      const dx = (x - obj.x) / obj.radiusX;
      const dy = (y - obj.y) / obj.radiusY;
      return (dx * dx + dy * dy) <= 1;
    
    case 'line':
    case 'arrow':
      // Check if point is near the line (within 5 pixels)
      const lineDistance = distanceToLine(x, y, obj.x1, obj.y1, obj.x2, obj.y2);
      return lineDistance <= 5;
    
    case 'triangle':
      return isPointInTriangle(x, y, obj.x1, obj.y1, obj.x2, obj.y2, obj.x3, obj.y3);
    
    case 'text':
    case 'math':
      // Simple bounding box check for text
      const fontSize = obj.fontSize || 16;
      const textWidth = (obj.text || "").length * fontSize * 0.6; // Rough estimate
      return x >= obj.x && x <= obj.x + textWidth &&
             y >= obj.y && y <= obj.y + fontSize;
    
    case 'draw':
      // Check if point is near any part of the drawn path
      if (!obj.points || obj.points.length < 2) return false;
      for (let i = 0; i < obj.points.length - 1; i++) {
        const dist = distanceToLine(
          x, y,
          obj.points[i].x, obj.points[i].y,
          obj.points[i + 1].x, obj.points[i + 1].y
        );
        if (dist <= (obj.lineWidth || 2) + 2) return true;
      }
      return false;
    
    case 'polygon':
      if (!obj.points || obj.points.length < 3) return false;
      return isPointInPolygon(x, y, obj.points);
    
    default:
      return false;
  }
};

// Helper function to calculate distance from point to line
const distanceToLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lenSq;
  
  if (param < 0) {
    return Math.sqrt(A * A + B * B);
  } else if (param > 1) {
    const E = px - x2;
    const F = py - y2;
    return Math.sqrt(E * E + F * F);
  } else {
    const projX = x1 + param * C;
    const projY = y1 + param * D;
    const G = px - projX;
    const H = py - projY;
    return Math.sqrt(G * G + H * H);
  }
};

// Helper function for point in triangle
const isPointInTriangle = (px: number, py: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): boolean => {
  const area = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
  const area1 = Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
  const area2 = Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
  const area3 = Math.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));
  
  return Math.abs(area - (area1 + area2 + area3)) < 1;
};

// Helper function for point in polygon
const isPointInPolygon = (x: number, y: number, points: { x: number; y: number }[]): boolean => {
  let inside = false;
  
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    if (((points[i].y > y) !== (points[j].y > y)) &&
        (x < (points[j].x - points[i].x) * (y - points[i].y) / (points[j].y - points[i].y) + points[i].x)) {
      inside = !inside;
    }
  }
  
  return inside;
};

export const createShapeObject = (
  shapeTool: ShapeTool | "person" | "house" | "star",
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  lineWidth: number
): AnyDrawingObject | null => {
  switch (shapeTool) {
    case 'rectangle':
      return {
        type: 'rectangle',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
        color,
        lineWidth
      };
    case 'circle':
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      return {
        type: 'circle',
        x: startX,
        y: startY,
        radius,
        color,
        lineWidth
      };
    case 'line':
      return {
        type: 'line',
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        color,
        lineWidth
      };
    case 'arrow':
      return {
        type: 'arrow',
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        color,
        lineWidth
      };
    case 'triangle':
      return {
        type: 'triangle',
        x1: startX,
        y1: startY,
        x2: endX,
        y2: startY,
        x3: (startX + endX) / 2,
        y3: endY,
        color,
        lineWidth
      };
    case 'person':
      return {
        type: 'person',
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        color,
        lineWidth
      };
    case 'house':
      return {
        type: 'house',
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        color,
        lineWidth
      };
    case 'star':
      return {
        type: 'star',
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        color,
        lineWidth
      };
    default:
      return null;
  }
};

export const drawShapePreview = (
  ctx: CanvasRenderingContext2D,
  shapeTool: ShapeTool | "person" | "house" | "star",
  startX: number,
  startY: number,
  endX: number,
  endY: number
): void => {
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  
  switch (shapeTool) {
    case 'rectangle':
      const width = endX - startX;
      const height = endY - startY;
      ctx.rect(startX, startY, width, height);
      break;
    case 'circle':
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      break;
    case 'line':
    case 'arrow':
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      break;
    case 'triangle':
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, startY);
      ctx.lineTo((startX + endX) / 2, endY);
      ctx.closePath();
      break;
    case 'person':
    case 'house':
    case 'star':
      // Simple rectangle preview for complex shapes
      ctx.rect(Math.min(startX, endX), Math.min(startY, endY), 
               Math.abs(endX - startX), Math.abs(endY - startY));
      break;
  }
  
  ctx.stroke();
  ctx.setLineDash([]);
};
