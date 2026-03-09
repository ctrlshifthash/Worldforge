/**
 * Creates an offscreen canvas with the source image drawn with a hue rotation.
 * Used to give players custom color variants of the GuttyKreum tilemap.
 */
export function createHueShiftedCanvas(
  source: HTMLImageElement | HTMLCanvasElement,
  hueShift: number
): HTMLCanvasElement {
  const w = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const h = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  if (hueShift !== 0) {
    ctx.filter = `hue-rotate(${hueShift}deg)`;
  }
  ctx.drawImage(source, 0, 0);
  return canvas;
}
