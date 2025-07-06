
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedModel {
  id: string;
  name: string;
  url: string;
  format: 'gltf' | 'glb' | 'obj';
  position: [number, number, number];
  scale: number;
}

interface ModelUploaderProps {
  onModelUpload: (model: UploadedModel) => void;
}

const ModelUploader: React.FC<ModelUploaderProps> = ({ onModelUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file format
    const extension = file.name.split('.').pop()?.toLowerCase();
    let format: 'gltf' | 'glb' | 'obj';

    switch (extension) {
      case 'gltf':
        format = 'gltf';
        break;
      case 'glb':
        format = 'glb';
        break;
      case 'obj':
        format = 'obj';
        break;
      default:
        toast.error('Unsupported file format. Please use GLTF, GLB, or OBJ files.');
        return;
    }

    // Create object URL for the file
    const url = URL.createObjectURL(file);

    // Create model object
    const model: UploadedModel = {
      id: Date.now().toString(),
      name: file.name,
      url,
      format,
      position: [0, 2, 0], // Start slightly above the grid
      scale: 1
    };

    onModelUpload(model);
    toast.success(`${file.name} uploaded successfully!`);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
      >
        <Upload className="w-4 h-4" />
        Upload 3D Model
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".gltf,.glb,.obj"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};

export default ModelUploader;
