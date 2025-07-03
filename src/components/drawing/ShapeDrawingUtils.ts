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
      return Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2)) <= obj.radius;
    
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
    
    case 'cube':
      return x >= obj.x && x <= obj.x + obj.size &&
             y >= obj.y && y <= obj.y + obj.size;
    
    case 'cylinder':
      const cylinderRadius = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
      return cylinderRadius <= obj.radius && y >= obj.y && y <= obj.y + obj.height;
    
    case 'pyramid':
      return isPointInTriangle(x, y, obj.x, obj.y, obj.x + obj.size / 2, obj.y, obj.x + obj.size, obj.y + obj.height);
    
    case 'cone':
      return isPointInTriangle(x, y, obj.x, obj.y, obj.x + obj.radius, obj.y, obj.x + obj.radius, obj.y + obj.height);
    
    case 'cuboid':
      return x >= obj.x && x <= obj.x + obj.width &&
             y >= obj.y && y <= obj.y + obj.height;
    
    case 'hexagonalPrism':
      // For 2D, treat as bounding box
      return x >= obj.x && x <= obj.x + obj.radius * 2 &&
             y >= obj.y && y <= obj.y + obj.height;
    
    case 'sphere':
      return Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2)) <= obj.radius;
    
    case 'hemisphere':
      const distanceToCenter = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
      return distanceToCenter <= obj.radius && y >= obj.y;
    
    case 'triangularPrism':
      return isPointInTriangle(x, y, obj.x, obj.y, obj.x + obj.width, obj.y, obj.x + obj.width / 2, obj.y + obj.height);
    
    default:
      return false;
  }
};

export const createShapeObject = (
  shapeTool: ShapeTool | "person" | "house" | "star" | "cube" | "cylinder" | "pyramid" | "cone" | "cuboid" | "hexagonalPrism" | "sphere" | "hemisphere" | "triangularPrism",
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
    case 'ellipse':
      return {
        type: 'ellipse',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        radiusX: Math.abs(endX - startX) / 2,
        radiusY: Math.abs(endY - startY) / 2,
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
    case 'cube':
      return {
        type: 'cube',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        size: Math.max(Math.abs(endX - startX), Math.abs(endY - startY)),
        color,
        lineWidth
      };
    case 'cylinder':
      return {
        type: 'cylinder',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        radius: Math.abs(endX - startX) / 2,
        height: Math.abs(endY - startY),
        color,
        lineWidth
      };
    case 'pyramid':
      return {
        type: 'pyramid',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        size: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
        color,
        lineWidth
      };
    case 'cone':
      return {
        type: 'cone',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        radius: Math.abs(endX - startX) / 2,
        height: Math.abs(endY - startY),
        color,
        lineWidth
      };
    case 'cuboid':
      return {
        type: 'cuboid',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
        depth: Math.abs(endX - startX) * 0.5,
        color,
        lineWidth
      };
    case 'hexagonalPrism':
      return {
        type: 'hexagonalPrism',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        radius: Math.abs(endX - startX) / 2,
        height: Math.abs(endY - startY),
        color,
        lineWidth
      };
    case 'sphere':
      return {
        type: 'sphere',
        x: (startX + endX) / 2,
        y: (startY + endY) / 2,
        radius: Math.abs(endX - startX) / 2,
        color,
        lineWidth
      };
    case 'hemisphere':
      return {
        type: 'hemisphere',
        x: (startX + endX) / 2,
        y: (startY + endY) / 2,
        radius: Math.abs(endX - startX) / 2,
        color,
        lineWidth
      };
    case 'triangularPrism':
      return {
        type: 'triangularPrism',
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
        depth: Math.abs(endX - startX) * 0.5,
        color,
        lineWidth
      };
    default:
      return null;
  }
};

export const drawShapePreview = (
  ctx: CanvasRenderingContext2D,
  shapeTool: ShapeTool | "person" | "house" | "star" | "cube" | "cylinder" | "pyramid" | "cone" | "cuboid" | "hexagonalPrism" | "sphere" | "hemisphere" | "triangularPrism",
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
    case 'ellipse':
      const radiusX = Math.abs(endX - startX) / 2;
      const radiusY = Math.abs(endY - startY) / 2;
      const centerX = Math.min(startX, endX) + radiusX;
      const centerY = Math.min(startY, endY) + radiusY;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
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
      // Draw stick figure preview
      const centerX2 = (startX + endX) / 2;
      const centerY2 = (startY + endY) / 2;
      const size = Math.abs(endX - startX) / 4;
      // Head
      ctx.arc(centerX2, startY + size, size * 0.3, 0, 2 * Math.PI);
      ctx.moveTo(centerX2, startY + size * 1.5);
      ctx.lineTo(centerX2, endY - size);
      // Arms
      ctx.moveTo(centerX2 - size, startY + size * 2);
      ctx.lineTo(centerX2 + size, startY + size * 2);
      // Legs
      ctx.moveTo(centerX2, endY - size);
      ctx.lineTo(centerX2 - size, endY);
      ctx.moveTo(centerX2, endY - size);
      ctx.lineTo(centerX2 + size, endY);
      break;
    case 'house':
      // Draw house preview
      const houseWidth = Math.abs(endX - startX);
      const houseHeight = Math.abs(endY - startY);
      const houseX = Math.min(startX, endX);
      const houseY = Math.min(startY, endY);
      // Base
      ctx.rect(houseX, houseY + houseHeight * 0.3, houseWidth, houseHeight * 0.7);
      // Roof
      ctx.moveTo(houseX, houseY + houseHeight * 0.3);
      ctx.lineTo(houseX + houseWidth / 2, houseY);
      ctx.lineTo(houseX + houseWidth, houseY + houseHeight * 0.3);
      break;
    case 'star':
      // Draw star preview
      const starCenterX = (startX + endX) / 2;
      const starCenterY = (startY + endY) / 2;
      const starRadius = Math.abs(endX - startX) / 4;
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        const r = i % 2 === 0 ? starRadius : starRadius * 0.5;
        const x = starCenterX + Math.cos(angle - Math.PI / 2) * r;
        const y = starCenterY + Math.sin(angle - Math.PI / 2) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    case 'cube':
      // Draw cube preview with 3D effect
      const cubeSize = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
      const cubeX = Math.min(startX, endX);
      const cubeY = Math.min(startY, endY);
      const offset = cubeSize * 0.2;
      // Front face
      ctx.rect(cubeX, cubeY, cubeSize, cubeSize);
      // Back face
      ctx.rect(cubeX + offset, cubeY - offset, cubeSize, cubeSize);
      // Connecting lines
      ctx.moveTo(cubeX, cubeY);
      ctx.lineTo(cubeX + offset, cubeY - offset);
      ctx.moveTo(cubeX + cubeSize, cubeY);
      ctx.lineTo(cubeX + cubeSize + offset, cubeY - offset);
      ctx.moveTo(cubeX, cubeY + cubeSize);
      ctx.lineTo(cubeX + offset, cubeY + cubeSize - offset);
      ctx.moveTo(cubeX + cubeSize, cubeY + cubeSize);
      ctx.lineTo(cubeX + cubeSize + offset, cubeY + cubeSize - offset);
      break;
    case 'cylinder':
      // Draw cylinder preview
      const cylWidth = Math.abs(endX - startX);
      const cylHeight = Math.abs(endY - startY);
      const cylX = Math.min(startX, endX);
      const cylY = Math.min(startY, endY);
      const cylRadius = cylWidth / 2;
      // Top ellipse
      ctx.ellipse(cylX + cylRadius, cylY, cylRadius, cylRadius * 0.3, 0, 0, 2 * Math.PI);
      // Bottom ellipse
      ctx.ellipse(cylX + cylRadius, cylY + cylHeight, cylRadius, cylRadius * 0.3, 0, 0, 2 * Math.PI);
      // Side lines
      ctx.moveTo(cylX, cylY);
      ctx.lineTo(cylX, cylY + cylHeight);
      ctx.moveTo(cylX + cylWidth, cylY);
      ctx.lineTo(cylX + cylWidth, cylY + cylHeight);
      break;
    case 'pyramid':
      // Draw pyramid preview
      const pyrWidth = Math.abs(endX - startX);
      const pyrHeight = Math.abs(endY - startY);
      const pyrX = Math.min(startX, endX);
      const pyrY = Math.min(startY, endY);
      // Base
      ctx.rect(pyrX, pyrY + pyrHeight * 0.7, pyrWidth, pyrHeight * 0.3);
      // Triangular faces
      ctx.moveTo(pyrX, pyrY + pyrHeight);
      ctx.lineTo(pyrX + pyrWidth / 2, pyrY);
      ctx.lineTo(pyrX + pyrWidth, pyrY + pyrHeight);
      ctx.moveTo(pyrX + pyrWidth / 2, pyrY);
      ctx.lineTo(pyrX + pyrWidth, pyrY + pyrHeight * 0.7);
      break;
    case 'cone':
      // Draw cone preview
      const coneWidth = Math.abs(endX - startX);
      const coneHeight = Math.abs(endY - startY);
      const coneX = Math.min(startX, endX);
      const coneY = Math.min(startY, endY);
      const coneRadius = coneWidth / 2;
      // Base circle
      ctx.ellipse(coneX + coneRadius, coneY + coneHeight, coneRadius, coneRadius * 0.3, 0, 0, 2 * Math.PI);
      // Cone sides
      ctx.moveTo(coneX, coneY + coneHeight);
      ctx.lineTo(coneX + coneRadius, coneY);
      ctx.moveTo(coneX + coneWidth, coneY + coneHeight);
      ctx.lineTo(coneX + coneRadius, coneY);
      break;
    case 'cuboid':
      // Draw cuboid preview (rectangular prism)
      const cuboidWidth = Math.abs(endX - startX);
      const cuboidHeight = Math.abs(endY - startY);
      const cuboidX = Math.min(startX, endX);
      const cuboidY = Math.min(startY, endY);
      const cuboidOffset = cuboidWidth * 0.15;
      // Front face
      ctx.rect(cuboidX, cuboidY, cuboidWidth, cuboidHeight);
      // Back face
      ctx.rect(cuboidX + cuboidOffset, cuboidY - cuboidOffset, cuboidWidth, cuboidHeight);
      // Connecting lines
      ctx.moveTo(cuboidX, cuboidY);
      ctx.lineTo(cuboidX + cuboidOffset, cuboidY - cuboidOffset);
      ctx.moveTo(cuboidX + cuboidWidth, cuboidY);
      ctx.lineTo(cuboidX + cuboidWidth + cuboidOffset, cuboidY - cuboidOffset);
      ctx.moveTo(cuboidX, cuboidY + cuboidHeight);
      ctx.lineTo(cuboidX + cuboidOffset, cuboidY + cuboidHeight - cuboidOffset);
      ctx.moveTo(cuboidX + cuboidWidth, cuboidY + cuboidHeight);
      ctx.lineTo(cuboidX + cuboidWidth + cuboidOffset, cuboidY + cuboidHeight - cuboidOffset);
      break;
    case 'hexagonalPrism':
      // Draw hexagonal prism preview
      const hexRadius = Math.abs(endX - startX) / 2;
      const hexHeight = Math.abs(endY - startY);
      const hexCenterX = (startX + endX) / 2;
      const hexCenterY = Math.min(startY, endY) + hexHeight / 2;
      // Top hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = hexCenterX + hexRadius * Math.cos(angle);
        const y = hexCenterY - hexHeight / 2 + hexRadius * 0.2 * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      // Bottom hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = hexCenterX + hexRadius * Math.cos(angle);
        const y = hexCenterY + hexHeight / 2 + hexRadius * 0.2 * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      // Vertical lines
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = hexCenterX + hexRadius * Math.cos(angle);
        const y1 = hexCenterY - hexHeight / 2 + hexRadius * 0.2 * Math.sin(angle);
        const y2 = hexCenterY + hexHeight / 2 + hexRadius * 0.2 * Math.sin(angle);
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
      }
      break;
    case 'sphere':
      // Draw sphere preview
      const sphereRadius = Math.abs(endX - startX) / 2;
      const sphereCenterX = (startX + endX) / 2;
      const sphereCenterY = (startY + endY) / 2;
      // Main circle
      ctx.arc(sphereCenterX, sphereCenterY, sphereRadius, 0, 2 * Math.PI);
      // Horizontal ellipse
      ctx.ellipse(sphereCenterX, sphereCenterY, sphereRadius, sphereRadius * 0.3, 0, 0, 2 * Math.PI);
      // Vertical ellipse
      ctx.ellipse(sphereCenterX, sphereCenterY, sphereRadius * 0.3, sphereRadius, 0, 0, 2 * Math.PI);
      break;
    case 'hemisphere':
      // Draw hemisphere preview
      const hemiRadius = Math.abs(endX - startX) / 2;
      const hemiCenterX = (startX + endX) / 2;
      const hemiCenterY = (startY + endY) / 2;
      // Half circle
      ctx.arc(hemiCenterX, hemiCenterY, hemiRadius, Math.PI, 2 * Math.PI);
      // Base ellipse
      ctx.ellipse(hemiCenterX, hemiCenterY, hemiRadius, hemiRadius * 0.3, 0, 0, Math.PI);
      ctx.lineTo(hemiCenterX + hemiRadius, hemiCenterY);
      break;
    case 'triangularPrism':
      // Draw triangular prism preview
      const triWidth = Math.abs(endX - startX);
      const triHeight = Math.abs(endY - startY);
      const triX = Math.min(startX, endX);
      const triY = Math.min(startY, endY);
      const triOffset = triWidth * 0.15;
      // Front triangle
      ctx.moveTo(triX, triY + triHeight);
      ctx.lineTo(triX + triWidth / 2, triY);
      ctx.lineTo(triX + triWidth, triY + triHeight);
      ctx.closePath();
      // Back triangle
      ctx.moveTo(triX + triOffset, triY + triHeight - triOffset);
      ctx.lineTo(triX + triWidth / 2 + triOffset, triY - triOffset);
      ctx.lineTo(triX + triWidth + triOffset, triY + triHeight - triOffset);
      ctx.closePath();
      // Connecting lines
      ctx.moveTo(triX, triY + triHeight);
      ctx.lineTo(triX + triOffset, triY + triHeight - triOffset);
      ctx.moveTo(triX + triWidth / 2, triY);
      ctx.lineTo(triX + triWidth / 2 + triOffset, triY - triOffset);
      ctx.moveTo(triX + triWidth, triY + triHeight);
      ctx.lineTo(triX + triWidth + triOffset, triY + triHeight - triOffset);
      break;
  }
  
  ctx.stroke();
  ctx.setLineDash([]);
};

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

const isPointInTriangle = (px: number, py: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): boolean => {
  const area = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
  const area1 = Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
  const area2 = Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
  const area3 = Math.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));
  
  return Math.abs(area - (area1 + area2 + area3)) < 1;
};

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
