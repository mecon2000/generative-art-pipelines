import type { Pipeline } from '../_types';

const palettes: Record<string, string[]> = {
  ocean: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
  pastel: ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'],
  neon: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
  mono: ['#f8f9fa', '#dee2e6', '#adb5bd', '#6c757d', '#343a40'],
};

interface Seed {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export const voronoi: Pipeline = {
  id: 'voronoi',
  name: 'Voronoi',
  theme: 'geometric',
  description: 'Animated Voronoi diagram with Perlin noise-driven seed points.',
  tags: ['tessellation', 'cells', 'noise'],
  params: {
    seedCount:    { label: 'Seeds',         type: 'range', default: 30, min: 5, max: 80, step: 5 },
    speed:        { label: 'Speed',         type: 'range', default: 1, min: 0.1, max: 3, step: 0.1 },
    showSeeds:    { label: 'Show Seeds',    type: 'boolean', default: true },
    palette:      { label: 'Palette',       type: 'select', default: 'ocean', options: ['ocean', 'pastel', 'neon', 'mono'] },
    strokeWeight: { label: 'Border Width',  type: 'range', default: 1, min: 0, max: 4, step: 0.5 },
  },
  setup(p, params) {
    const count = params.seedCount as number;
    const pal = palettes[params.palette as string] || palettes.ocean;
    const seeds: Seed[] = Array.from({ length: count }, (_, i) => ({
      x: p.random(p.width),
      y: p.random(p.height),
      vx: p.random(1000),
      vy: p.random(1000),
      color: pal[i % pal.length],
    }));
    return { seeds };
  },
  draw(p, params, state: any, frame) {
    const speed = params.speed as number;
    const showSeeds = params.showSeeds as boolean;
    const sw = params.strokeWeight as number;
    const pal = palettes[params.palette as string] || palettes.ocean;
    const seeds: Seed[] = state.seeds;

    // Move seeds with Perlin noise
    const t = frame * 0.005 * speed;
    for (let i = 0; i < seeds.length; i++) {
      seeds[i].x = p.noise(seeds[i].vx + t, 0) * p.width;
      seeds[i].y = p.noise(0, seeds[i].vy + t) * p.height;
      seeds[i].color = pal[i % pal.length];
    }

    // Render using pixel method for performance
    const step = 4; // Render every 4th pixel for speed
    p.loadPixels();
    const d = p.pixelDensity();
    const fullW = p.width * d;

    for (let py = 0; py < p.height; py += step) {
      for (let px = 0; px < p.width; px += step) {
        let minDist = Infinity;
        let secondDist = Infinity;
        let closestIdx = 0;

        for (let i = 0; i < seeds.length; i++) {
          const dx = px - seeds[i].x;
          const dy = py - seeds[i].y;
          const dist = dx * dx + dy * dy;
          if (dist < minDist) {
            secondDist = minDist;
            minDist = dist;
            closestIdx = i;
          } else if (dist < secondDist) {
            secondDist = dist;
          }
        }

        const c = p.color(seeds[closestIdx].color);
        const edgeDist = Math.sqrt(secondDist) - Math.sqrt(minDist);
        const isEdge = sw > 0 && edgeDist < sw * 2;

        let r: number, g: number, b: number;
        if (isEdge) {
          r = 42; g = 42; b = 42;
        } else {
          const brightness = p.map(Math.sqrt(minDist), 0, 200, 1, 0.6);
          r = p.red(c) * brightness;
          g = p.green(c) * brightness;
          b = p.blue(c) * brightness;
        }

        // Fill step x step block
        for (let dy = 0; dy < step && py + dy < p.height; dy++) {
          for (let dx = 0; dx < step && px + dx < p.width; dx++) {
            const pi = ((py + dy) * fullW + (px + dx)) * 4;
            p.pixels[pi] = r;
            p.pixels[pi + 1] = g;
            p.pixels[pi + 2] = b;
            p.pixels[pi + 3] = 255;
          }
        }
      }
    }
    p.updatePixels();

    // Draw seed points
    if (showSeeds) {
      p.noStroke();
      p.fill(232, 230, 224);
      for (const seed of seeds) {
        p.circle(seed.x, seed.y, 4);
      }
    }
  },
};
