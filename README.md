# Draw Solve Reveal

A 3D drawing and modeling application built with React, Three.js, and TypeScript.

## Features

- 3D drawing canvas with multiple drawing tools
- Shape creation and manipulation
- 3D model upload and viewing
- Real-time collaboration
- Modern UI with dark/light theme support

## 3D Model Upload

The application supports uploading 3D models in the following formats:

### Supported Formats
- **GLB** (recommended) - Self-contained binary format, best compatibility
- **GLTF** - May have external dependencies, use with caution
- **OBJ** - Simple geometry format

### Upload Guidelines
1. Use GLB files when possible for best compatibility
2. GLTF files may fail to load if they have external dependencies (like .bin files)
3. File size limit: 50MB maximum
4. Models will appear as wireframe placeholders if loading fails

### Troubleshooting
- If a model fails to load, try converting it to GLB format
- Ensure the model file is not corrupted
- Check that GLTF files include all necessary dependencies
- Large models may take time to load

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

## thanks man for inspiration
#### my man
[power ai calc](https://www.youtube.com/watch?v=1GbJQ7fHgqo&t=1264s) 

#### host
[drawslove](https://drawslove.netlify.app/) 

