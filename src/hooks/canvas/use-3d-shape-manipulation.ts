import { useState } from "react";
import { AnyDrawingObject } from "@/components/drawing/types";
import * as THREE from 'three';

interface Use3DShapeManipulationProps {
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  camera: THREE.Camera;
  raycaster: THREE.Raycaster;
  mode: string;
}

export const use3DShapeManipulation = ({
  objects,
  setObjects,
  camera,
  raycaster,
  mode
}: Use3DShapeManipulationProps) => {
  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());

  const startShapeManipulation = (event: any) => {
    if (mode !== 'hand') return false;

    // Get mouse position in normalized device coordinates
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Create a plane at y=0 for intersection
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    const hasIntersection = raycaster.ray.intersectPlane(plane, intersectionPoint);

    if (!hasIntersection) return false;

    // Check for drawing objects
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      let objPosition: THREE.Vector3 | null = null;

      // Get object position based on type
      if ('x' in obj && 'y' in obj) {
        objPosition = new THREE.Vector3(obj.x - 400, 0, obj.y - 300); // Convert 2D to 3D space
      } else if (obj.type === 'draw' && obj.points && obj.points.length > 0) {
        const firstPoint = obj.points[0];
        objPosition = new THREE.Vector3(firstPoint.x - 400, 0, firstPoint.y - 300);
      } else if ('x1' in obj && 'y1' in obj) {
        objPosition = new THREE.Vector3(obj.x1 - 400, 0, obj.y1 - 300);
      }

      if (objPosition) {
        const distance = intersectionPoint.distanceTo(objPosition);
        if (distance < 5) { // 5 unit radius for selection
          setSelectedShapeIndex(i);
          setDragOffset(intersectionPoint.clone().sub(objPosition));
          setIsDragging(true);
          return true;
        }
      }
    }

    return false;
  };

  const moveSelectedShape = (event: any) => {
    if (selectedShapeIndex === null || !isDragging || mode !== 'hand') return;

    // Get mouse position
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    const hasIntersection = raycaster.ray.intersectPlane(plane, intersectionPoint);

    if (!hasIntersection) return;

    const newPosition = intersectionPoint.clone().sub(dragOffset);
    const obj = objects[selectedShapeIndex];
    const updatedObjects = [...objects];

    // Convert 3D position back to 2D canvas coordinates
    const canvasX = newPosition.x + 400;
    const canvasZ = newPosition.z + 300;

    if ('x' in obj && 'y' in obj) {
      updatedObjects[selectedShapeIndex] = { ...obj, x: canvasX, y: canvasZ };
    } else if (obj.type === 'draw' && obj.points) {
      const offsetX = canvasX - (obj.points[0].x);
      const offsetY = canvasZ - (obj.points[0].y);
      updatedObjects[selectedShapeIndex] = {
        ...obj,
        points: obj.points.map(p => ({ x: p.x + offsetX, y: p.y + offsetY }))
      };
    } else if ('x1' in obj && 'y1' in obj && 'x2' in obj && 'y2' in obj) {
      const width = obj.x2 - obj.x1;
      const height = obj.y2 - obj.y1;
      updatedObjects[selectedShapeIndex] = {
        ...obj,
        x1: canvasX,
        y1: canvasZ,
        x2: canvasX + width,
        y2: canvasZ + height
      };
    }

    setObjects(updatedObjects);
  };

  const stopShapeManipulation = () => {
    setSelectedShapeIndex(null);
    setIsDragging(false);
    setDragOffset(new THREE.Vector3());
  };

  return {
    selectedShapeIndex,
    isDragging,
    startShapeManipulation,
    moveSelectedShape,
    stopShapeManipulation
  };
};