import type { Pipeline } from '../_types';

const palettes: Record<string, [number, number, number][]> = {
  heat: [[200, 50, 20], [220, 100, 30], [240, 160, 40], [255, 220, 100], [255, 255, 200]],
  cyber: [[20, 0, 40], [60, 0, 120], [120, 0, 220], [200, 40, 255], [255, 120, 255]],
  ocean: [[0, 20, 40], [0, 60, 100], [0, 120, 180], [60, 180, 220], [180, 230, 255]],
  acid: [[10, 30, 0], [30, 80, 0], [80, 180, 0], [160, 240, 40], [220, 255, 120]],
};

export const pixelsort: Pipeline = {
  id: 'pixelsort',
  name: 'Pixel Sort',
  theme: 'glitch',
  description: 'Pixel sorting algorithm on Perlin noise imagery, animated row by row.',
  tags: ['sorting', 'glitch', 'algorithmic'],
  params: {
    threshold:  { label: 'Threshold',   type: 'range', default: 0.4, min: 0.1, max: 0.9, step: 0.05 },
    direction:  { label: 'Direction',   type: 'select', default: 'horizontal', options: ['horizontal', 'vertical', 'diagonal'] },
    speed:      { label: 'Rows/Frame',  type: 'range', default: 5, min: 1, max: 30, step: 1 },
    noiseScale: { label: 'Noise Scale', type: 'range', default: 0.01, min: 0.002, max: 0.03, step: 0.002 },
    palette:    { label: 'Palette',     type: 'select', default: 'heat', options: ['heat', 'cyber', 'ocean', 'acid'] },
  },
  setup(p, params) {
    p.pixelDensity(1);
    const ns = params.noiseScale as number;
    const pal = palettes[params.palette as string] || palettes.heat;

    // Generate source image from noise
    p.loadPixels();
    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        const n = p.noise(x * ns, y * ns, 0.5);
        const ci = Math.floor(n * (pal.length - 1));
        const t = n * (pal.length - 1) - ci;
        const c1 = pal[Math.min(ci, pal.length - 1)];
        const c2 = pal[Math.min(ci + 1, pal.length - 1)];
        const pi = (y * p.width + x) * 4;
        p.pixels[pi] = c1[0] + (c2[0] - c1[0]) * t;
        p.pixels[pi + 1] = c1[1] + (c2[1] - c1[1]) * t;
        p.pixels[pi + 2] = c1[2] + (c2[2] - c1[2]) * t;
        p.pixels[pi + 3] = 255;
      }
    }
    p.updatePixels();

    return { sortRow: 0, sorting: true };
  },
  draw(p, params, state: any, frame) {
    if (!state.sorting) {
      // Regenerate periodically
      if (frame % 300 === 0) {
        const ns = params.noiseScale as number;
        const pal = palettes[params.palette as string] || palettes.heat;
        const zOff = frame * 0.01;
        p.loadPixels();
        for (let y = 0; y < p.height; y++) {
          for (let x = 0; x < p.width; x++) {
            const n = p.noise(x * ns, y * ns, zOff);
            const ci = Math.floor(n * (pal.length - 1));
            const t = n * (pal.length - 1) - ci;
            const c1 = pal[Math.min(ci, pal.length - 1)];
            const c2 = pal[Math.min(ci + 1, pal.length - 1)];
            const pi = (y * p.width + x) * 4;
            p.pixels[pi] = c1[0] + (c2[0] - c1[0]) * t;
            p.pixels[pi + 1] = c1[1] + (c2[1] - c1[1]) * t;
            p.pixels[pi + 2] = c1[2] + (c2[2] - c1[2]) * t;
            p.pixels[pi + 3] = 255;
          }
        }
        p.updatePixels();
        state.sortRow = 0;
        state.sorting = true;
      }
      return;
    }

    const threshold = params.threshold as number;
    const speed = params.speed as number;
    const direction = params.direction as string;
    const maxDim = direction === 'vertical' ? p.width : p.height;

    p.loadPixels();

    for (let s = 0; s < speed && state.sortRow < maxDim; s++, state.sortRow++) {
      const row = state.sortRow;

      if (direction === 'horizontal' || direction === 'diagonal') {
        // Sort a horizontal row
        const y = direction === 'diagonal' ? row : row;
        if (y >= p.height) continue;

        const rowPixels: { r: number; g: number; b: number; lum: number }[] = [];
        for (let x = 0; x < p.width; x++) {
          const px = direction === 'diagonal' ? (x + row) % p.width : x;
          const pi = (y * p.width + px) * 4;
          const r = p.pixels[pi], g = p.pixels[pi + 1], b = p.pixels[pi + 2];
          rowPixels.push({ r, g, b, lum: (r * 0.299 + g * 0.587 + b * 0.114) / 255 });
        }

        // Find spans above threshold and sort them
        let spanStart = -1;
        for (let x = 0; x <= p.width; x++) {
          const above = x < p.width && rowPixels[x].lum > threshold;
          if (above && spanStart === -1) {
            spanStart = x;
          } else if (!above && spanStart !== -1) {
            const span = rowPixels.slice(spanStart, x);
            span.sort((a, b) => a.lum - b.lum);
            for (let i = 0; i < span.length; i++) {
              rowPixels[spanStart + i] = span[i];
            }
            spanStart = -1;
          }
        }

        // Write back
        for (let x = 0; x < p.width; x++) {
          const px = direction === 'diagonal' ? (x + row) % p.width : x;
          const pi = (y * p.width + px) * 4;
          p.pixels[pi] = rowPixels[x].r;
          p.pixels[pi + 1] = rowPixels[x].g;
          p.pixels[pi + 2] = rowPixels[x].b;
        }
      } else {
        // Vertical sort
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
          const above = y < p.height && colPixels[y].lum > threshold;
          if (above && spanStart === -1) {
            spanStart = y;
          } else if (!above && spanStart !== -1) {
            const span = colPixels.slice(spanStart, y);
            span.sort((a, b) => a.lum - b.lum);
            for (let i = 0; i < span.length; i++) {
              colPixels[spanStart + i] = span[i];
            }
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
    }
  },
};
