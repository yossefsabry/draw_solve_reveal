/**
 * Utility functions for 3D model handling
 */

export interface ModelInfo {
  name: string;
  format: 'gltf' | 'glb' | 'obj';
  size: number;
  hasExternalDependencies?: boolean;
}

/**
 * Get information about a 3D model file
 */
export function getModelInfo(file: File): ModelInfo {
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
      throw new Error('Unsupported file format');
  }

  return {
    name: file.name,
    format,
    size: file.size,
    hasExternalDependencies: format === 'gltf'
  };
}

/**
 * Validate a 3D model file
 */
export function validateModelFile(file: File): { valid: boolean; error?: string } {
  try {
    const info = getModelInfo(file);
    
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Please use files smaller than 50MB.'
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid file format'
    };
  }
}

/**
 * Get recommended format for better compatibility
 */
export function getRecommendedFormat(currentFormat: 'gltf' | 'glb' | 'obj'): string {
  switch (currentFormat) {
    case 'gltf':
      return 'GLB (self-contained, no external dependencies)';
    case 'glb':
      return 'GLB (already optimal)';
    case 'obj':
      return 'GLB (better compatibility and features)';
    default:
      return 'GLB';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 