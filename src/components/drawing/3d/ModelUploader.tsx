import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { validateModelFile, getModelInfo, getRecommendedFormat, formatFileSize } from '@/lib/model-utils';

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the file
    const validation = validateModelFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    try {
      // Get model information
      const modelInfo = getModelInfo(file);
      
      // Show format recommendation for GLTF files
      if (modelInfo.format === 'gltf') {
        const recommendation = getRecommendedFormat(modelInfo.format);
        toast.info(`GLTF file detected. For best compatibility, consider using ${recommendation}.`);
      }

      // Create object URL for the file
      const url = URL.createObjectURL(file);

      // Create model object
      const model: UploadedModel = {
        id: Date.now().toString(),
        name: file.name,
        url,
        format: modelInfo.format,
        position: [0, 2, 0], // Start slightly above the grid
        scale: 1
      };

      onModelUpload(model);
      toast.success(`${file.name} (${formatFileSize(file.size)}) uploaded successfully!`);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading model:', error);
      toast.error('Failed to upload model. Please try again.');
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
