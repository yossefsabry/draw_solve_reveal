
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface MathJaxHub {
  Config: (config: any) => void;
  Queue: (commands: any[]) => void;
  Typeset: (element: any) => void;
}

interface MathJaxObject {
  Hub: MathJaxHub;
}

interface Window {
  MathJax?: MathJaxObject;
}
