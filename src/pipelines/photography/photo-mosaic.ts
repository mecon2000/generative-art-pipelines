import type { Pipeline } from '../_types';
import { PHOTO_OPTIONS, photoUrlFor } from './_photos';

export const photoMosaic: Pipeline = {
  id: 'photo-mosaic',
  name: 'Photo Mosaic',
  theme: 'photography',
  description: 'Portrait rebuilt from shapes — circles, rectangles, or triangles scaled by pixel brightness.',
  tags: ['mosaic', 'portrait', 'shapes'],
  params: {
    photo:     { label: 'Photo',     type: 'select', default: 'portrait-01', options: PHOTO_OPTIONS },
    shape:     { label: 'Shape',     type: 'select', default: 'circle', options: ['circle', 'square', 'triangle', 'cross'] },
    cellSize:  { label: 'Cell Size', type: 'range', default: 14, min: 4, max: 40, step: 1 },
    sizeByLum: { label: 'Size by Brightness', type: 'boolean', default: true },
    pulse:     { label: 'Pulse',     type: 'range', default: 0.1, min: 0, max: 1, step: 0.05 },
    invert:    { label: 'Invert',    type: 'boolean', default: false },
  },
  setup(p, params) {
    const state: any = { img: null, loaded: false, currentPhoto: params.photo };
    (p as any).loadImage(photoUrlFor(params.photo as string), (img: any) => {
      state.img = img;
      img.loadPixels();
      state.loaded = true;
    });
    return state;
  },
  draw(p, params, state: any, frame) {
    p.background(8, 8, 8);

    if (!state.loaded || !state.img) {
      p.fill(102, 102, 96);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.text('loading...', p.width / 2, p.height / 2);
      return;
    }

    if (state.currentPhoto !== params.photo) {
      state.loaded = false;
      state.currentPhoto = params.photo;
      (p as any).loadImage(photoUrlFor(params.photo as string), (img: any) => {
        state.img = img;
        img.loadPixels();
        state.loaded = true;
      });
      return;
    }

    const cellSize = params.cellSize as number;
    const shape = params.shape as string;
    const sizeByLum = params.sizeByLum as boolean;
    const pulse = params.pulse as number;
    const invert = params.invert as boolean;

    const img = state.img;
    const scale = Math.min(p.width / img.width, p.height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const offsetX = (p.width - drawW) / 2;
    const offsetY = (p.height - drawH) / 2;

    const t = frame * 0.02;
    p.noStroke();

    for (let y = 0; y < drawH; y += cellSize) {
      for (let x = 0; x < drawW; x += cellSize) {
        // Sample img pixel
        const sx = Math.floor((x / drawW) * img.width);
        const sy = Math.floor((y / drawH) * img.height);
        const pi = (sy * img.width + sx) * 4;
        const r = img.pixels[pi];
        const g = img.pixels[pi + 1];
        const b = img.pixels[pi + 2];
        const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const effLum = invert ? 1 - lum : lum;

        let size = cellSize * 0.9;
        if (sizeByLum) size *= 0.3 + effLum * 0.9;
        size *= 1 + Math.sin(t + x * 0.01 + y * 0.01) * pulse;

        p.fill(r, g, b);

        const cx = offsetX + x + cellSize / 2;
        const cy = offsetY + y + cellSize / 2;

        if (shape === 'circle') {
          p.circle(cx, cy, size);
        } else if (shape === 'square') {
          p.rectMode(p.CENTER);
          p.rect(cx, cy, size, size);
        } else if (shape === 'triangle') {
          const h = size * 0.866;
          p.triangle(cx - size / 2, cy + h / 2, cx + size / 2, cy + h / 2, cx, cy - h / 2);
        } else {
          // cross
          p.rectMode(p.CENTER);
          p.rect(cx, cy, size, size * 0.25);
          p.rect(cx, cy, size * 0.25, size);
        }
      }
    }
  },
};
