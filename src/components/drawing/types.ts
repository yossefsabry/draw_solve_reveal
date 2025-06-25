
export interface Point {
  x: number;
  y: number;
}

export interface DrawObject {
  type: 'draw';
  points: Point[];
  color: string;
  lineWidth: number;
}

export interface RectangleObject {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  lineWidth: number;
}

export interface CircleObject {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
  color: string;
  lineWidth: number;
}

export interface EllipseObject {
  type: 'ellipse';
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  lineWidth: number;
}

export interface LineObject {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

export interface ArrowObject {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

export interface TriangleObject {
  type: 'triangle';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  color: string;
  lineWidth: number;
}

export interface PolygonObject {
  type: 'polygon';
  points: Point[];
  color: string;
  lineWidth: number;
}

export interface TextObject {
  type: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  lineWidth?: number; // Optional for text objects
}

export interface MathResult {
  type: 'math';
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  lineWidth?: number;
}

export type AnyDrawingObject = DrawObject | RectangleObject | CircleObject | EllipseObject | LineObject | ArrowObject | TriangleObject | PolygonObject | TextObject | MathResult;

export type DrawingMode = "draw" | "erase" | "text";
export type ShapeTool = "rectangle" | "circle" | "line" | "arrow" | "triangle" | "ellipse" | "polygon";
