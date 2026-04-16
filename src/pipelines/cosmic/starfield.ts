import type { Pipeline } from '../_types';

export const starfield: Pipeline = {
  id: 'starfield',
  name: 'Star Field',
  theme: 'cosmic',
  description: 'Infinite parallax star field with depth-based motion.',
  tags: ['particles', 'space', 'infinite'],
  params: {
    count:   { label: 'Star Count', type: 'range', default: 400, min: 50, max: 1200, step: 50 },
    speed:   { label: 'Speed',      type: 'range', default: 1.5, min: 0.1, max: 5, step: 0.1 },
    color:   { label: 'Star Color', type: 'color', default: '#e8e6e0' },
    twinkle: { label: 'Twinkle',    type: 'boolean', default: true },
  },
  setup(p, params) {
    const stars = Array.from({ length: params.count as number }, () => ({
      x: p.random(-p.width, p.width),
      y: p.random(-p.height, p.height),
      z: p.random(p.width),
      pz: 0,
    }));
    return { stars };
  },
  draw(p, params, state: any, frame) {
    p.background(8, 8, 8, 25);
    p.translate(p.width / 2, p.height / 2);
    const speed = params.speed as number;
    const twinkle = params.twinkle as boolean;

    for (const star of state.stars) {
      star.pz = star.z;
      star.z -= speed;
      if (star.z <= 0) {
        star.x = p.random(-p.width, p.width);
        star.y = p.random(-p.height, p.height);
        star.z = p.width;
        star.pz = star.z;
      }
      const sx = p.map(star.x / star.z, 0, 1, 0, p.width);
      const sy = p.map(star.y / star.z, 0, 1, 0, p.height);
      const px = p.map(star.x / star.pz, 0, 1, 0, p.width);
      const py = p.map(star.y / star.pz, 0, 1, 0, p.height);
      const size = p.map(star.z, 0, p.width, 3, 0);
      const alpha = twinkle ? p.map(p.sin(frame * 0.05 + star.x), -1, 1, 120, 255) : 255;
      const c = p.color(params.color as string);
      p.stroke(p.red(c), p.green(c), p.blue(c), alpha);
      p.strokeWeight(size);
      p.line(px, py, sx, sy);
    }
  },
};
