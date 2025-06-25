
import { useState } from "react";
import { AnyDrawingObject, MathResult } from "@/components/drawing/types";

interface UseMathSolverProps {
  objects: AnyDrawingObject[];
  setObjects: (objects: AnyDrawingObject[]) => void;
}

export const useMathSolver = ({ objects, setObjects }: UseMathSolverProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const solveMath = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Find drawing objects that might contain math
      const drawingObjects = objects.filter(obj => obj.type === 'draw');
      
      if (drawingObjects.length === 0) {
        setError("No drawings found to analyze");
        return;
      }

      // Simulate math solving - in real implementation, this would call an API
      // For now, we'll just add a sample result
      const sampleResult: MathResult = {
        type: 'math',
        x: 100,
        y: 100,
        text: "Sample result: 2 + 2 = 4",
        color: "#00FF00",
        fontSize: 20
      };

      // Add the result to objects
      setObjects([...objects, sampleResult]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to solve math problem");
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    // Remove all math results
    const filteredObjects = objects.filter(obj => obj.type !== 'math');
    setObjects(filteredObjects);
  };

  return {
    solveMath,
    clearResults,
    isLoading,
    error
  };
};
