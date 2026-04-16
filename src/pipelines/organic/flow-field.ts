import type { Pipeline } from '../_types';

const palettes: Record<string, string[]> = {
  monochrome: ['#e8e6e0', '#b0aea8', '#808078', '#505048'],
  warm: ['#ff6b35', '#f7c59f', '#efefd0', '#d4a373'],
  cool: ['#264653', '#2a9d8f', '#e9c46a', '#e76f51'],
  neon: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
};

interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  speed: number;
  color: string;
  life: number;
}

export const flowField: Pipeline = {
  id: 'flow-field',
  name: 'Flow Field',
  theme: 'organic',
  description: 'Perlin noise vector field driving hundreds of particles into silk-like ribbons.',
  tags: ['noise', 'particles', 'continuous'],
  params: {
    scale:         { label: 'Noise Scale',    type: 'range', default: 0.003, min: 0.001, max: 0.01, step: 0.001 },
    speed:         { label: 'Speed',          type: 'range', default: 2, min: 0.5, max: 6, step: 0.5 },
    particleCount: { label: 'Particles',      type: 'range', default: 600, min: 100, max: 2000, step: 100 },
    trailLength:   { label: 'Trail Opacity',  type: 'range', default: 8, min: 1, max: 30, step: 1 },
    palette:       { label: 'Palette',        type: 'select', default: 'warm', options: ['monochrome', 'warm', 'cool', 'neon'] },
    fadeRate:       { label: 'Fade Rate',     type: 'range', default: 10, min: 2, max: 40, step: 2 },
  },
  setup(p, params) {
    p.background(8, 8, 8);
    const count = params.particleCount as number;
    const pal = palettes[params.palette as string] || palettes.warm;
    const particles: Particle[] = Array.from({ length: count }, () => {
      const x = p.random(p.width);
      const y = p.random(p.height);
      return {
        x, y, prevX: x, prevY: y,
        speed: p.random(0.5, 1.5),
        color: pal[Math.floor(p.random(pal.length))],
        life: Math.floor(p.random(100, 400)),
      };
    });
    return { particles, zOff: 0 };
  },
  draw(p, params, state: any, frame) {
    const scale = params.scale as number;
    const speed = params.speed as number;
    const fadeRate = params.fadeRate as number;
    const pal = palettes[params.palette as string] || palettes.warm;

    p.noFill();
    p.background(8, 8, 8, fadeRate);

    for (const particle of state.particles) {
      const angle = p.noise(particle.x * scale, particle.y * scale, state.zOff) * p.TWO_PI * 2;
      const vx = Math.cos(angle) * speed * particle.speed;
      const vy = Math.sin(angle) * speed * particle.speed;

      particle.prevX = particle.x;
      particle.prevY = particle.y;
      particle.x += vx;
      particle.y += vy;
      particle.life--;

      if (particle.x < 0 || particle.x > p.width || particle.y < 0 || particle.y > p.height || particle.life <= 0) {
        particle.x = p.random(p.width);
        particle.y = p.random(p.height);
        particle.prevX = particle.x;
        particle.prevY = particle.y;
        particle.life = Math.floor(p.random(100, 400));
        particle.color = pal[Math.floor(p.random(pal.length))];
      }

      const c = p.color(particle.color);
      p.stroke(p.red(c), p.green(c), p.blue(c), params.trailLength as number * 10);
      p.strokeWeight(0.8);
      p.line(particle.prevX, particle.prevY, particle.x, particle.y);
    }

    state.zOff += 0.0003;
  },
};
