import type { Pipeline } from '../_types';

export const cubeWave: Pipeline = {
  id: 'cube-wave',
  name: 'Cube Wave',
  theme: 'dimensional',
  description: 'A grid of cubes rippling with radial waves, viewed from above at an angle.',
  tags: ['3d', 'webgl', 'grid'],
  renderer: 'WEBGL',
  params: {
    gridSize:  { label: 'Grid Size',      type: 'range', default: 18, min: 6, max: 32, step: 1 },
    cubeSize:  { label: 'Cube Size',      type: 'range', default: 22, min: 10, max: 50, step: 2 },
    spacing:   { label: 'Spacing',        type: 'range', default: 30, min: 20, max: 80, step: 2 },
    amplitude: { label: 'Wave Height',    type: 'range', default: 100, min: 10, max: 300, step: 10 },
    speed:     { label: 'Speed',          type: 'range', default: 1.5, min: 0.1, max: 5, step: 0.1 },
    waveType:  { label: 'Wave',           type: 'select', default: 'ripple', options: ['ripple', 'diagonal', 'noise', 'twist'] },
    color:     { label: 'Color',          type: 'color', default: '#b89be8' },
  },
  setup(p, params) {
    return {};
  },
  draw(p, params, state, frame) {
    p.background(8, 8, 8);
    const grid = params.gridSize as number;
    const cs = params.cubeSize as number;
    const spacing = params.spacing as number;
    const amp = params.amplitude as number;
    const speed = params.speed as number;
    const waveType = params.waveType as string;
    const col = p.color(params.color as string);

    const t = frame * 0.02 * speed;

    // Isometric-ish camera
    (p as any).rotateX(-Math.PI / 4);
    (p as any).rotateY(Math.sin(t * 0.1) * 0.3);

    // Lighting
    (p as any).ambientLight(40, 40, 60);
    (p as any).directionalLight(220, 200, 255, 0.3, 0.7, -0.5);
    (p as any).pointLight(
      p.red(col), p.green(col), p.blue(col),
      0, -amp * 2, 0
    );

    p.noStroke();

    const offset = (grid - 1) * spacing * 0.5;

    for (let gx = 0; gx < grid; gx++) {
      for (let gz = 0; gz < grid; gz++) {
        const x = gx * spacing - offset;
        const z = gz * spacing - offset;

        let h: number;
        if (waveType === 'ripple') {
          const d = Math.sqrt((gx - grid / 2) ** 2 + (gz - grid / 2) ** 2);
          h = Math.sin(d * 0.5 - t * 2) * amp;
        } else if (waveType === 'diagonal') {
          h = Math.sin((gx + gz) * 0.4 + t) * amp;
        } else if (waveType === 'twist') {
          const ang = Math.atan2(gz - grid / 2, gx - grid / 2);
          const d = Math.sqrt((gx - grid / 2) ** 2 + (gz - grid / 2) ** 2);
          h = Math.sin(d * 0.4 + ang * 2 - t) * amp;
        } else {
          h = (p.noise(gx * 0.2, gz * 0.2, t * 0.3) - 0.5) * amp * 2;
        }

        // Color variation by height
        const bright = p.map(h, -amp, amp, 0.5, 1.2);
        (p as any).specularMaterial(
          Math.min(255, p.red(col) * bright),
          Math.min(255, p.green(col) * bright),
          Math.min(255, p.blue(col) * bright),
        );
        (p as any).shininess(30);

        p.push();
        (p as any).translate(x, -h * 0.5, z);
        (p as any).box(cs, Math.abs(h) + cs, cs);
        p.pop();
      }
    }
  },
};
