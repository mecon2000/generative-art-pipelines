import type { Pipeline } from '../_types';

export const aurora: Pipeline = {
  id: 'aurora',
  name: 'Aurora',
  theme: 'cosmic',
  description: 'Aurora borealis simulation using layered sine waves and Perlin noise displacement.',
  tags: ['atmosphere', 'waves', 'color'],
  params: {
    layers:        { label: 'Layers',        type: 'range', default: 5, min: 2, max: 10, step: 1 },
    speed:         { label: 'Speed',         type: 'range', default: 1, min: 0.2, max: 3, step: 0.1 },
    hueShift:      { label: 'Hue Shift',     type: 'range', default: 0, min: 0, max: 360, step: 10 },
    opacity:       { label: 'Opacity',       type: 'range', default: 40, min: 10, max: 80, step: 5 },
    waveAmplitude: { label: 'Wave Amplitude', type: 'range', default: 80, min: 20, max: 200, step: 10 },
    noiseScale:    { label: 'Noise Scale',   type: 'range', default: 0.003, min: 0.001, max: 0.01, step: 0.001 },
  },
  setup(p, params) {
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(0, 0, 3);
    return {};
  },
  draw(p, params, state: any, frame) {
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.background(0, 0, 3, 15);

    const layers = params.layers as number;
    const speed = params.speed as number;
    const hueShift = params.hueShift as number;
    const opacity = params.opacity as number;
    const amp = params.waveAmplitude as number;
    const ns = params.noiseScale as number;

    const t = frame * 0.01 * speed;
    p.noStroke();

    for (let l = 0; l < layers; l++) {
      const layerRatio = l / layers;
      const baseY = p.height * 0.25 + layerRatio * p.height * 0.4;
      const baseHue = (120 + l * 40 + hueShift + Math.sin(t * 0.3) * 30) % 360;

      p.beginShape();

      // Top edge (the aurora band)
      for (let x = 0; x <= p.width; x += 3) {
        const noiseVal = p.noise(x * ns, l * 10, t + l * 0.5);
        const waveY = Math.sin(x * 0.01 + t + l * 1.5) * amp * 0.5;
        const noiseY = (noiseVal - 0.5) * amp;
        const y = baseY + waveY + noiseY;

        const hue = (baseHue + noiseVal * 60) % 360;
        const sat = 60 + noiseVal * 30;
        const bri = 40 + noiseVal * 50;
        p.fill(hue, sat, bri, opacity * (0.3 + noiseVal * 0.7) * (1 - layerRatio * 0.3));
        p.rect(x, y, 4, p.height * 0.15 * (1 + noiseVal));
      }

      p.endShape();
    }

    // Faint stars in the background
    if (frame % 3 === 0) {
      p.noStroke();
      for (let i = 0; i < 3; i++) {
        const sx = p.random(p.width);
        const sy = p.random(p.height * 0.5);
        const starBri = p.random(20, 60);
        p.fill(0, 0, starBri, 30);
        p.circle(sx, sy, p.random(1, 2));
      }
    }
  },
};
