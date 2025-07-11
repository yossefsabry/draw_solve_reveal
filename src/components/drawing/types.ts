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

export interface PersonObject {
  type: 'person';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

export interface HouseObject {
  type: 'house';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

export interface StarObject {
  type: 'star';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

export interface CubeObject {
  type: 'cube';
  x: number;
  y: number;
  size: number;
  color: string;
  lineWidth: number;
}

export interface CylinderObject {
  type: 'cylinder';
  x: number;
  y: number;
  radius: number;
  height: number;
  color: string;
  lineWidth: number;
}

export interface PyramidObject {
  type: 'pyramid';
  x: number;
  y: number;
  size: number;
  height: number;
  color: string;
  lineWidth: number;
}

export interface ConeObject {
  type: 'cone';
  x: number;
  y: number;
  radius: number;
  height: number;
  color: string;
  lineWidth: number;
}

export interface CuboidObject {
  type: 'cuboid';
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  lineWidth: number;
}

export interface HexagonalPrismObject {
  type: 'hexagonalPrism';
  x: number;
  y: number;
  radius: number;
  height: number;
  color: string;
  lineWidth: number;
}

export interface SphereObject {
  type: 'sphere';
  x: number;
  y: number;
  radius: number;
  color: string;
  lineWidth: number;
}

export interface HemisphereObject {
  type: 'hemisphere';
  x: number;
  y: number;
  radius: number;
  color: string;
  lineWidth: number;
}

export interface TriangularPrismObject {
  type: 'triangularPrism';
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  lineWidth: number;
}

export type AnyDrawingObject = DrawObject | RectangleObject | CircleObject | EllipseObject | LineObject | ArrowObject | TriangleObject | PolygonObject | TextObject | MathResult | PersonObject | HouseObject | StarObject | CubeObject | CylinderObject | PyramidObject | ConeObject | CuboidObject | HexagonalPrismObject | SphereObject | HemisphereObject | TriangularPrismObject;

export type DrawingMode = "draw" | "erase" | "text" | "move" | "hand";
export type ShapeTool = "rectangle" | "circle" | "line" | "arrow" | "triangle" | "ellipse" | "polygon" | "person" | "house" | "star" | "cube" | "cylinder" | "pyramid" | "cone" | "cuboid" | "hexagonalPrism" | "sphere" | "hemisphere" | "triangularPrism";
