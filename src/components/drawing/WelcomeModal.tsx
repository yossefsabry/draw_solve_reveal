
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Draw & Solve!</DialogTitle>
          <DialogDescription>
            <div className="mb-2">Draw & Solve lets you sketch math problems, diagrams, or notes in 2D or 3D, and solve or export them instantly.</div>
            <ul className="list-disc pl-5 mb-2 text-left">
              <li>🖊️ Draw or erase with adjustable brush size and color</li>
              <li>🔍 Zoom and pan for precision</li>
              <li>📐 Grid and rulers for alignment</li>
              <li>🎯 Shape tools with 8 predefined shapes</li>
              <li>🌐 Toggle between 2D and 3D drawing modes</li>
              <li>⬅️ Undo/Redo and Clear All</li>
              <li>📤 Export your drawing as PDF</li>
              <li>🧮 Click "Solve" to send your drawing to the AI solver</li>
            </ul>
            <div className="text-xs text-muted-foreground">Tip: Use your mouse, touch, or stylus. Hold <b>Space</b> to pan. Use the sidebar for tools and options.</div>
          </DialogDescription>
        </DialogHeader>
        <button className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded" onClick={() => onOpenChange(false)}>
          Got it!
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
