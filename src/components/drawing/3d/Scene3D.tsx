import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { AnyDrawingObject, DrawingMode } from '../types';
import Shape3D from './Shape3D';
import DrawingPath3D from './DrawingPath3D';
import ShapePreview3D from './ShapePreview3D';
import Model3D from './Model3D';
import { use3DObjectManipulation } from '@/hooks/canvas/use-3d-object-manipulation';
import { use3DShapeManipulation } from '@/hooks/canvas/use-3d-shape-manipulation';
import * as THREE from 'three';

interface UploadedModel {
  id: string;
  name: string;
  url: string;
  format: 'gltf' | 'glb' | 'obj';
  position: [number, number, number];
  scale: number;
}

interface Scene3DProps {
  objects: AnyDrawingObject[];
  setObjects?: (objects: AnyDrawingObject[]) => void;
  showGrid?: boolean;
  onPointerDown?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  currentPath?: { x: number; y: number }[];
  previewStartPoint?: { x: number; y: number } | null;
  previewEndPoint?: { x: number; y: number } | null;
  color?: string;
  brushSize?: number;
  isDrawing?: boolean;
  selectedShape?: string;
  mode?: DrawingMode;
  uploadedModels?: UploadedModel[];
  onModelPositionChange?: (modelId: string, position: [number, number, number]) => void;
}

const Scene3D: React.FC<Scene3DProps> = ({ 
  objects,
  setObjects,
  showGrid = true,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  currentPath,
  previewStartPoint,
  previewEndPoint,
  color,
  brushSize,
  isDrawing,
  selectedShape,
  mode,
  uploadedModels = [],
  onModelPositionChange
}) => {
  const { camera, gl, raycaster } = useThree();
  const controlsRef = useRef<any>();
  const planeRef = useRef<THREE.Mesh>(null);
  
  // Object manipulation for hand tool (for models)
  const {
    selectedObject,
    isDragging: isModelDragging,
    startObjectManipulation,
    moveSelectedObject,
    stopObjectManipulation
  } = use3DObjectManipulation({
    objects,
    setObjects: () => {},
    uploadedModels,
    onModelPositionChange,
    camera,
    raycaster,
    mode: mode || 'draw'
  });

  // Shape manipulation for hand tool (for drawing objects)
  const {
    selectedShapeIndex,
    isDragging: isShapeDragging,
    startShapeManipulation,
    moveSelectedShape,
    stopShapeManipulation
  } = use3DShapeManipulation({
    objects,
    setObjects: setObjects || (() => {}),
    camera,
    raycaster,
    mode: mode || 'draw'
  });

  const isDragging = isModelDragging || isShapeDragging;
  
  useEffect(() => {
    // Position camera to show the full grid plate
    camera.position.set(25, 25, 25);
    camera.lookAt(0, 0, 0);
    
    // Optimize renderer settings for better performance
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFShadowMap;
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for better performance
  }, [camera, gl]);

  // Improved zoom to cursor functionality
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!controlsRef.current) return;
      
      e.preventDefault();
      
      // Get mouse position in normalized device coordinates (-1 to +1)
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Create raycaster from mouse position
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      
      // Find intersection with the grid plane (y = 0)
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      const hasIntersection = raycaster.ray.intersectPlane(plane, intersectionPoint);
      
      // Zoom parameters
      const zoomSpeed = 0.3;
      const zoomFactor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      
      // Get current distance from target
      const currentDistance = camera.position.distanceTo(controlsRef.current.target);
      
      // Calculate new distance with limits
      const minDistance = 5;
      const maxDistance = 100;
      const newDistance = Math.max(minDistance, Math.min(maxDistance, currentDistance * zoomFactor));
      
      // Calculate zoom ratio for target adjustment
      const zoomRatio = (currentDistance - newDistance) / currentDistance;
      
      // Move target towards intersection point for zoom-to-cursor effect
      if (hasIntersection && intersectionPoint) {
        // Calculate the vector from current target to intersection point
        const targetToIntersection = intersectionPoint.clone().sub(controlsRef.current.target);
        
        // Move target by a portion of this vector based on zoom amount
        const targetShift = targetToIntersection.multiplyScalar(zoomRatio * 0.5);
        controlsRef.current.target.add(targetShift);
      }
      
      // Calculate direction from target to camera
      const direction = camera.position.clone().sub(controlsRef.current.target).normalize();
      
      // Set new camera position maintaining the same angle
      const newPosition = controlsRef.current.target.clone().add(direction.multiplyScalar(newDistance));
      camera.position.copy(newPosition);
      
      // Update controls
      controlsRef.current.update();
    };

    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl]);

  // Handle mouse events for drawing and object manipulation
  const handleMouseDown = (e: any) => {
    if (mode === 'hand') {
      // Try model manipulation first
      const modelHandled = startObjectManipulation(e);
      if (modelHandled) {
        // Disable orbit controls when manipulating objects
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
        return;
      }
      
      // Try shape manipulation if no model was selected
      const shapeHandled = startShapeManipulation(e);
      if (shapeHandled) {
        // Disable orbit controls when manipulating objects
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
        return;
      }
    }
    
    if (onPointerDown) {
      onPointerDown(e);
    }
  };

  const handleMouseMove = (e: any) => {
    if (mode === 'hand') {
      if (isModelDragging) {
        moveSelectedObject(e);
        return;
      }
      if (isShapeDragging) {
        moveSelectedShape(e);
        return;
      }
    }
    
    if (onPointerMove) {
      onPointerMove(e);
    }
  };

  const handleMouseUp = (e: any) => {
    if (mode === 'hand') {
      stopObjectManipulation();
      stopShapeManipulation();
      // Re-enable orbit controls
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
      return;
    }
    
    if (onPointerUp) {
      onPointerUp(e);
    }
  };
  
  return (
    <>
      {/* Optimized Lighting for better performance */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[40, 40, 30]} 
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight 
        position={[-40, 30, -30]} 
        intensity={0.3}
      />
      
      {/* Large Rectangular Grid Plate with very subtle pink color */}
      {showGrid && (
        <>
          <Grid
            position={[0, 0, 0]}
            args={[200, 150]} 
            cellSize={2}
            cellThickness={0.3}
            cellColor={'#ffb3d9'} 
            sectionSize={10}
            sectionThickness={0.5}
            sectionColor={'#ff99cc'} 
            fadeDistance={400}
            fadeStrength={0.8} 
            followCamera={false}
            infiniteGrid={false}
            material-opacity={0.2}
            material-transparent={true}
          />
          {/* Invisible plane to receive shadows and catch pointer events */}
          <mesh
            ref={planeRef}
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            onPointerDown={handleMouseDown}
            onPointerMove={handleMouseMove}
            onPointerUp={handleMouseUp}
            visible={false}
          >
            <planeGeometry args={[400, 300]} />
            <meshStandardMaterial 
              transparent 
              opacity={0}
              shadowSide={2}
            />
          </mesh>
        </>
      )}
      
      {/* Render all drawing objects above the grid plate */}
      {objects.map((obj, index) => {
        if (obj.type === 'draw') {
          return (
            <DrawingPath3D
              key={`draw-${index}`}
              points={obj.points || []}
              color={obj.color || '#ffffff'}
              lineWidth={obj.lineWidth || 2}
            />
          );
        }
        return <Shape3D key={`shape-${index}`} obj={obj} />;
      })}

      {/* Render uploaded 3D models */}
      {uploadedModels.map((model) => (
        <Model3D
          key={model.id}
          url={model.url}
          format={model.format}
          position={model.position}
          scale={model.scale}
          onPositionChange={(position) => onModelPositionChange?.(model.id, position)}
          onLoadError={(error) => {
            console.error(`Failed to load model ${model.name}:`, error);
            // You could add a toast notification here if you want to show errors to the user
          }}
        />
      ))}
      
      {/* Show current drawing path preview */}
      {isDrawing && currentPath && currentPath.length > 1 && mode === 'draw' && (
        <DrawingPath3D
          points={currentPath}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
          isPreview={true}
        />
      )}
      
      {isDrawing && selectedShape && previewStartPoint && previewEndPoint && mode !== 'draw' && (
        <ShapePreview3D
          startPoint={previewStartPoint}
          endPoint={previewEndPoint}
          shapeType={selectedShape}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
        />
      )}
      
      {/* Orbit Controls - disabled only when actively drawing */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        enableZoom={false} 
        enableRotate={!isDrawing} 
        enabled={!isDrawing}
        enableDamping={true}
        dampingFactor={0.08} 
        rotateSpeed={0.5}
        autoRotate={false}
        target={[0, 0, 0]}
        minDistance={5}
        maxDistance={100}
      />
    </>
  );
};

export default Scene3D;
