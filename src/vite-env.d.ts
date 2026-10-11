/// <reference types="vite/client" />
/// <reference types="@motion-canvas/core/project" />

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}
