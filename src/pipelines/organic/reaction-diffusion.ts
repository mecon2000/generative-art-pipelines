import type { Pipeline } from '../_types';

const colorPalettes: Record<string, [number, number, number][]> = {
  blues: [[8, 8, 8], [20, 60, 120], [40, 120, 200], [200, 230, 255]],
  fire: [[8, 8, 8], [120, 20, 0], [220, 80, 0], [255, 220, 100]],
  acid: [[8, 8, 8], [0, 80, 20], [0, 200, 60], [180, 255, 100]],
  purple: [[8, 8, 8], [60, 0, 80], [140, 40, 180], [220, 160, 255]],
};

export const reactionDiffusion: Pipeline = {
  id: 'reaction-diffusion',
  name: 'Reaction-Diffusion',
  theme: 'organic',
  description: 'Gray-Scott reaction-diffusion model producing organic coral-like patterns.',
  tags: ['simulation', 'cellular', 'chemical'],
  params: {
    feed:    { label: 'Feed Rate',    type: 'range', default: 0.055, min: 0.01, max: 0.08, step: 0.001 },
    kill:    { label: 'Kill Rate',    type: 'range', default: 0.062, min: 0.04, max: 0.07, step: 0.001 },
    diffuseA: { label: 'Diffuse A',   type: 'range', default: 1.0, min: 0.5, max: 1.5, step: 0.1 },
    diffuseB: { label: 'Diffuse B',   type: 'range', default: 0.5, min: 0.1, max: 1.0, step: 0.05 },
    speed:   { label: 'Steps/Frame',  type: 'range', default: 5, min: 1, max: 20, step: 1 },
    palette: { label: 'Palette',      type: 'select', default: 'blues', options: ['blues', 'fire', 'acid', 'purple'] },
  },
  setup(p, params) {
    const w = Math.floor(p.width / 2);
    const h = Math.floor(p.height / 2);
    const gridA = new Float32Array(w * h).fill(1);
    const gridB = new Float32Array(w * h).fill(0);
    const nextA = new Float32Array(w * h);
    const nextB = new Float32Array(w * h);

    // Seed center region
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    const radius = 10;
    for (let y = cy - radius; y < cy + radius; y++) {
      for (let x = cx - radius; x < cx + radius; x++) {
        if (x >= 0 && x < w && y >= 0 && y < h) {
          const idx = y * w + x;
          gridB[idx] = 1;
        }
      }
    }

    // Additional random seeds
    for (let i = 0; i < 5; i++) {
      const sx = Math.floor(Math.random() * w);
      const sy = Math.floor(Math.random() * h);
      for (let dy = -5; dy < 5; dy++) {
        for (let dx = -5; dx < 5; dx++) {
          const x = sx + dx;
          const y = sy + dy;
          if (x >= 0 && x < w && y >= 0 && y < h) {
            gridB[y * w + x] = 1;
          }
        }
      }
    }

    p.pixelDensity(1);
    return { gridA, gridB, nextA, nextB, w, h };
  },
  draw(p, params, state: any, frame) {
    const { gridA, gridB, nextA, nextB, w, h } = state;
    const feed = params.feed as number;
    const kill = params.kill as number;
    const dA = params.diffuseA as number;
    const dB = params.diffuseB as number;
    const steps = params.speed as number;
    const pal = colorPalettes[params.palette as string] || colorPalettes.blues;

    for (let s = 0; s < steps; s++) {
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          const a = gridA[idx];
          const b = gridB[idx];

          const laplacianA =
            gridA[idx - 1] + gridA[idx + 1] +
            gridA[idx - w] + gridA[idx + w] -
            4 * a;

          const laplacianB =
            gridB[idx - 1] + gridB[idx + 1] +
            gridB[idx - w] + gridB[idx + w] -
            4 * b;

          const abb = a * b * b;
          nextA[idx] = a + (dA * laplacianA - abb + feed * (1 - a)) * 0.9;
          nextB[idx] = b + (dB * laplacianB + abb - (kill + feed) * b) * 0.9;

          nextA[idx] = Math.max(0, Math.min(1, nextA[idx]));
          nextB[idx] = Math.max(0, Math.min(1, nextB[idx]));
        }
      }

      // Swap
      for (let i = 0; i < w * h; i++) {
        gridA[i] = nextA[i];
        gridB[i] = nextB[i];
      }
    }

    // Render at half resolution
    p.loadPixels();
    const d = p.pixelDensity();
    const fullW = p.width * d;

    for (let y = 0; y < h && y * 2 < p.height; y++) {
      for (let x = 0; x < w && x * 2 < p.width; x++) {
        const val = gridA[y * w + x] - gridB[y * w + x];
        const t = Math.max(0, Math.min(1, (val + 1) / 2));

        let r: number, g: number, b: number;
        if (t < 0.33) {
          const lt = t / 0.33;
          r = pal[0][0] + (pal[1][0] - pal[0][0]) * lt;
          g = pal[0][1] + (pal[1][1] - pal[0][1]) * lt;
          b = pal[0][2] + (pal[1][2] - pal[0][2]) * lt;
        } else if (t < 0.66) {
          const lt = (t - 0.33) / 0.33;
          r = pal[1][0] + (pal[2][0] - pal[1][0]) * lt;
          g = pal[1][1] + (pal[2][1] - pal[1][1]) * lt;
          b = pal[1][2] + (pal[2][2] - pal[1][2]) * lt;
        } else {
          const lt = (t - 0.66) / 0.34;
          r = pal[2][0] + (pal[3][0] - pal[2][0]) * lt;
          g = pal[2][1] + (pal[3][1] - pal[2][1]) * lt;
          b = pal[2][2] + (pal[3][2] - pal[2][2]) * lt;
        }

        // Paint 2x2 block
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const px = x * 2 + dx;
            const py = y * 2 + dy;
            if (px < p.width && py < p.height) {
              const pi = (py * fullW + px) * 4;
              p.pixels[pi] = r;
              p.pixels[pi + 1] = g;
              p.pixels[pi + 2] = b;
              p.pixels[pi + 3] = 255;
            }
          }
        }
      }
    }
    p.updatePixels();
  },
};
