export const TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

export function transparentPngBuffer() {
  return Buffer.from(TRANSPARENT_PNG_BASE64, 'base64');
}



// // A tiny 1x1 transparent PNG, used only as a fallback when an image
// // variable's URL is missing or fails to fetch, so document generation
// // never crashes just because a photo didn't load.
// export const TRANSPARENT_PNG_BASE64 =
//   'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

// export function transparentPngBuffer() {
//   return Buffer.from(TRANSPARENT_PNG_BASE64, 'base64');
// }
