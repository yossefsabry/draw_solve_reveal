
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ShapePreview3DProps {
  startPoint: any;
  endPoint: any;
  shapeType: string;
  color: string;
  lineWidth: number;
}

const ShapePreview3D: React.FC<ShapePreview3DProps> = ({ 
  startPoint, 
  endPoint, 
  shapeType, 
  color, 
  lineWidth 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (meshRef.current && shapeType === 'line' && startPoint && endPoint) {
      const start = new THREE.Vector3(startPoint.x / 50, 0.5, -startPoint.y / 50);
      const end = new THREE.Vector3(endPoint.x / 50, 0.5, -endPoint.y / 50);
      const direction = end.clone().sub(start);
      const axis = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.normalize());
      meshRef.current.quaternion.copy(quaternion);
    }
  }, [startPoint, endPoint, shapeType]);
  
  if (!startPoint || !endPoint) return null;
  
  if (shapeType === 'rectangle') {
    const width = Math.abs(endPoint.x - startPoint.x) / 50;
    const height = Math.abs(endPoint.y - startPoint.y) / 50;
    const depth = Math.max(width, height) * 0.15; // Better proportioned depth
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    
    return (
      <mesh position={[centerX, depth / 2 + 0.5, centerZ]}>
        <boxGeometry args={[width, depth, height]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (shapeType === 'circle') {
    const radius = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + 
      Math.pow(endPoint.y - startPoint.y, 2)
    ) / 50;
    const height = Math.max(radius * 0.3, 0.1); // Better proportioned height
    
    return (
      <mesh position={[startPoint.x / 50, height / 2 + 0.5, -startPoint.y / 50]}>
        <cylinderGeometry args={[radius, radius, height, 64]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (shapeType === 'line') {
    const start = new THREE.Vector3(startPoint.x / 50, 0.5, -startPoint.y / 50);
    const end = new THREE.Vector3(endPoint.x / 50, 0.5, -endPoint.y / 50);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const center = start.clone().add(end).multiplyScalar(0.5);
    
    return (
      <mesh ref={meshRef} position={center}>
        <cylindrGeometry args={[lineWidth / 150, lineWidth / 150, length, 16]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
    );
  }
  
  return null;
};

export default ShapePreview3D;
