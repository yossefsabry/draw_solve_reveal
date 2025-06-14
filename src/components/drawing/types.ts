
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

export type AnyDrawingObject = DrawObject;

export type DrawingMode = "draw" | "erase";
export type ShapeTool = "rectangle" | "circle" | "line" | "arrow" | "triangle" | "ellipse" | "polygon";
