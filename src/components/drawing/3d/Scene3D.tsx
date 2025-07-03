
import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
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
  const { camera, gl, size } = useThree();
  const controlsRef = useRef<any>();
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isAltPressed, setIsAltPressed] = useState(false);
  
  useEffect(() => {
    // Set better initial camera position to show full grid
    camera.position.set(10, 15, 10);
    camera.lookAt(0, 0, 0);
    
    // Enable shadows with better quality
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.setClearColor('#1a1a1a');
  }, [camera, gl]);

  // Handle keyboard events for Alt key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        setIsAltPressed(true);
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) {
        setIsAltPressed(false);
        setIsPanning(false);
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle mouse events for panning with zoom-to-cursor
  const handleMouseDown = (e: any) => {
    if (isAltPressed) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.stopPropagation();
    } else if (onPointerDown) {
      onPointerDown(e);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isPanning && isAltPressed) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      // Pan the camera based on mouse movement
      const panSpeed = 0.01;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      
      camera.getWorldDirection(new THREE.Vector3());
      right.setFromMatrixColumn(camera.matrix, 0);
      up.setFromMatrixColumn(camera.matrix, 1);
      
      right.multiplyScalar(-deltaX * panSpeed);
      up.multiplyScalar(deltaY * panSpeed);
      
      camera.position.add(right);
      camera.position.add(up);
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.stopPropagation();
    } else if (onPointerMove && !isAltPressed) {
      onPointerMove(e);
    }
  };

  const handleMouseUp = (e: any) => {
    if (isPanning) {
      setIsPanning(false);
      e.stopPropagation();
    } else if (onPointerUp) {
      onPointerUp(e);
    }
  };

  // Handle wheel events for zoom-to-cursor
  const handleWheel = (e: any) => {
    if (!controlsRef.current) return;
    
    e.stopPropagation();
    
    const delta = e.deltaY;
    const zoomSpeed = 0.1;
    
    // Get mouse position in normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (e.clientX / size.width) * 2 - 1;
    mouse.y = -(e.clientY / size.height) * 2 + 1;
    
    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Find intersection with grid plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    
    // Calculate zoom direction
    const direction = new THREE.Vector3();
    direction.subVectors(intersection, camera.position).normalize();
    
    // Apply zoom
    const zoomAmount = delta > 0 ? zoomSpeed : -zoomSpeed;
    camera.position.addScaledVector(direction, zoomAmount);
    
    // Clamp camera distance
    const distance = camera.position.length();
    if (distance < 2) {
      camera.position.normalize().multiplyScalar(2);
    } else if (distance > 100) {
      camera.position.normalize().multiplyScalar(100);
    }
  };
  
  return (
    <>
      {/* Enhanced Lighting with better shadows */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[20, 20, 10]} 
        intensity={1.2}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />
      <pointLight 
        position={[-20, 15, -10]} 
        intensity={0.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Enhanced Grid with better visibility */}
      {showGrid && (
        <>
          <Grid
            position={[0, 0, 0]}
            args={[100, 100]}
            cellSize={2}
            cellThickness={0.8}
            cellColor={'#444444'}
            sectionSize={10}
            sectionThickness={1.5}
            sectionColor={'#666666'}
            fadeDistance={80}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
          />
          {/* Enhanced shadow receiving plane */}
          <mesh
            position={[0, -0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial 
              transparent 
              opacity={0}
              shadowSide={2}
            />
          </mesh>
        </>
      )}
      
      {/* Drawing plane - invisible but catches pointer events */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onWheel={handleWheel}
        visible={false}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Render all objects with better positioning */}
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
      {isDrawing && currentPath && currentPath.length > 1 && mode === 'draw' && !isPanning && (
        <DrawingPath3D
          points={currentPath}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
          isPreview={true}
        />
      )}
      
      {/* Show shape preview */}
      {isDrawing && selectedShape && previewStartPoint && previewEndPoint && mode !== 'draw' && !isPanning && (
        <ShapePreview3D
          startPoint={previewStartPoint}
          endPoint={previewEndPoint}
          shapeType={selectedShape}
          color={color || '#ffffff'}
          lineWidth={brushSize || 2}
        />
      )}
      
      {/* Enhanced Controls */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={!isDrawing && !isPanning}
        enableZoom={!isDrawing && !isPanning}
        enableRotate={!isDrawing && !isPanning}
        minDistance={2}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.1}
        dampingFactor={0.05}
        enableDamping={true}
        panSpeed={1}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
};

export default Scene3D;
