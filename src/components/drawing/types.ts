
// Available shape tools
export type ShapeTool = "rectangle" | "circle" | "triangle" | "line" | "arrow" | "none";

// Available drawing modes
export type DrawingMode = "draw" | "erase" | "shape" | "move";

// Drawing object interfaces
export interface DrawingObject {
  type: string;
  color: string;
  lineWidth: number;
}

export interface RectangleObject extends DrawingObject {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleObject extends DrawingObject {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
}

export interface TriangleObject extends DrawingObject {
  type: 'triangle';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}

export interface LineObject extends DrawingObject {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ArrowObject extends DrawingObject {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TextObject extends DrawingObject {
  type: 'text';
  text: string;
  x: number;
  y: number;
}

export type AnyDrawingObject = 
  | RectangleObject 
  | CircleObject 
  | TriangleObject 
  | LineObject 
  | ArrowObject 
  | TextObject;
