
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
      const start = new THREE.Vector3(startPoint.x / 50, 1, -startPoint.y / 50);
      const end = new THREE.Vector3(endPoint.x / 50, 1, -endPoint.y / 50);
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
    const depth = Math.max(width, height) * 0.2;
    const centerX = (startPoint.x + endPoint.x) / 2 / 50;
    const centerZ = -(startPoint.y + endPoint.y) / 2 / 50;
    
    return (
      <mesh position={[centerX, depth / 2 + 1, centerZ]} castShadow>
        <boxGeometry args={[width, depth, height]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          metalness={0.2}
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
    const height = Math.max(radius * 0.4, 0.15);
    
    return (
      <mesh position={[startPoint.x / 50, height / 2 + 1, -startPoint.y / 50]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 64]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    );
  }
  
  if (shapeType === 'line') {
    const start = new THREE.Vector3(startPoint.x / 50, 1, -startPoint.y / 50);
    const end = new THREE.Vector3(endPoint.x / 50, 1, -endPoint.y / 50);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const center = start.clone().add(end).multiplyScalar(0.5);
    
    return (
      <mesh ref={meshRef} position={center} castShadow>
        <cylinderGeometry args={[lineWidth / 150, lineWidth / 150, length, 16]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.7}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    );
  }
  
  return null;
};

export default ShapePreview3D;
