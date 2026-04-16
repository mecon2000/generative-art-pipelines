import type { Pipeline } from '../_types';

function clifford(x: number, y: number, a: number, b: number, c: number, d: number): [number, number] {
  return [
    Math.sin(a * y) + c * Math.cos(a * x),
    Math.sin(b * x) + d * Math.cos(b * y),
  ];
}

function dejong(x: number, y: number, a: number, b: number, c: number, d: number): [number, number] {
  return [
    Math.sin(a * y) - Math.cos(b * x),
    Math.sin(c * x) - Math.cos(d * y),
  ];
}

function lorenz2d(x: number, y: number, a: number, b: number, c: number, d: number): [number, number] {
  const dt = 0.005;
  const z = 0;
  const dx = a * (y - x);
  const dy = x * (b - z) - y;
  return [x + dx * dt, y + dy * dt];
}

export const attractors: Pipeline = {
  id: 'attractors',
  name: 'Strange Attractors',
  theme: 'cosmic',
  description: 'Clifford, De Jong, and Lorenz attractors rendered as luminous density maps.',
  tags: ['chaos', 'mathematics', 'density'],
  params: {
    type:       { label: 'Attractor',    type: 'select', default: 'clifford', options: ['clifford', 'dejong', 'lorenz2d'] },
    a:          { label: 'A',            type: 'range', default: -1.4, min: -3, max: 3, step: 0.1 },
    b:          { label: 'B',            type: 'range', default: 1.6, min: -3, max: 3, step: 0.1 },
    c:          { label: 'C',            type: 'range', default: 1.0, min: -3, max: 3, step: 0.1 },
    d:          { label: 'D',            type: 'range', default: 0.7, min: -3, max: 3, step: 0.1 },
    pointCount: { label: 'Points/Frame', type: 'range', default: 5000, min: 1000, max: 20000, step: 1000 },
    color:      { label: 'Color',        type: 'color', default: '#c86e9e' },
    decay:      { label: 'Decay',        type: 'range', default: 1, min: 0, max: 5, step: 1 },
  },
  setup(p, params) {
    p.background(8, 8, 8);
    p.pixelDensity(1);
    return { x: 0.1, y: 0.1, density: new Float32Array(p.width * p.height) };
  },
  draw(p, params, state: any, frame) {
    const type = params.type as string;
    const a = params.a as number;
    const b = params.b as number;
    const c = params.c as number;
    const d = params.d as number;
    const count = params.pointCount as number;
    const col = p.color(params.color as string);
    const decay = params.decay as number;
    const cr = p.red(col);
    const cg = p.green(col);
    const cb = p.blue(col);

    const fn = type === 'dejong' ? dejong : type === 'lorenz2d' ? lorenz2d : clifford;

    // Decay density map
    if (decay > 0 && frame % 60 === 0) {
      for (let i = 0; i < state.density.length; i++) {
        state.density[i] *= (1 - decay * 0.01);
      }
    }

    // Compute points
    for (let i = 0; i < count; i++) {
      const [nx, ny] = fn(state.x, state.y, a, b, c, d);
      state.x = nx;
      state.y = ny;

      // Map to screen
      const sx = Math.floor(p.map(nx, -3, 3, 0, p.width));
      const sy = Math.floor(p.map(ny, -3, 3, 0, p.height));

      if (sx >= 0 && sx < p.width && sy >= 0 && sy < p.height) {
        const idx = sy * p.width + sx;
        state.density[idx] = Math.min(state.density[idx] + 0.05, 1);
      }
    }

    // Render density to pixels
    p.loadPixels();
    for (let i = 0; i < state.density.length; i++) {
      const val = state.density[i];
      if (val > 0.001) {
        const brightness = Math.pow(val, 0.4);
        const pi = i * 4;
        p.pixels[pi] = Math.min(255, cr * brightness + p.pixels[pi] * 0.1);
        p.pixels[pi + 1] = Math.min(255, cg * brightness + p.pixels[pi + 1] * 0.1);
        p.pixels[pi + 2] = Math.min(255, cb * brightness + p.pixels[pi + 2] * 0.1);
        p.pixels[pi + 3] = 255;
      } else {
        const pi = i * 4;
        p.pixels[pi] = 8;
        p.pixels[pi + 1] = 8;
        p.pixels[pi + 2] = 8;
        p.pixels[pi + 3] = 255;
      }
    }
    p.updatePixels();
  },
  onParamChange(p, params, state: any) {
    state.x = 0.1;
    state.y = 0.1;
    state.density.fill(0);
    p.background(8, 8, 8);
  },
};
