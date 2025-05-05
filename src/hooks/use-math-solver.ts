
import { useState } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { TextObject, MathResult } from "@/components/drawing/types";

interface CalculationResponse {
  expr: string;
  result: string;
  assign: boolean;
}

export const useMathSolver = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dictOfVars, setDictOfVars] = useState<Record<string, string>>({});
  const [lastResult, setLastResult] = useState<MathResult | null>(null);
  const [mathEquations, setMathEquations] = useState<string[]>([]);

  // Handle solving the math equation
  const handleSolve = async (canvas: HTMLCanvasElement, setObjects: (objects: any) => void) => {
    if (!canvas) return;
    
    setIsLoading(true);
    
    try {
      // Send image to server using axios
      const response = await axios({
        method: 'post',
        url: 'http://localhost:8900/calculate',
        data: {
          image: canvas.toDataURL('image/png'),
          dict_of_vars: dictOfVars
        }
      });
      
      // Process the response
      const resp = await response.data;
      console.log('Response', resp);
      
      // Process variable assignments if any
      resp.data.forEach((data: CalculationResponse) => {
        if (data.assign === true) {
          setDictOfVars({
            ...dictOfVars,
            [data.expr]: data.result
          });
        }
      });
      
      // Find the center of the drawing (bounding box)
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        let hasDrawing = false;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            if (imageData.data[i + 3] > 0) {  // If pixel is not transparent
              hasDrawing = true;
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        if (hasDrawing) {
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          
          // Process each result and display it
          resp.data.forEach((data: CalculationResponse) => {
            // Create LaTeX representation
            const latex = `\\(\\LARGE{${data.expr} = ${data.result}}\\)`;
            setMathEquations(prev => [...prev, latex]);
            
            // Add text object to canvas
            const newTextObject: TextObject = {
              type: 'text',
              text: `${data.expr} = ${data.result}`,
              x: centerX,
              y: centerY + 40, // Position below the drawing
              color: '#FF0000',
              lineWidth: 2
            };
            
            setObjects(prev => [...prev, newTextObject]);
            
            // Set the last result for reference
            setLastResult({
              expression: data.expr,
              answer: data.result
            });
          });
        }
      }
      
      // Show toast with result
      toast({
        title: "Calculation Result",
        description: "Successfully processed your drawing",
      });
    } catch (error) {
      console.error("Solve error:", error);
      toast({
        title: "Error",
        description: "Failed to process the drawn content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMathResults = () => {
    setMathEquations([]);
    setLastResult(null);
    setDictOfVars({});
  };

  return {
    isLoading,
    dictOfVars,
    lastResult,
    mathEquations,
    handleSolve,
    clearMathResults
  };
};
