
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

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
      className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg p-2"
      style={{
        left: Math.max(10, Math.min(screenX, window.innerWidth - 210)),
        top: Math.max(10, Math.min(screenY, window.innerHeight - 110)),
        width: '200px',
      }}
    >
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your text here..."
        className="min-h-[60px] resize-none text-sm text-black"
        rows={3}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Add (Ctrl+Enter)
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          Cancel (Esc)
        </button>
      </div>
    </div>
  );
};

export default TextInputBox;
