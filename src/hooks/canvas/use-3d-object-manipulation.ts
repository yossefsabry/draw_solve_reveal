import { useState, useRef } from "react";
import { AnyDrawingObject } from "@/components/drawing/types";
import * as THREE from 'three';

interface UploadedModel {
  id: string;
  name: string;
  url: string;
  format: 'gltf' | 'glb' | 'obj';
  position: [number, number, number];
  scale: number;
}

interface Use3DObjectManipulationProps {
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
  uploadedModels?: UploadedModel[];
  onModelPositionChange?: (modelId: string, position: [number, number, number]) => void;
  camera: THREE.Camera;
  raycaster: THREE.Raycaster;
  mode: string;
}

export const use3DObjectManipulation = ({
  objects,
  setObjects,
  uploadedModels = [],
  onModelPositionChange,
  camera,
  raycaster,
  mode
}: Use3DObjectManipulationProps) => {
  const [selectedObject, setSelectedObject] = useState<{
    type: 'shape' | 'model';
    id: string | number;
    offset: THREE.Vector3;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startObjectManipulation = (event: any) => {
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

    // Use the scene to get all 3D objects for raycasting
    const scene = event.target?.parent?.parent?.scene || event.target?.scene;
    const objects3D = scene ? scene.children : [];
    
    // Get all intersected objects from raycaster 
    const intersects = raycaster.intersectObjects(objects3D, true);
    console.log('Raycaster intersects:', intersects);
    
    // Check for uploaded models first (they're typically on top)
    for (let i = uploadedModels.length - 1; i >= 0; i--) {
      const model = uploadedModels[i];
      const modelPosition = new THREE.Vector3(...model.position);
      
      // Check distance for approximate detection
      const distance = intersectionPoint.distanceTo(modelPosition);
      const withinBounds = distance < model.scale * 4; // Larger detection area
      
      // Check if any intersected object belongs to this model by checking userData or position
      const modelIntersected = intersects.some(intersect => {
        // Check if the intersected object or its ancestors have model metadata
        let current = intersect.object;
        let depth = 0;
        while (current && depth < 15) { // Check up the hierarchy
          if (current.userData?.modelId === model.url || 
              current.userData?.type === '3d-model') {
            return true;
          }
          
          // Also check position matching
          const pos = current.position;
          if (pos && 
              Math.abs(pos.x - model.position[0]) < 1 &&
              Math.abs(pos.y - model.position[1]) < 1 &&
              Math.abs(pos.z - model.position[2]) < 1) {
            return true;
          }
          
          current = current.parent;
          depth++;
        }
        return false;
      });
      
      console.log(`Model ${model.id}: distance=${distance}, withinBounds=${withinBounds}, modelIntersected=${modelIntersected}`);
      
      if (withinBounds || modelIntersected) {
        console.log(`Selected model ${model.id}`);
        setSelectedObject({
          type: 'model',
          id: model.id,
          offset: intersectionPoint.clone().sub(modelPosition)
        });
        setIsDragging(true);
        return true;
      }
    }

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
          setSelectedObject({
            type: 'shape',
            id: i,
            offset: intersectionPoint.clone().sub(objPosition)
          });
          setIsDragging(true);
          return true;
        }
      }
    }

    return false;
  };

  const moveSelectedObject = (event: any) => {
    if (!selectedObject || !isDragging || mode !== 'hand') return;

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

    const newPosition = intersectionPoint.clone().sub(selectedObject.offset);

    if (selectedObject.type === 'model') {
      const position: [number, number, number] = [newPosition.x, newPosition.y, newPosition.z];
      onModelPositionChange?.(selectedObject.id as string, position);
    } else if (selectedObject.type === 'shape') {
      const objIndex = selectedObject.id as number;
      const obj = objects[objIndex];
      const updatedObjects = [...objects];

      // Convert 3D position back to 2D canvas coordinates
      const canvasX = newPosition.x + 400;
      const canvasZ = newPosition.z + 300;

      if ('x' in obj && 'y' in obj) {
        updatedObjects[objIndex] = { ...obj, x: canvasX, y: canvasZ };
      } else if (obj.type === 'draw' && obj.points) {
        const offsetX = canvasX - (obj.points[0].x);
        const offsetY = canvasZ - (obj.points[0].y);
        updatedObjects[objIndex] = {
          ...obj,
          points: obj.points.map(p => ({ x: p.x + offsetX, y: p.y + offsetY }))
        };
      } else if ('x1' in obj && 'y1' in obj && 'x2' in obj && 'y2' in obj) {
        const width = obj.x2 - obj.x1;
        const height = obj.y2 - obj.y1;
        updatedObjects[objIndex] = {
          ...obj,
          x1: canvasX,
          y1: canvasZ,
          x2: canvasX + width,
          y2: canvasZ + height
        };
      }

      setObjects(updatedObjects);
    }
  };

  const stopObjectManipulation = () => {
    setSelectedObject(null);
    setIsDragging(false);
  };

  return {
    selectedObject,
    isDragging,
    startObjectManipulation,
    moveSelectedObject,
    stopObjectManipulation
  };
};