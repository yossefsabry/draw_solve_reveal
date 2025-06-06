
import { AnyDrawingObject } from "../types";

// Determine if an object is visible in the current viewport
export const isObjectVisible = (
  obj: AnyDrawingObject, 
  visibleWidth: number, 
  visibleHeight: number, 
  scale: number, 
  offset: {x: number, y: number}
): boolean => {
  // Simple bounding box check
  let objX = 0, objY = 0, objWidth = 0, objHeight = 0;
  
  switch (obj.type) {
    case 'rectangle':
      objX = obj.x * scale + offset.x;
      objY = obj.y * scale + offset.y;
      objWidth = obj.width * scale;
      objHeight = obj.height * scale;
      break;
    case 'circle':
      objX = (obj.x - obj.radius) * scale + offset.x;
      objY = (obj.y - obj.radius) * scale + offset.y;
      objWidth = obj.radius * 2 * scale;
      objHeight = obj.radius * 2 * scale;
      break;
    case 'draw':
      if (!obj.points || obj.points.length === 0) return false;
      
      // Find bounding box of the drawing
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      obj.points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
      
      objX = minX * scale + offset.x;
      objY = minY * scale + offset.y;
      objWidth = (maxX - minX) * scale;
      objHeight = (maxY - minY) * scale;
      break;
    // Handle other shape types as needed
    default:
      // For other shapes, assume they're visible
      return true;
  }
  
  // Check if the object is within the visible canvas area
  return (
    objX + objWidth >= 0 &&
    objY + objHeight >= 0 &&
    objX <= visibleWidth &&
    objY <= visibleHeight
  );
};

// Configure pen settings based on pen type with enhanced effects
export const configurePenStyle = (ctx: CanvasRenderingContext2D, penType: string, color: string, brushSize: number, isEraser: boolean = false): void => {
  // Reset context to defaults
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = brushSize;
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1.0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any transforms
  
  // Apply specific pen type settings if not in eraser mode
  if (!isEraser) {
    switch (penType) {
      case "brush":
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
        ctx.lineWidth = brushSize * 1.2;
        break;
      case "pencil":
        ctx.lineWidth = Math.max(1, brushSize * 0.4);
        ctx.globalAlpha = 0.9;
        break;
      case "pen":
        ctx.lineWidth = brushSize;
        ctx.shadowBlur = 1;
        ctx.shadowColor = color;
        break;
      case "marker":
        ctx.lineCap = "square";
        ctx.lineJoin = "round";
        ctx.lineWidth = brushSize * 1.8;
        ctx.globalAlpha = 0.6;
        break;
      case "calligraphy":
        ctx.lineCap = "butt";
        ctx.lineJoin = "miter";
        ctx.lineWidth = brushSize * 1.5;
        ctx.setTransform(1, 0, 0.3, 1, 0, 0);
        break;
      case "highlighter":
        ctx.lineWidth = brushSize * 3;
        ctx.globalAlpha = 0.2;
        break;
      case "spray":
        ctx.lineWidth = brushSize * 2;
        ctx.shadowBlur = brushSize;
        ctx.shadowColor = color;
        ctx.globalAlpha = 0.8;
        break;
      case "charcoal":
        ctx.lineWidth = brushSize * 1.5;
        ctx.shadowBlur = 2;
        ctx.shadowColor = color;
        ctx.globalAlpha = 0.85;
        break;
    }
  }
  
  // Set composite operation for eraser
  if (isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1.0;
  } else {
    ctx.globalCompositeOperation = "source-over";
  }
}

// Draw all objects to the canvas
export const drawObjects = (
  ctx: CanvasRenderingContext2D,
  objects: AnyDrawingObject[],
  visibleWidth: number,
  visibleHeight: number,
  scale: number,
  offset: {x: number, y: number}
): void => {
  // Clear canvas with black background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, visibleWidth, visibleHeight);
  
  // Apply zoom and pan transformations
  ctx.save();
  ctx.translate(offset.x, offset.y);
  ctx.scale(scale, scale);
  
  // Draw all objects with optimized rendering
  objects.forEach(obj => {
    // Skip rendering objects that are completely outside the visible area
    if (!isObjectVisible(obj, visibleWidth, visibleHeight, scale, offset)) {
      return;
    }
    
    ctx.save();
    
    // Set object-specific properties
    ctx.strokeStyle = obj.color || "#FFFFFF";
    ctx.lineWidth = obj.lineWidth;
    ctx.globalCompositeOperation = "source-over";
    
    // Apply specific rendering based on object type
    switch (obj.type) {
      case 'rectangle':
        drawRectangle(ctx, obj);
        break;
      case 'circle':
        drawCircle(ctx, obj);
        break;
      case 'triangle':
        drawTriangle(ctx, obj);
        break;
      case 'line':
        drawLine(ctx, obj);
        break;
      case 'arrow':
        drawArrow(ctx, obj);
        break;
      case 'text':
        drawText(ctx, obj);
        break;
      case 'draw':
        drawPath(ctx, obj);
        break;
    }
    
    ctx.restore();
  });
  
  // Restore the context to its original state
  ctx.restore();
};

// Export function for saving canvas as image with black background
export const saveCanvasAsImage = (canvas: HTMLCanvasElement, filename: string = 'drawing.png') => {
  // Create a temporary canvas for export
  const exportCanvas = document.createElement('canvas');
  const exportCtx = exportCanvas.getContext('2d');
  
  if (!exportCtx) return;
  
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  
  // Fill with black background
  exportCtx.fillStyle = '#000000';
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  
  // Draw the original canvas content on top
  exportCtx.drawImage(canvas, 0, 0);
  
  // Create download link
  const link = document.createElement('a');
  link.download = filename;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
};

// Individual shape drawing functions with improved styling
function drawRectangle(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'rectangle') return;
  
  ctx.beginPath();
  ctx.rect(obj.x, obj.y, obj.width, obj.height);
  ctx.stroke();
  
  // Add subtle fill for better visibility
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawCircle(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'circle') return;
  
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Add subtle fill for better visibility
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawTriangle(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'triangle') return;
  
  ctx.beginPath();
  ctx.moveTo(obj.x1, obj.y1);
  ctx.lineTo(obj.x2, obj.y2);
  ctx.lineTo(obj.x3, obj.y3);
  ctx.closePath();
  ctx.stroke();
  
  // Add subtle fill for better visibility
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawLine(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'line') return;
  
  ctx.beginPath();
  ctx.moveTo(obj.x1, obj.y1);
  ctx.lineTo(obj.x2, obj.y2);
  ctx.stroke();
}

function drawArrow(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'arrow') return;
  
  // Draw the line
  ctx.beginPath();
  ctx.moveTo(obj.x1, obj.y1);
  ctx.lineTo(obj.x2, obj.y2);
  ctx.stroke();
  
  // Calculate the arrow head
  const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
  const headLength = 20; // Slightly larger arrow head
  
  // Draw the arrow head
  ctx.beginPath();
  ctx.moveTo(obj.x2, obj.y2);
  ctx.lineTo(
    obj.x2 - headLength * Math.cos(angle - Math.PI / 6),
    obj.y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(obj.x2, obj.y2);
  ctx.lineTo(
    obj.x2 - headLength * Math.cos(angle + Math.PI / 6),
    obj.y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

function drawText(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'text') return;
  
  ctx.font = '24px Arial';
  ctx.fillStyle = obj.color || "#FFFFFF";
  ctx.fillText(obj.text, obj.x, obj.y);
}

function drawPath(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'draw' || !obj.points || obj.points.length <= 1) return;
  
  ctx.beginPath();
  ctx.moveTo(obj.points[0].x, obj.points[0].y);
  
  // Use optimized path rendering for better performance
  const stride = obj.points.length > 100 ? 2 : 1;
  
  for (let i = stride; i < obj.points.length; i += stride) {
    // Use quadratic curves for smoother lines
    if (i < obj.points.length - 1) {
      const xc = (obj.points[i].x + obj.points[i + 1].x) / 2;
      const yc = (obj.points[i].y + obj.points[i + 1].y) / 2;
      ctx.quadraticCurveTo(
        obj.points[i].x, 
        obj.points[i].y, 
        xc, 
        yc
      );
    } else {
      ctx.lineTo(obj.points[i].x, obj.points[i].y);
    }
  }
  
  ctx.stroke();
}
