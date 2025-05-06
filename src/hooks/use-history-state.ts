
import { useState, useCallback } from 'react';

export function useHistoryState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateState = useCallback((newState: T) => {
    // Cut off any future states if we're not at the end of history
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Add the new state to history
    newHistory.push(newState);
    
    // Update state and history
    setState(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setState(history[newIndex]);
      setCurrentIndex(newIndex);
    }
  }, [history, currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setState(history[newIndex]);
      setCurrentIndex(newIndex);
    }
  }, [history, currentIndex]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    state,
    setState: updateState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
