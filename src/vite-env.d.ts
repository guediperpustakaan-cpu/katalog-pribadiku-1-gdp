/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL backend API (Express + Neon), mis. http://localhost:3001/api */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
