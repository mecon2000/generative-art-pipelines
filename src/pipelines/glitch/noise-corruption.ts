import type { Pipeline } from '../_types';

const charSets = '░▒▓█▄▀■□◆◇○●▲△▼▽★☆♠♣♥♦ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=~';

export const noiseCorruption: Pipeline = {
  id: 'noise-corruption',
  name: 'Noise Corruption',
  theme: 'glitch',
  description: 'Layered Perlin noise corrupting grids of characters, rectangles, or scanlines.',
  tags: ['noise', 'distortion', 'digital'],
  params: {
    mode:           { label: 'Mode',            type: 'select', default: 'characters', options: ['characters', 'rectangles', 'scanlines'] },
    noiseScale:     { label: 'Noise Scale',     type: 'range', default: 0.02, min: 0.005, max: 0.05, step: 0.005 },
    speed:          { label: 'Speed',           type: 'range', default: 1, min: 0.2, max: 3, step: 0.2 },
    density:        { label: 'Density',         type: 'range', default: 1, min: 0.3, max: 2, step: 0.1 },
    color:          { label: 'Color',           type: 'color', default: '#e87e4a' },
    glitchIntensity: { label: 'Glitch Intensity', type: 'range', default: 0.5, min: 0, max: 1, step: 0.1 },
  },
  setup(p, params) {
    p.background(8, 8, 8);
    p.textFont('DM Mono, monospace');
    return {};
  },
  draw(p, params, state: any, frame) {
    const mode = params.mode as string;
    const ns = params.noiseScale as number;
    const speed = params.speed as number;
    const density = params.density as number;
    const col = p.color(params.color as string);
    const glitch = params.glitchIntensity as number;
    const t = frame * 0.01 * speed;

    p.background(8, 8, 8);

    if (mode === 'characters') {
      const cellSize = Math.floor(14 / density);
      p.textSize(cellSize * 0.8);
      p.textAlign(p.CENTER, p.CENTER);
      p.noStroke();

      for (let y = 0; y < p.height; y += cellSize) {
        for (let x = 0; x < p.width; x += cellSize) {
          const n = p.noise(x * ns, y * ns, t);
          if (n < 0.3) continue;

          const glitchOffset = glitch > 0 && p.noise(x * ns * 3, t * 5) > (1 - glitch * 0.3)
            ? Math.floor(p.noise(x, t * 10) * 20 - 10)
            : 0;

          const brightness = p.map(n, 0.3, 1, 50, 255);
          p.fill(p.red(col), p.green(col), p.blue(col), brightness);

          const charIdx = Math.floor(n * charSets.length) % charSets.length;
          p.text(charSets[charIdx], x + cellSize / 2 + glitchOffset, y + cellSize / 2);
        }
      }
    } else if (mode === 'rectangles') {
      const cellSize = Math.floor(20 / density);
      p.noStroke();

      for (let y = 0; y < p.height; y += cellSize) {
        for (let x = 0; x < p.width; x += cellSize) {
          const n = p.noise(x * ns, y * ns, t);
          if (n < 0.25) continue;

          const glitchShift = glitch > 0 && p.noise(y * 0.1, t * 3) > (1 - glitch * 0.5)
            ? Math.floor(p.noise(y, t * 8) * cellSize * 3 - cellSize * 1.5)
            : 0;

          const size = p.map(n, 0.25, 1, cellSize * 0.2, cellSize * 0.9);
          const brightness = p.map(n, 0.25, 1, 30, 255);
          p.fill(p.red(col), p.green(col), p.blue(col), brightness);
          p.rect(x + (cellSize - size) / 2 + glitchShift, y + (cellSize - size) / 2, size, size);
        }
      }
    } else {
      // Scanlines mode
      const lineH = Math.max(2, Math.floor(4 / density));
      p.noStroke();

      for (let y = 0; y < p.height; y += lineH) {
        const rowNoise = p.noise(y * ns * 2, t);
        const tear = glitch > 0 && rowNoise > (1 - glitch * 0.3);
        const tearOffset = tear ? Math.floor((p.noise(y, t * 5) - 0.5) * p.width * 0.3) : 0;

        for (let x = 0; x < p.width; x += 2) {
          const n = p.noise(x * ns, y * ns, t);
          const brightness = p.map(n, 0, 1, 0, 200);

          if (tear) {
            p.fill(p.red(col), p.green(col), p.blue(col), brightness * 1.5);
          } else {
            p.fill(brightness * 0.3, brightness * 0.3, brightness * 0.3, 180);
          }

          p.rect(x + tearOffset, y, 2, lineH - 1);
        }

        // Occasional bright scanline flash
        if (tear && p.random() > 0.7) {
          p.fill(p.red(col), p.green(col), p.blue(col), 30);
          p.rect(tearOffset, y, p.width, lineH);
        }
      }
    }
  },
};
