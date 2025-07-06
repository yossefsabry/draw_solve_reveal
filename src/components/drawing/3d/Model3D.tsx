import React, { useRef, Suspense, useState, useEffect } from 'react';
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

// Separate component for loading models to handle errors properly
const ModelLoader: React.FC<{ 
  url: string; 
  format: 'gltf' | 'glb' | 'obj';
  onLoadError?: (error: string) => void;
}> = ({ url, format, onLoadError }) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      setIsLoading(true);
      setLoadError(null);
      setModel(null);
      try {
        if (format === 'gltf' || format === 'glb') {
          const loader = new GLTFLoader();
          const loadGLTF = () => new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Model loading timed out. The file may be corrupted or have missing dependencies.'));
            }, 30000);
            loader.load(
              url,
              (gltf) => {
                clearTimeout(timeout);
                if (isMounted) {
                  setModel(gltf.scene);
                  setLoadError(null); // clear error if model loads
                }
                resolve(gltf.scene);
              },
              undefined,
              (error) => {
                clearTimeout(timeout);
                if (isMounted) setLoadError((error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Failed to load model');
                reject(error);
              }
            );
          });
          await loadGLTF();
        } else if (format === 'obj') {
          const loader = new OBJLoader();
          const loadOBJ = () => new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Model loading timed out. The file may be corrupted.'));
            }, 30000);
            loader.load(
              url,
              (obj) => {
                clearTimeout(timeout);
                if (isMounted) {
                  setModel(obj);
                  setLoadError(null); // clear error if model loads
                }
                resolve(obj);
              },
              undefined,
              (error) => {
                clearTimeout(timeout);
                if (isMounted) setLoadError((error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Failed to load model');
                reject(error);
              }
            );
          });
          await loadOBJ();
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load model';
          setLoadError(errorMessage);
          onLoadError?.(errorMessage);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadModel();
    return () => { isMounted = false; };
  }, [url, format, onLoadError]);

  // Only show placeholder if there is no model and either loading or error
  if (!model && (isLoading || loadError)) {
    return <ModelPlaceholder />;
  }
  // Always show the model if present
  return model ? <primitive object={model.clone()} /> : null;
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
