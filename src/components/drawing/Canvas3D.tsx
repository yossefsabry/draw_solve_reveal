
import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { Vector3 } from 'three';

interface Canvas3DProps {
  color: string;
  brushSize: number;
  mode: string;
  objects: any[];
  setObjects: (objects: any[]) => void;
}

function DrawingMesh({ position }: { position: Vector3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}

const Canvas3D: React.FC<Canvas3DProps> = ({
  color,
  brushSize,
  mode,
  objects,
  setObjects
}) => {
  const [drawingPoints, setDrawingPoints] = useState<Vector3[]>([]);
  
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        style={{ background: '#000000' }}
      >
        <Environment preset="studio" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Grid for reference */}
        <Grid args={[20, 20]} />
        
        {/* Render 3D drawing points */}
        {drawingPoints.map((point, index) => (
          <DrawingMesh key={index} position={point} />
        ))}
        
        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
      
      {/* 3D Drawing info */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        color: 'white',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        3D Mode: Click and drag to rotate, scroll to zoom
      </div>
    </div>
  );
};

export default Canvas3D;
