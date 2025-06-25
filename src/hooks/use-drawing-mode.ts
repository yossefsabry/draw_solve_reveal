
import { useState } from 'react';

export type DrawingMode2D3D = '2d' | '3d';

export const useDrawingMode = () => {
  const [mode, setMode] = useState<DrawingMode2D3D>('2d');
  
  const toggle2D3D = () => {
    setMode(prev => prev === '2d' ? '3d' : '2d');
  };
  
  return {
    mode,
    setMode,
    toggle2D3D,
    is2D: mode === '2d',
    is3D: mode === '3d'
  };
};
