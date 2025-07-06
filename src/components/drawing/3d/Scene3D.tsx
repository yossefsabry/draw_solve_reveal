
import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Box } from '@react-three/drei';
import { AnyDrawingObject, DrawingMode } from '../types';
import Shape3D from './Shape3D';
import DrawingPath3D from './DrawingPath3D';
import ShapePreview3D from './ShapePreview3D';
import * as THREE from 'three';

interface Scene3DProps {
  objects: AnyDrawingObject[];
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
}

const Scene3D: React.FC<Scene3DProps> = ({ 
  objects, 
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
  mode
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const planeRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    // Enhanced camera positioning for better 3D perspective
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);
    
    // Enhanced shadow settings for better visual quality
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.2;
  }, [camera, gl]);

  // Enhanced zoom to cursor functionality with better precision
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!controlsRef.current) return;
      
      e.preventDefault();
      
      // Get precise mouse position
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Enhanced raycasting with multiple intersection attempts
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      
      // Primary intersection with grid plane
      const gridPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      const hasIntersection = raycaster.ray.intersectPlane(gridPlane, intersectionPoint);
      
      // Enhanced zoom parameters
      const zoomSpeed = e.shiftKey ? 0.15 : 0.1; // Slower zoom with Shift
      const zoomFactor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      
      // Get current distance with better precision
      const currentDistance = camera.position.distanceTo(controlsRef.current.target);
      
      // Dynamic zoom limits based on current view
      const minDistance = 3;
      const maxDistance = 150;
      const newDistance = Math.max(minDistance, Math.min(maxDistance, currentDistance * zoomFactor));
      
      if (hasIntersection && intersectionPoint) {
        // Calculate precise zoom direction
        const targetToIntersection = intersectionPoint.clone().sub(controlsRef.current.target);
        const zoomIntensity = (currentDistance - newDistance) / currentDistance;
        
        // Smooth target transition for accurate cursor tracking
        const targetShift = targetToIntersection.multiplyScalar(zoomIntensity * 0.7);
        controlsRef.current.target.add(targetShift);
        
        // Maintain view angle while zooming
        const direction = camera.position.clone().sub(controlsRef.current.target).normalize();
        const newPosition = controlsRef.current.target.clone().add(direction.multiplyScalar(newDistance));
        
        // Smooth camera transition
        camera.position.copy(newPosition);
        controlsRef.current.update();
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl]);

  // Handle mouse events for drawing
  const handleMouseDown = (e: any) => {
    if (onPointerDown) {
      onPointerDown(e);
    }
  };

  const handleMouseMove = (e: any) => {
    if (onPointerMove) {
      onPointerMove(e);
    }
  };

  const handleMouseUp = (e: any) => {
    if (onPointerUp) {
      onPointerUp(e);
    }
  };
  
  return (
    <>
      {/* Enhanced lighting system */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[50, 50, 40]} 
        intensity={1.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={400}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-bias={-0.0001}
      />
      <pointLight 
        position={[-50, 40, -40]} 
        intensity={0.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight 
        args={[0xffffff, 0x444444, 0.4]}
      />
      
      {/* Enhanced Grid System */}
      {showGrid && (
        <Grid
          position={[0, 0, 0]}
          args={[200, 200]} 
          cellSize={2}
          cellThickness={0.5}
          cellColor={'#ffb3d9'} 
          sectionSize={10}
          sectionThickness={1.0}
          sectionColor={'#ff80cc'} 
          fadeDistance={400}
          fadeStrength={1} 
          followCamera={false}
          infiniteGrid={false}
        />
      )}

      {/* Coordinate Axes */}
      <Box args={[100, 0.2, 0.2]} position={[0, 0.1, 0]}>
        <meshBasicMaterial color="red" transparent opacity={0.7} />
      </Box>
      <Box args={[0.2, 0.2, 100]} position={[0, 0.1, 0]}>
        <meshBasicMaterial color="blue" transparent opacity={0.7} />
      </Box>
      <Box args={[0.2, 50, 0.2]} position={[0, 25, 0]}>
        <meshBasicMaterial color="green" transparent opacity={0.7} />
      </Box>

      {/* Coordinate Labels */}
      <Text
        position={[25, 2, 0]}
        fontSize={2}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      <Text
        position={[0, 27, 0]}
        fontSize={2}
        color="green"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>
      <Text
        position={[0, 2, 25]}
        fontSize={2}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        Z
      </Text>

      {/* Origin marker */}
      <Box args={[1, 1, 1]} position={[0, 0.5, 0]}>
        <meshStandardMaterial 
          color="#ff6b9d" 
          transparent 
          opacity={0.8}
        />
      </Box>

      {/* Interactive plane for drawing */}
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
        <planeGeometry args={[500, 400]} />
        <meshStandardMaterial 
          transparent 
          opacity={0}
        />
      </mesh>
      
      {/* Render all objects above the grid plate */}
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
      
      {/* Enhanced Orbit Controls */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={true} 
        enableZoom={false} 
        enableRotate={true} 
        enableDamping={true}
        dampingFactor={0.05} 
        rotateSpeed={0.8}
        panSpeed={1.2}
        autoRotate={false}
        target={[0, 0, 0]}
        minDistance={3}
        maxDistance={150}
        maxPolarAngle={Math.PI * 0.95}
        minPolarAngle={0.1}
      />
    </>
  );
};

export default Scene3D;
