import type { Pipeline } from '../_types';
import { PHOTO_OPTIONS, photoUrlFor } from './_photos';

export const photoSort: Pipeline = {
  id: 'photo-sort',
  name: 'Photo Sort',
  theme: 'photography',
  description: 'Pixel sorting run against a portrait, grouping pixels by brightness into luminous streaks.',
  tags: ['sorting', 'portrait', 'glitch'],
  params: {
    photo:      { label: 'Photo',       type: 'select', default: 'portrait-01', options: PHOTO_OPTIONS },
    threshold:  { label: 'Threshold',   type: 'range', default: 0.35, min: 0.05, max: 0.95, step: 0.05 },
    direction:  { label: 'Direction',   type: 'select', default: 'horizontal', options: ['horizontal', 'vertical'] },
    invert:     { label: 'Invert Mask', type: 'boolean', default: false },
    speed:      { label: 'Rows/Frame',  type: 'range', default: 8, min: 1, max: 40, step: 1 },
  },
  setup(p, params) {
    p.background(8, 8, 8);
    const state: any = { img: null, loaded: false, sortRow: 0, sorting: false, currentPhoto: params.photo };
    (p as any).loadImage(photoUrlFor(params.photo as string), (img: any) => {
      state.img = img;
      state.loaded = true;
    });
    return state;
  },
  draw(p, params, state: any, frame) {
    if (!state.loaded || !state.img) {
      p.background(8, 8, 8);
      p.fill(102, 102, 96);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.text('loading...', p.width / 2, p.height / 2);
      return;
    }

    // Check if photo changed
    if (state.currentPhoto !== params.photo) {
      state.loaded = false;
      state.sorting = false;
      state.sortRow = 0;
      state.currentPhoto = params.photo;
      (p as any).loadImage(photoUrlFor(params.photo as string), (img: any) => {
        state.img = img;
        state.loaded = true;
      });
      return;
    }

    // Start sort cycle
    if (!state.sorting && state.sortRow === 0) {
      // Paint photo scaled to canvas
      const scale = Math.min(p.width / state.img.width, p.height / state.img.height);
      const w = state.img.width * scale;
      const h = state.img.height * scale;
      p.background(8, 8, 8);
      p.image(state.img, (p.width - w) / 2, (p.height - h) / 2, w, h);
      state.sorting = true;
    }

    if (!state.sorting) {
      // Restart periodically
      if (frame % 400 === 0) {
        state.sortRow = 0;
      }
      return;
    }

    const threshold = params.threshold as number;
    const direction = params.direction as string;
    const invert = params.invert as boolean;
    const speed = params.speed as number;
    const maxDim = direction === 'vertical' ? p.width : p.height;

    p.loadPixels();

    for (let s = 0; s < speed && state.sortRow < maxDim; s++, state.sortRow++) {
      const row = state.sortRow;

      if (direction === 'horizontal') {
        const y = row;
        if (y >= p.height) continue;

        const rowPixels: { r: number; g: number; b: number; lum: number }[] = [];
        for (let x = 0; x < p.width; x++) {
          const pi = (y * p.width + x) * 4;
          const r = p.pixels[pi], g = p.pixels[pi + 1], b = p.pixels[pi + 2];
          rowPixels.push({ r, g, b, lum: (r * 0.299 + g * 0.587 + b * 0.114) / 255 });
        }

        let spanStart = -1;
        for (let x = 0; x <= p.width; x++) {
          const above = x < p.width && (invert ? rowPixels[x].lum < threshold : rowPixels[x].lum > threshold);
          if (above && spanStart === -1) {
            spanStart = x;
          } else if (!above && spanStart !== -1) {
            const span = rowPixels.slice(spanStart, x);
            span.sort((a, b) => a.lum - b.lum);
            for (let i = 0; i < span.length; i++) rowPixels[spanStart + i] = span[i];
            spanStart = -1;
          }
        }

        for (let x = 0; x < p.width; x++) {
          const pi = (y * p.width + x) * 4;
          p.pixels[pi] = rowPixels[x].r;
          p.pixels[pi + 1] = rowPixels[x].g;
          p.pixels[pi + 2] = rowPixels[x].b;
        }
      } else {
        const x = row;
        if (x >= p.width) continue;

        const colPixels: { r: number; g: number; b: number; lum: number }[] = [];
        for (let y = 0; y < p.height; y++) {
          const pi = (y * p.width + x) * 4;
          const r = p.pixels[pi], g = p.pixels[pi + 1], b = p.pixels[pi + 2];
          colPixels.push({ r, g, b, lum: (r * 0.299 + g * 0.587 + b * 0.114) / 255 });
        }

        let spanStart = -1;
        for (let y = 0; y <= p.height; y++) {
          const above = y < p.height && (invert ? colPixels[y].lum < threshold : colPixels[y].lum > threshold);
          if (above && spanStart === -1) {
            spanStart = y;
          } else if (!above && spanStart !== -1) {
            const span = colPixels.slice(spanStart, y);
            span.sort((a, b) => a.lum - b.lum);
            for (let i = 0; i < span.length; i++) colPixels[spanStart + i] = span[i];
            spanStart = -1;
          }
        }

        for (let y = 0; y < p.height; y++) {
          const pi = (y * p.width + x) * 4;
          p.pixels[pi] = colPixels[y].r;
          p.pixels[pi + 1] = colPixels[y].g;
          p.pixels[pi + 2] = colPixels[y].b;
        }
      }
    }

    p.updatePixels();

    if (state.sortRow >= maxDim) {
      state.sorting = false;
      state.sortRow = 0;
    }
  },
};
