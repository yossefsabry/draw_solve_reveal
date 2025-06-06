
// Shape tools available in the application
export type ShapeTool = "none" | "rectangle" | "circle" | "triangle" | "line" | "arrow" | "text" | "ellipse" | "polygon";

// Drawing mode
export type DrawingMode = "draw" | "erase" | "shape" | "move" | "select";

// Base drawing object interface
interface BaseDrawingObject {
  color: string;
  lineWidth: number;
}

// Rectangle object
export interface RectangleObject extends BaseDrawingObject {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

// Circle object
export interface CircleObject {
  type: "circle";
  x: number;
  y: number;
  radius: number;
  color: string;
  lineWidth: number;
}

// Ellipse object
export interface EllipseObject {
  type: "ellipse";
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  lineWidth: number;
}

// Triangle object
export interface TriangleObject {
  type: "triangle";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  color: string;
  lineWidth: number;
}

// Line object
export interface LineObject {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

// Arrow object
export interface ArrowObject {
  type: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

// Text object
export interface TextObject {
  type: "text";
  text: string;
  x: number;
  y: number;
  color: string;
  lineWidth: number;
}

// Polygon object
export interface PolygonObject {
  type: "polygon";
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
}

// Draw object for free-hand drawing
export interface DrawObject {
  type: "draw";
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
  penType?: string;
}

// Union type for all drawing objects
export type AnyDrawingObject = 
  RectangleObject | 
  CircleObject |
  EllipseObject |
  TriangleObject |
  LineObject |
  ArrowObject |
  TextObject |
  PolygonObject |
  DrawObject;
  
// Pen type with enhanced options
export type PenType = "brush" | "pencil" | "pen" | "marker" | "calligraphy" | "highlighter" | "spray" | "charcoal";

// Result from math equation solving
export interface MathResult {
  expression: string;
  answer: string;
}
