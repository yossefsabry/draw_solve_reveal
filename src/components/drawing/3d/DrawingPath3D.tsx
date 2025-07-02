
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
  
  // Position all drawing paths above the grid (y = 0.5)
  const linePoints = points.map(p => new THREE.Vector3(p.x / 50, 0.5, -p.y / 50));
  
  // Create a tube geometry for 3D line effect with better smoothness
  const curve = new THREE.CatmullRomCurve3(linePoints);
  const segments = Math.max(linePoints.length * 4, 32); // More segments for smoother curves
  const tubeGeometry = new THREE.TubeGeometry(
    curve, 
    segments, 
    lineWidth / 120, // Adjusted radius for better visibility
    12, // More radial segments for smoother tubes
    false
  );
  
  return (
    <mesh castShadow={!isPreview}>
      <primitive object={tubeGeometry} />
      <meshStandardMaterial 
        color={color} 
        transparent={isPreview} 
        opacity={isPreview ? 0.6 : 1}
        metalness={0.1}
        roughness={0.4}
      />
    </mesh>
  );
};

export default DrawingPath3D;
