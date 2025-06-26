
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface TextInputBoxProps {
  x: number;
  y: number;
  zoom: number;
  offset: { x: number; y: number };
  onSubmit: (text: string) => void;
  onCancel: () => void;
  initialText?: string;
}

const TextInputBox: React.FC<TextInputBoxProps> = ({
  x,
  y,
  zoom,
  offset,
  onSubmit,
  onCancel,
  initialText = ""
}) => {
  const [text, setText] = useState(initialText);
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
      onSubmit(text.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div
      className="absolute z-50 bg-white border-2 border-blue-400 rounded-lg shadow-2xl p-3"
      style={{
        left: Math.max(10, Math.min(screenX, window.innerWidth - 260)),
        top: Math.max(10, Math.min(screenY, window.innerHeight - 140)),
        width: '250px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="mb-2">
        <span className="text-xs font-medium text-gray-600">Enter your text:</span>
      </div>
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your text here..."
        className="min-h-[80px] resize-none text-sm text-black border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        rows={4}
      />
      <div className="flex gap-2 mt-3">
        <Button
          onClick={handleSubmit}
          size="sm"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs h-8"
        >
          <Check className="w-3 h-3 mr-1" />
          Add (Ctrl+Enter)
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8 border-gray-300 hover:bg-gray-50"
        >
          <X className="w-3 h-3 mr-1" />
          Cancel (Esc)
        </Button>
      </div>
    </div>
  );
};

export default TextInputBox;
