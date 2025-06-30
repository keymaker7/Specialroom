/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEETS_API_URL: string;
  readonly VITE_GOOGLE_SCRIPT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 