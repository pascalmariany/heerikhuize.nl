/// <reference types="vite/client" />

// Vite kent standaard alleen kleine letters (*.jpg); assets met
// hoofdletter-extensies (iPhone/camera-exports) ook declareren.
declare module "*.JPG" {
  const src: string;
  export default src;
}
declare module "*.JPEG" {
  const src: string;
  export default src;
}
declare module "*.PNG" {
  const src: string;
  export default src;
}
