
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X, Plus, Minus } from 'lucide-react';

interface TextInputBoxProps {
  x: number;
  y: number;
  zoom: number;
  offset: { x: number; y: number };
  onSubmit: (text: string, fontSize: number) => void;
  onCancel: () => void;
  initialText?: string;
  initialFontSize?: number;
}

const TextInputBox: React.FC<TextInputBoxProps> = ({
  x,
  y,
  zoom,
  offset,
  onSubmit,
  onCancel,
  initialText = "",
  initialFontSize = 24
}) => {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate screen position from canvas coordinates
  const screenX = x * zoom + offset.x;
  const screenY = y * zoom + offset.y;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim(), fontSize);
    } else {
      onCancel();
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 72));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 8));
  };

  return (
    <div
      className="absolute z-50 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-2xl p-4"
      style={{
        left: Math.max(10, Math.min(screenX, window.innerWidth - 320)),
        top: Math.max(10, Math.min(screenY, window.innerHeight - 200)),
        width: '300px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter your text:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Size: {fontSize}px</span>
            <div className="flex items-center gap-1">
              <Button
                onClick={decreaseFontSize}
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Button
                onClick={increaseFontSize}
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div 
          className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border text-gray-800 dark:text-gray-200 min-h-[40px] flex items-center"
          style={{ fontSize: `${Math.max(12, fontSize * 0.6)}px` }}
        >
          {text || "Preview text will appear here..."}
        </div>
      </div>

      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your text here..."
        className="min-h-[100px] resize-none text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
        rows={5}
      />
      
      <div className="flex gap-2 mt-4">
        <Button
          onClick={handleSubmit}
          size="sm"
          className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs h-9 font-medium"
        >
          <Check className="w-4 h-4 mr-2" />
          Add Text (Ctrl+Enter)
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-9 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel (Esc)
        </Button>
      </div>
    </div>
  );
};

export default TextInputBox;
