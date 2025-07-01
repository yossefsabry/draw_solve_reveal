
import React from 'react';
import * as THREE from 'three';

interface DrawingPath3DProps {
  points: any[];
  color: string;
  lineWidth: number;
  isPreview?: boolean;
}

const DrawingPath3D: React.FC<DrawingPath3DProps> = ({ 
  points, 
  color, 
  lineWidth, 
  isPreview = false 
}) => {
  if (!points || points.length < 2) return null;
  
  const linePoints = points.map(p => new THREE.Vector3(p.x / 50, 0, -p.y / 50));
  
  // Create a tube geometry for 3D line effect
  const curve = new THREE.CatmullRomCurve3(linePoints);
  const tubeGeometry = new THREE.TubeGeometry(curve, linePoints.length * 2, lineWidth / 100, 8, false);
  
  return (
    <mesh>
      <primitive object={tubeGeometry} />
      <meshStandardMaterial 
        color={color} 
        transparent={isPreview} 
        opacity={isPreview ? 0.7 : 1} 
      />
    </mesh>
  );
};

export default DrawingPath3D;
