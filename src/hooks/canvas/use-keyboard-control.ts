
import { useState, useEffect } from "react";

export const useKeyboardControl = () => {
  const [keyPressed, setKeyPressed] = useState<{ [key: string]: boolean }>({});
  
  // Set up key listeners for handling keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setKeyPressed(prev => ({ ...prev, space: true }));
      }
      if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        setKeyPressed(prev => ({ ...prev, ctrl: true }));
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setKeyPressed(prev => ({ ...prev, shift: true }));
      }
      if (e.code === 'KeyZ') {
        setKeyPressed(prev => ({ ...prev, z: true }));
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setKeyPressed(prev => ({ ...prev, space: false }));
      }
      if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        setKeyPressed(prev => ({ ...prev, ctrl: false }));
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setKeyPressed(prev => ({ ...prev, shift: false }));
      }
      if (e.code === 'KeyZ') {
        setKeyPressed(prev => ({ ...prev, z: false }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  return { keyPressed };
};
