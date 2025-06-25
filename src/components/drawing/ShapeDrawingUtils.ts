
import { ShapeTool, AnyDrawingObject } from "./types";

export const createShapeObject = (
  shapeTool: ShapeTool,
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
    default:
      return null;
  }
};

export const drawShapePreview = (
  ctx: CanvasRenderingContext2D,
  shapeTool: ShapeTool,
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
  }
  
  ctx.stroke();
  ctx.setLineDash([]);
};
