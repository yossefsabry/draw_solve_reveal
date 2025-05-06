
// Shape tools available in the application
export type ShapeTool = "rectangle" | "circle" | "triangle" | "line" | "arrow" | "none";

// Drawing modes available in the application
export type DrawingMode = "draw" | "erase" | "shape" | "move";

// Rectangle object
export interface RectangleObject {
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  lineWidth: number;
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

// Draw object for free-hand drawing
export interface DrawObject {
  type: "draw";
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
}

// Union type for all drawing objects
export type AnyDrawingObject = 
  | RectangleObject 
  | CircleObject 
  | TriangleObject 
  | LineObject 
  | ArrowObject
  | TextObject
  | DrawObject;

// Result from math equation solving
export interface MathResult {
  expression: string;
  answer: string;
}
