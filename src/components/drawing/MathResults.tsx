
import React, { useEffect } from "react";

interface MathResultsProps {
  mathEquations: string[];
}

const MathResults: React.FC<MathResultsProps> = ({ mathEquations }) => {
  // Render MathJax when equations change
  useEffect(() => {
    if (mathEquations.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 100);
    }
  }, [mathEquations]);

  if (mathEquations.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 z-50 p-4">
      {mathEquations.map((latex, index) => (
        <div key={index} className="math-result bg-white bg-opacity-75 p-2 rounded-md shadow-md mb-2">
          <div dangerouslySetInnerHTML={{ __html: latex }} />
        </div>
      ))}
    </div>
  );
};

export default MathResults;
