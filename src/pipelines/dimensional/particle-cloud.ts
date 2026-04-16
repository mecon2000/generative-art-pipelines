import type { Pipeline } from '../_types';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export const particleCloud: Pipeline = {
  id: 'particle-cloud',
  name: 'Particle Cloud',
  theme: 'dimensional',
  description: 'A 3D cloud of particles orbiting an invisible attractor in a noise-driven field.',
  tags: ['3d', 'webgl', 'particles'],
  renderer: 'WEBGL',
  params: {
    count:     { label: 'Particles',   type: 'range', default: 800, min: 100, max: 3000, step: 100 },
    spread:    { label: 'Spread',      type: 'range', default: 400, min: 100, max: 800, step: 50 },
    speed:     { label: 'Speed',       type: 'range', default: 1, min: 0.1, max: 5, step: 0.1 },
    fieldScale: { label: 'Field Scale', type: 'range', default: 0.005, min: 0.001, max: 0.02, step: 0.001 },
    color:     { label: 'Color',       type: 'color', default: '#b89be8' },
    pointSize: { label: 'Point Size',  type: 'range', default: 3, min: 1, max: 10, step: 0.5 },
  },
  setup(p, params) {
    const count = params.count as number;
    const spread = params.spread as number;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: p.random(-spread, spread),
      y: p.random(-spread, spread),
      z: p.random(-spread, spread),
      vx: 0, vy: 0, vz: 0,
    }));
    return { particles };
  },
  draw(p, params, state: any, frame) {
    p.background(8, 8, 8);
    const speed = params.speed as number;
    const fieldScale = params.fieldScale as number;
    const spread = params.spread as number;
    const col = p.color(params.color as string);
    const pointSize = params.pointSize as number;

    const t = frame * 0.005;

    // Camera orbit
    (p as any).rotateY(t * 0.5);
    (p as any).rotateX(Math.sin(t * 0.3) * 0.2);

    p.noStroke();
    p.fill(p.red(col), p.green(col), p.blue(col), 220);

    for (const particle of state.particles) {
      // Curl-noise-like flow from Perlin field
      const angleXY = p.noise(particle.x * fieldScale, particle.y * fieldScale, t) * p.TWO_PI * 2;
      const angleYZ = p.noise(particle.y * fieldScale, particle.z * fieldScale, t + 100) * p.TWO_PI * 2;

      particle.vx += Math.cos(angleXY) * speed * 0.2;
      particle.vy += Math.sin(angleXY) * speed * 0.2 + Math.cos(angleYZ) * speed * 0.1;
      particle.vz += Math.sin(angleYZ) * speed * 0.2;

      // Pull back toward center
      particle.vx -= particle.x * 0.0005;
      particle.vy -= particle.y * 0.0005;
      particle.vz -= particle.z * 0.0005;

      // Damping
      particle.vx *= 0.96;
      particle.vy *= 0.96;
      particle.vz *= 0.96;

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;

      // Wrap if wandered too far
      if (Math.abs(particle.x) > spread * 1.5) particle.x *= 0.5;
      if (Math.abs(particle.y) > spread * 1.5) particle.y *= 0.5;
      if (Math.abs(particle.z) > spread * 1.5) particle.z *= 0.5;

      p.push();
      (p as any).translate(particle.x, particle.y, particle.z);
      (p as any).sphere(pointSize, 6, 6);
      p.pop();
    }
  },
  onParamChange(p, params, state: any) {
    const count = params.count as number;
    const spread = params.spread as number;
    while (state.particles.length < count) {
      state.particles.push({
        x: p.random(-spread, spread),
        y: p.random(-spread, spread),
        z: p.random(-spread, spread),
        vx: 0, vy: 0, vz: 0,
      });
    }
    if (state.particles.length > count) state.particles.length = count;
  },
};
