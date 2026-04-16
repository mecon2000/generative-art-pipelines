import type { Pipeline } from '../_types';

const palettes: Record<string, { top: string; left: string; right: string }> = {
  blue: { top: '#6ea8c8', left: '#3d6478', right: '#4a7a94' },
  green: { top: '#7eb87e', left: '#4a6e4a', right: '#5a8a5a' },
  purple: { top: '#c86e9e', left: '#7a3d5e', right: '#9a5a7e' },
  orange: { top: '#e87e4a', left: '#8a4a2a', right: '#b46438' },
};

export const isometric: Pipeline = {
  id: 'isometric',
  name: 'Isometric Grid',
  theme: 'geometric',
  description: 'Isometric grid of cubes with wave-driven animated heights.',
  tags: ['3d', 'cubes', 'waves'],
  params: {
    gridSize:  { label: 'Grid Size',   type: 'range', default: 10, min: 5, max: 20, step: 1 },
    amplitude: { label: 'Amplitude',   type: 'range', default: 40, min: 10, max: 100, step: 5 },
    speed:     { label: 'Speed',       type: 'range', default: 2, min: 0.5, max: 5, step: 0.5 },
    palette:   { label: 'Palette',     type: 'select', default: 'blue', options: ['blue', 'green', 'purple', 'orange'] },
    waveType:  { label: 'Wave Type',   type: 'select', default: 'sine', options: ['sine', 'perlin', 'ripple'] },
  },
  setup(p, params) {
    return {};
  },
  draw(p, params, state: any, frame) {
    p.background(8, 8, 8);

    const grid = params.gridSize as number;
    const amp = params.amplitude as number;
    const speed = params.speed as number;
    const pal = palettes[params.palette as string] || palettes.blue;
    const waveType = params.waveType as string;

    const tileW = Math.min(p.width, p.height) / (grid + 2);
    const tileH = tileW * 0.5;

    p.translate(p.width / 2, p.height * 0.3);
    p.noStroke();

    const t = frame * 0.02 * speed;

    // Sort by row for proper overlap (back to front)
    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        const isoX = (col - row) * tileW * 0.5;
        const isoY = (col + row) * tileH * 0.5;

        let height: number;
        if (waveType === 'sine') {
          height = Math.sin(col * 0.5 + t) * Math.cos(row * 0.5 + t) * amp;
        } else if (waveType === 'perlin') {
          height = (p.noise(col * 0.2, row * 0.2, t * 0.5) - 0.5) * amp * 2;
        } else {
          const dist = Math.sqrt((col - grid / 2) ** 2 + (row - grid / 2) ** 2);
          height = Math.sin(dist * 0.8 - t * 2) * amp;
        }

        const h = Math.abs(height);
        const baseY = isoY - height;

        // Top face
        p.fill(pal.top);
        p.beginShape();
        p.vertex(isoX, baseY);
        p.vertex(isoX + tileW * 0.5, baseY - tileH * 0.5);
        p.vertex(isoX, baseY - tileH);
        p.vertex(isoX - tileW * 0.5, baseY - tileH * 0.5);
        p.endShape(p.CLOSE);

        // Left face
        p.fill(pal.left);
        p.beginShape();
        p.vertex(isoX - tileW * 0.5, baseY - tileH * 0.5);
        p.vertex(isoX, baseY);
        p.vertex(isoX, baseY + h * 0.3);
        p.vertex(isoX - tileW * 0.5, baseY + h * 0.3 - tileH * 0.5);
        p.endShape(p.CLOSE);

        // Right face
        p.fill(pal.right);
        p.beginShape();
        p.vertex(isoX + tileW * 0.5, baseY - tileH * 0.5);
        p.vertex(isoX, baseY);
        p.vertex(isoX, baseY + h * 0.3);
        p.vertex(isoX + tileW * 0.5, baseY + h * 0.3 - tileH * 0.5);
        p.endShape(p.CLOSE);
      }
    }
  },
};
