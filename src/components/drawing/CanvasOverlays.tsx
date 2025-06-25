
import React, { useRef, useEffect } from 'react';

interface CanvasOverlaysProps {
  is2D: boolean;
  results: any[];
  customTexts: any[];
  zoom: number;
  offset: { x: number; y: number };
  onResultMove: (id: string, x: number, y: number) => void;
  onResultResize: (id: string, width: number, height: number) => void;
  onResultRemove: (id: string) => void;
  onTextMove: (id: string, x: number, y: number) => void;
  onTextResize: (id: string, width: number, height: number) => void;
  onTextEdit: (id: string, text: string) => void;
  onTextStartEdit: (id: string) => void;
  onTextAutoSize: (id: string, width: number, height: number) => void;
}

// DraggableLabel component
function DraggableLabel({ label, onMove, onResize, onRemove, zoom, offset }) {
  const ref = useRef(null);
  const minSize = 20;
  const dragState = useRef({ dragging: false, resizing: false, startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    function onMouseDown(e) {
      if (e.target.classList.contains('resize-handle')) {
        dragState.current.resizing = true;
        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.origW = label.width;
        dragState.current.origH = label.height;
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
      } else {
        dragState.current.dragging = true;
        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.origX = label.x;
        dragState.current.origY = label.y;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }
    
    function onMouseMove(e) {
      if (!dragState.current.dragging) return;
      const dx = (e.clientX - dragState.current.startX) / zoom;
      const dy = (e.clientY - dragState.current.startY) / zoom;
      el.style.left = `${((dragState.current.origX + dx + offset.x) * zoom)}px`;
      el.style.top = `${((dragState.current.origY + dy + offset.y) * zoom)}px`;
    }
    
    function onMouseUp(e) {
      if (!dragState.current.dragging) return;
      dragState.current.dragging = false;
      const dx = (e.clientX - dragState.current.startX) / zoom;
      const dy = (e.clientY - dragState.current.startY) / zoom;
      onMove(dragState.current.origX + dx, dragState.current.origY + dy);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    
    function onResizeMove(e) {
      if (!dragState.current.resizing) return;
      let newW = Math.max(minSize, dragState.current.origW + (e.clientX - dragState.current.startX) / zoom);
      let newH = Math.max(minSize, dragState.current.origH + (e.clientY - dragState.current.startY) / zoom);
      el.style.width = `${newW * zoom}px`;
      el.style.height = `${newH * zoom}px`;
    }
    
    function onResizeUp(e) {
      if (!dragState.current.resizing) return;
      dragState.current.resizing = false;
      let newW = Math.max(minSize, dragState.current.origW + (e.clientX - dragState.current.startX) / zoom);
      let newH = Math.max(minSize, dragState.current.origH + (e.clientY - dragState.current.startY) / zoom);
      onResize(newW, newH);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    }
    
    el.addEventListener('mousedown', onMouseDown);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    };
  }, [label, onMove, onResize, zoom, offset]);

  const screenX = (label.x + offset.x) * zoom;
  const screenY = (label.y + offset.y) * zoom;
  const width = (isNaN(label.width) || label.width < minSize ? minSize : label.width) * zoom;
  const height = (isNaN(label.height) || label.height < minSize ? minSize : label.height) * zoom;

  const handleResizeDoubleClick = (e) => {
    e.stopPropagation();
    if (onRemove) onRemove(label.id);
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        width,
        height,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Math.max(16, height * 0.7),
        cursor: 'move',
        zIndex: 20,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        overflow: 'visible',
        pointerEvents: 'auto',
      }}
    >
      <span style={{ pointerEvents: 'none', width: '100%', textAlign: 'center', whiteSpace: 'pre' }}>{label.expr} = {label.value}</span>
      <span
        className="resize-handle"
        style={{
          width: 12,
          height: 12,
          background: '#fff',
          borderRadius: '50%',
          cursor: 'nwse-resize',
          marginLeft: 8,
          position: 'absolute',
          right: -6,
          bottom: -6,
          zIndex: 21,
        }}
        onDoubleClick={handleResizeDoubleClick}
      />
    </div>
  );
}

// DraggableTextLabel component
function DraggableTextLabel({ label, onMove, onResize, onEdit, onStartEdit, onAutoSize, zoom, offset }) {
  const ref = useRef(null);
  const measureRef = useRef(null);
  const minSize = 20;
  const dragState = useRef({ dragging: false, resizing: false, startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    function onMouseDown(e) {
      if (e.target.classList.contains('resize-handle')) {
        dragState.current.resizing = true;
        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.origW = label.width;
        dragState.current.origH = label.height;
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
      } else {
        dragState.current.dragging = true;
        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.origX = label.x;
        dragState.current.origY = label.y;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }
    
    function onMouseMove(e) {
      if (!dragState.current.dragging) return;
      const dx = (e.clientX - dragState.current.startX) / zoom;
      const dy = (e.clientY - dragState.current.startY) / zoom;
      el.style.left = `${((dragState.current.origX + dx + offset.x) * zoom)}px`;
      el.style.top = `${((dragState.current.origY + dy + offset.y) * zoom)}px`;
    }
    
    function onMouseUp(e) {
      if (!dragState.current.dragging) return;
      dragState.current.dragging = false;
      const dx = (e.clientX - dragState.current.startX) / zoom;
      const dy = (e.clientY - dragState.current.startY) / zoom;
      onMove(dragState.current.origX + dx, dragState.current.origY + dy);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    
    function onResizeMove(e) {
      if (!dragState.current.resizing) return;
      let newW = Math.max(minSize, dragState.current.origW + (e.clientX - dragState.current.startX) / zoom);
      let newH = Math.max(minSize, dragState.current.origH + (e.clientY - dragState.current.startY) / zoom);
      el.style.width = `${newW * zoom}px`;
      el.style.height = `${newH * zoom}px`;
    }
    
    function onResizeUp(e) {
      if (!dragState.current.resizing) return;
      dragState.current.resizing = false;
      let newW = Math.max(minSize, dragState.current.origW + (e.clientX - dragState.current.startX) / zoom);
      let newH = Math.max(minSize, dragState.current.origH + (e.clientY - dragState.current.startY) / zoom);
      onResize(newW, newH);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    }
    
    el.addEventListener('mousedown', onMouseDown);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    };
  }, [label, onMove, onResize, zoom, offset]);

  useEffect(() => {
    if (label.editing && measureRef.current && onAutoSize) {
      const span = measureRef.current;
      const rect = span.getBoundingClientRect();
      const width = Math.max(minSize, rect.width / zoom);
      const height = Math.max(minSize, rect.height / zoom);
      if (Math.abs(width - label.width) > 2 || Math.abs(height - label.height) > 2) {
        onAutoSize(width, height);
      }
    }
  }, [label.text, label.editing, zoom]);

  const screenX = (label.x + offset.x) * zoom;
  const screenY = (label.y + offset.y) * zoom;
  const width = (isNaN(label.width) || label.width < minSize ? minSize : label.width) * zoom;
  const height = (isNaN(label.height) || label.height < minSize ? minSize : label.height) * zoom;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        width,
        height,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Math.max(16, height * 0.7),
        cursor: 'move',
        zIndex: 20,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        overflow: 'visible',
        pointerEvents: 'auto',
      }}
      onDoubleClick={onStartEdit}
    >
      {label.editing ? (
        <>
          <textarea
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              fontSize: Math.max(16, height * 0.7),
              color: '#fff',
              background: 'rgba(0,0,0,0.7)',
              border: 'none',
              outline: 'none',
              textAlign: 'center',
              resize: 'none',
              overflow: 'auto',
              padding: 0,
            }}
            value={label.text}
            onChange={e => onEdit((e.target as HTMLTextAreaElement).value)}
            onBlur={e => onEdit((e.target as HTMLTextAreaElement).value)}
            rows={Math.max(1, Math.round(height / (Math.max(16, height * 0.7)) ))}
          />
          <span
            ref={measureRef}
            style={{
              position: 'absolute',
              left: -9999,
              top: -9999,
              whiteSpace: 'pre-wrap',
              fontWeight: 'bold',
              fontSize: Math.max(16, height * 0.7),
              fontFamily: 'inherit',
              visibility: 'hidden',
              pointerEvents: 'none',
              width: 'auto',
              minWidth: minSize,
              maxWidth: 600,
            }}
          >
            {label.text || ' '}
          </span>
        </>
      ) : (
        <span style={{ pointerEvents: 'none', width: '100%', textAlign: 'center', whiteSpace: 'pre-wrap' }}>{label.text}</span>
      )}
      <span
        className="resize-handle"
        style={{
          width: 12,
          height: 12,
          background: '#fff',
          borderRadius: '50%',
          cursor: 'nwse-resize',
          marginLeft: 8,
          position: 'absolute',
          right: -6,
          bottom: -6,
          zIndex: 21,
        }}
      />
    </div>
  );
}

const CanvasOverlays: React.FC<CanvasOverlaysProps> = ({
  is2D,
  results,
  customTexts,
  zoom,
  offset,
  onResultMove,
  onResultResize,
  onResultRemove,
  onTextMove,
  onTextResize,
  onTextEdit,
  onTextStartEdit,
  onTextAutoSize
}) => {
  if (!is2D) return null;

  return (
    <>
      {/* Render result labels as draggable overlays */}
      {results.map((label) => (
        <DraggableLabel
          key={label.id}
          label={label}
          onMove={(x, y) => onResultMove(label.id, x, y)}
          onResize={(width, height) => onResultResize(label.id, width, height)}
          onRemove={() => onResultRemove(label.id)}
          zoom={zoom}
          offset={offset}
        />
      ))}
      
      {/* Render custom text overlays */}
      {customTexts.map((label) => (
        (label.text.trim() !== '' || label.editing) && (
          <DraggableTextLabel
            key={label.id}
            label={label}
            onMove={(x, y) => onTextMove(label.id, x, y)}
            onResize={(width, height) => onTextResize(label.id, width, height)}
            onEdit={text => onTextEdit(label.id, text)}
            onStartEdit={() => onTextStartEdit(label.id)}
            onAutoSize={(width, height) => onTextAutoSize(label.id, width, height)}
            zoom={zoom}
            offset={offset}
          />
        )
      ))}
    </>
  );
};

export default CanvasOverlays;
