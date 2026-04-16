import type { Pipeline } from '../_types';

export const torusField: Pipeline = {
  id: 'torus-field',
  name: 'Torus Field',
  theme: 'dimensional',
  description: 'A rotating field of torus shapes with wave-driven positioning.',
  tags: ['3d', 'webgl', 'geometry'],
  renderer: 'WEBGL',
  params: {
    count:     { label: 'Torus Count',    type: 'range', default: 30, min: 5, max: 80, step: 1 },
    radius:    { label: 'Radius',         type: 'range', default: 40, min: 10, max: 100, step: 5 },
    spacing:   { label: 'Spacing',        type: 'range', default: 100, min: 40, max: 200, step: 10 },
    rotSpeed:  { label: 'Rotation Speed', type: 'range', default: 1, min: 0, max: 4, step: 0.1 },
    waveAmp:   { label: 'Wave Amplitude', type: 'range', default: 80, min: 0, max: 200, step: 10 },
    color:     { label: 'Color',          type: 'color', default: '#b89be8' },
    wireframe: { label: 'Wireframe',      type: 'boolean', default: false },
  },
  setup(p, params) {
    return {};
  },
  draw(p, params, state, frame) {
    p.background(8, 8, 8);
    const count = params.count as number;
    const radius = params.radius as number;
    const spacing = params.spacing as number;
    const rotSpeed = params.rotSpeed as number;
    const waveAmp = params.waveAmp as number;
    const color = p.color(params.color as string);
    const wireframe = params.wireframe as boolean;

    const t = frame * 0.01 * rotSpeed;

    // Camera orbit
    (p as any).rotateY(t * 0.3);
    (p as any).rotateX(Math.sin(t * 0.2) * 0.3);

    // Lighting
    (p as any).ambientLight(30, 30, 40);
    (p as any).directionalLight(
      p.red(color), p.green(color), p.blue(color),
      0.5, 0.5, -1
    );
    (p as any).pointLight(180, 180, 255, 0, -300, 200);

    const gridSide = Math.ceil(Math.sqrt(count));
    const offset = (gridSide - 1) * spacing * 0.5;

    let i = 0;
    for (let gx = 0; gx < gridSide; gx++) {
      for (let gz = 0; gz < gridSide; gz++) {
        if (i >= count) break;
        i++;
        const x = gx * spacing - offset;
        const z = gz * spacing - offset;
        const y = Math.sin(gx * 0.5 + gz * 0.5 + t * 2) * waveAmp;

        p.push();
        (p as any).translate(x, y, z);
        (p as any).rotateX(t + gx * 0.3);
        (p as any).rotateY(t * 1.5 + gz * 0.3);

        if (wireframe) {
          p.stroke(p.red(color), p.green(color), p.blue(color), 200);
          p.strokeWeight(0.5);
          p.noFill();
        } else {
          p.noStroke();
          (p as any).specularMaterial(p.red(color), p.green(color), p.blue(color));
          (p as any).shininess(40);
        }
        (p as any).torus(radius, radius * 0.3, 16, 12);
        p.pop();
      }
    }
  },
};
