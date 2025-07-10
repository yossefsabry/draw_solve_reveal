import React, { useRef, Suspense, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';

interface Model3DProps {
  url: string;
  format: 'gltf' | 'glb' | 'obj';
  position?: [number, number, number];
  onPositionChange?: (position: [number, number, number]) => void;
  scale?: number;
  onLoadError?: (error: string) => void;
}

// Fallback placeholder when model fails to load
const ModelPlaceholder: React.FC = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff6b6b" wireframe />
    </mesh>
  );
};

// Optimized model loader using React Three Fiber's useLoader
const ModelLoader: React.FC<{ 
  url: string; 
  format: 'gltf' | 'glb' | 'obj';
  onLoadError?: (error: string) => void;
}> = ({ url, format, onLoadError }) => {
  let model;
  
  try {
    if (format === 'gltf' || format === 'glb') {
      const gltf = useLoader(GLTFLoader, url);
      console.log(`Successfully loaded ${format} model:`, gltf);
      console.log(`Scene from ${format}:`, gltf.scene);
      console.log(`Scene children:`, gltf.scene?.children);
      model = gltf.scene;
      
      if (!model) {
        console.error(`No scene found in ${format} file`);
        onLoadError?.(`No scene found in ${format} file`);
        return <ModelPlaceholder />;
      }
    } else if (format === 'obj') {
      const obj = useLoader(OBJLoader, url);
      console.log('Successfully loaded OBJ model:', obj);
      model = obj;
    }
  } catch (error) {
    console.error(`Error loading ${format} model from ${url}:`, error);
    onLoadError?.(error instanceof Error ? error.message : `Failed to load ${format} model`);
    return <ModelPlaceholder />;
  }

  // Optimize model for better performance
  const optimizedModel = useMemo(() => {
    if (!model) return null;
    
    const clonedModel = model.clone();
    
    // Traverse and optimize materials for better performance
    clonedModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optimize materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.needsUpdate = true;
              }
            });
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.needsUpdate = true;
          }
        }
      }
    });
    
    return clonedModel;
  }, [model]);

  return optimizedModel ? <primitive object={optimizedModel} /> : <ModelPlaceholder />;
};

// Error boundary component for 3D models
class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: string) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('Error loading 3D model:', error);
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Model loading error:', error, errorInfo);
    this.props.onError?.(error.message || 'Unknown error occurred');
  }

  render() {
    if (this.state.hasError) {
      return <ModelPlaceholder />;
    }

    return this.props.children;
  }
}

const Model3D: React.FC<Model3DProps> = ({ 
  url, 
  format, 
  position = [0, 0, 0], 
  onPositionChange,
  scale = 1,
  onLoadError
}) => {
  const meshRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      userData={{ modelId: url, type: '3d-model' }} // Add metadata for selection
    >
      <ModelErrorBoundary onError={onLoadError}>
        <Suspense fallback={<ModelPlaceholder />}>
          <ModelLoader url={url} format={format} onLoadError={onLoadError} />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
};

export default Model3D;
