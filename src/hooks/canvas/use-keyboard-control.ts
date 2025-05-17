
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
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setKeyPressed(prev => ({ ...prev, space: false }));
      }
      if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        setKeyPressed(prev => ({ ...prev, ctrl: false }));
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
