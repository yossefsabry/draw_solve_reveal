import { AnyDrawingObject } from "../types";

// Determine if an object is visible in the current viewport
export const isObjectVisible = (
  obj: AnyDrawingObject, 
  visibleWidth: number, 
  visibleHeight: number, 
  scale: number, 
  offset: {x: number, y: number}
): boolean => {
  // Simple bounding box check for performance
  let objX = 0, objY = 0, objWidth = 0, objHeight = 0;
  
  switch (obj.type) {
    case 'rectangle':
      objX = obj.x * scale + offset.x;
      objY = obj.y * scale + offset.y;
      objWidth = obj.width * scale;
      objHeight = obj.height * scale;
      break;
    case 'ellipse':
      objX = (obj.x - obj.radiusX) * scale + offset.x;
      objY = (obj.y - obj.radiusY) * scale + offset.y;
      objWidth = obj.radiusX * 2 * scale;
      objHeight = obj.radiusY * 2 * scale;
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
    default:
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

// Configure pen settings with optimized performance
export const configurePenStyle = (ctx: CanvasRenderingContext2D, penType: string, color: string, brushSize: number, isEraser: boolean = false): void => {
  // Reset context to defaults
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = brushSize;
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1.0;
  
  // Apply specific pen type settings if not in eraser mode
  if (!isEraser) {
    switch (penType) {
      case "brush":
        ctx.shadowBlur = 2;
        ctx.shadowColor = color;
        ctx.lineWidth = brushSize * 1.1;
        break;
      case "pencil":
        ctx.lineWidth = Math.max(1, brushSize * 0.6);
        ctx.globalAlpha = 0.9;
        break;
      case "pen":
        ctx.lineWidth = brushSize;
        break;
      case "marker":
        ctx.lineCap = "square";
        ctx.lineWidth = brushSize * 1.4;
        ctx.globalAlpha = 0.8;
        break;
      case "calligraphy":
        ctx.lineCap = "butt";
        ctx.lineJoin = "miter";
        ctx.lineWidth = brushSize * 1.3;
        break;
      case "highlighter":
        ctx.lineWidth = brushSize * 2;
        ctx.globalAlpha = 0.4;
        break;
      case "spray":
        ctx.shadowBlur = brushSize * 0.5;
        ctx.shadowColor = color;
        ctx.lineWidth = brushSize * 0.8;
        ctx.globalAlpha = 0.7;
        break;
      case "charcoal":
        ctx.shadowBlur = 1;
        ctx.shadowColor = color;
        ctx.lineWidth = brushSize * 1.2;
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

// Draw all objects to the canvas with optimized performance
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
    ctx.lineWidth = obj.lineWidth || 2;
    ctx.globalCompositeOperation = "source-over";
    
    // Apply specific rendering based on object type
    switch (obj.type) {
      case 'rectangle':
        drawRectangle(ctx, obj);
        break;
      case 'circle':
        drawCircle(ctx, obj);
        break;
      case 'ellipse':
        drawEllipse(ctx, obj);
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
      case 'math':
        drawText(ctx, obj);
        break;
      case 'polygon':
        drawPolygon(ctx, obj);
        break;
      case 'draw':
        drawPath(ctx, obj);
        break;
      case 'cube':
        drawCube(ctx, obj);
        break;
      case 'cylinder':
        drawCylinder(ctx, obj);
        break;
      case 'pyramid':
        drawPyramid(ctx, obj);
        break;
      case 'cone':
        drawCone(ctx, obj);
        break;
      case 'cuboid':
        drawCuboid(ctx, obj);
        break;
      case 'hexagonalPrism':
        drawHexagonalPrism(ctx, obj);
        break;
      case 'sphere':
        drawSphere(ctx, obj);
        break;
      case 'hemisphere':
        drawHemisphere(ctx, obj);
        break;
      case 'triangularPrism':
        drawTriangularPrism(ctx, obj);
        break;
    }
    
    ctx.restore();
  });
  
  // Restore the context to its original state
  ctx.restore();
};

// Draw simple grid overlay
export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  offset: {x: number, y: number}
): void => {
  const gridSize = 20;
  
  ctx.save();
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;
  
  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
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

function drawEllipse(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'ellipse') return;
  
  ctx.beginPath();
  ctx.ellipse(
    obj.x + obj.radiusX, 
    obj.y + obj.radiusY, 
    obj.radiusX, 
    obj.radiusY, 
    0, 0, 2 * Math.PI
  );
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

function drawPolygon(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'polygon' || !obj.points || obj.points.length === 0) return;
  
  ctx.beginPath();
  ctx.moveTo(obj.points[0].x, obj.points[0].y);
  
  for (let i = 1; i < obj.points.length; i++) {
    ctx.lineTo(obj.points[i].x, obj.points[i].y);
  }
  
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
  const headLength = 20;
  
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
  if (obj.type !== 'text' && obj.type !== 'math') return;
  
  ctx.font = `${obj.fontSize}px Arial`;
  ctx.fillStyle = obj.color || "#FFFFFF";
  ctx.textBaseline = "top";
  
  // Handle multi-line text
  const lines = (obj.text || "").split('\n');
  const lineHeight = obj.fontSize * 1.2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, obj.x, obj.y + (index * lineHeight));
  });
}

function drawPath(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'draw' || !obj.points || obj.points.length <= 1) return;
  
  ctx.beginPath();
  ctx.moveTo(obj.points[0].x, obj.points[0].y);
  
  // Optimized path rendering for better performance
  for (let i = 1; i < obj.points.length; i++) {
    ctx.lineTo(obj.points[i].x, obj.points[i].y);
  }
  
  ctx.stroke();
}

function drawCube(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'cube') return;
  ctx.beginPath();
  ctx.rect(obj.x, obj.y, obj.size, obj.size);
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
  ctx.globalAlpha = 1.0;
}

function drawCylinder(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'cylinder') return;
  ctx.beginPath();
  ctx.ellipse(obj.x + obj.radius, obj.y + obj.height / 2, obj.radius, obj.height / 2, 0, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.ellipse(obj.x + obj.radius, obj.y + obj.height / 2, obj.radius, obj.height / 2, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawPyramid(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'pyramid') return;
  ctx.beginPath();
  ctx.moveTo(obj.x, obj.y + obj.height);
  ctx.lineTo(obj.x + obj.size / 2, obj.y);
  ctx.lineTo(obj.x + obj.size, obj.y + obj.height);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawCone(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'cone') return;
  ctx.beginPath();
  ctx.moveTo(obj.x, obj.y + obj.height);
  ctx.lineTo(obj.x + obj.radius, obj.y);
  ctx.lineTo(obj.x + obj.radius * 2, obj.y + obj.height);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawCuboid(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'cuboid') return;
  ctx.beginPath();
  ctx.rect(obj.x, obj.y, obj.width, obj.height);
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  ctx.globalAlpha = 1.0;
}

function drawHexagonalPrism(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'hexagonalPrism') return;
  const cx = obj.x + obj.radius;
  const cy = obj.y + obj.height / 2;
  const r = obj.radius;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawSphere(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'sphere') return;
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawHemisphere(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'hemisphere') return;
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius, Math.PI, 2 * Math.PI);
  ctx.lineTo(obj.x + obj.radius, obj.y);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawTriangularPrism(ctx: CanvasRenderingContext2D, obj: AnyDrawingObject) {
  if (obj.type !== 'triangularPrism') return;
  ctx.beginPath();
  ctx.moveTo(obj.x, obj.y + obj.height);
  ctx.lineTo(obj.x + obj.width / 2, obj.y);
  ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = obj.color;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}
