import type { Pipeline } from '../_types';

interface Grammar {
  axiom: string;
  rules: Record<string, string>;
}

const grammars: Record<string, Grammar> = {
  plant: {
    axiom: 'X',
    rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
  },
  fern: {
    axiom: 'X',
    rules: { X: 'F-[[X]+X]+F[+FX]-X', F: 'FF' },
  },
  tree: {
    axiom: 'F',
    rules: { F: 'FF+[+F-F-F]-[-F+F+F]' },
  },
  algae: {
    axiom: 'F',
    rules: { F: 'F[+F]F[-F][F]' },
  },
};

function generate(axiom: string, rules: Record<string, string>, iterations: number): string {
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const ch of current) {
      next += rules[ch] || ch;
    }
    current = next;
  }
  return current;
}

export const lsystem: Pipeline = {
  id: 'lsystem',
  name: 'L-System',
  theme: 'organic',
  description: 'L-System grammar producing branching plant structures via turtle graphics.',
  tags: ['fractal', 'botanical', 'recursive'],
  params: {
    axiom:      { label: 'Pattern',     type: 'select', default: 'plant', options: ['plant', 'fern', 'tree', 'algae'] },
    iterations: { label: 'Iterations',  type: 'range', default: 5, min: 2, max: 7, step: 1 },
    angle:      { label: 'Angle',       type: 'range', default: 25, min: 10, max: 50, step: 1 },
    lineLength: { label: 'Line Length', type: 'range', default: 4, min: 1, max: 12, step: 0.5 },
    color:      { label: 'Base Color',  type: 'color', default: '#7eb87e' },
  },
  setup(p, params) {
    p.background(8, 8, 8);
    const grammar = grammars[params.axiom as string] || grammars.plant;
    const sentence = generate(grammar.axiom, grammar.rules, params.iterations as number);
    return { sentence, drawIndex: 0, done: false };
  },
  draw(p, params, state: any, frame) {
    if (state.done) return;

    p.background(8, 8, 8);
    p.resetMatrix();
    p.translate(p.width / 2, p.height);
    p.strokeWeight(1);

    const len = params.lineLength as number;
    const ang = p.radians(params.angle as number);
    const baseColor = p.color(params.color as string);
    const totalLen = state.sentence.length;
    const drawUpTo = Math.min(state.drawIndex, totalLen);
    const stack: { x: number; y: number; a: number }[] = [];
    let currentAngle = -p.HALF_PI;
    let cx = 0;
    let cy = 0;
    let depth = 0;
    let maxDepth = 0;

    // Count max depth for color gradient
    for (let i = 0; i < drawUpTo; i++) {
      if (state.sentence[i] === '[') maxDepth = Math.max(maxDepth, ++depth);
      else if (state.sentence[i] === ']') depth--;
    }
    depth = 0;

    for (let i = 0; i < drawUpTo; i++) {
      const ch = state.sentence[i];
      if (ch === 'F') {
        const t = maxDepth > 0 ? depth / maxDepth : 0;
        const r = p.lerp(p.red(baseColor) * 0.4, p.red(baseColor), t);
        const g = p.lerp(p.green(baseColor) * 0.3, p.green(baseColor), t);
        const b = p.lerp(p.blue(baseColor) * 0.3, p.blue(baseColor), t);
        p.stroke(r, g, b, 200);
        p.strokeWeight(p.map(depth, 0, maxDepth || 1, 2.5, 0.5));
        const nx = cx + Math.cos(currentAngle) * len;
        const ny = cy + Math.sin(currentAngle) * len;
        p.line(cx + p.width / 2, cy + p.height, nx + p.width / 2, ny + p.height);
        // Wait — we already translated, so use local coords
        // Actually let's redo with push/pop and p5 transforms
      } else if (ch === '+') {
        currentAngle += ang;
      } else if (ch === '-') {
        currentAngle -= ang;
      } else if (ch === '[') {
        stack.push({ x: cx, y: cy, a: currentAngle });
        depth++;
      } else if (ch === ']') {
        const s = stack.pop();
        if (s) {
          cx = s.x;
          cy = s.y;
          currentAngle = s.a;
        }
        depth--;
      }
      if (ch === 'F') {
        const nx = cx + Math.cos(currentAngle) * len;
        const ny = cy + Math.sin(currentAngle) * len;
        cx = nx;
        cy = ny;
      }
    }

    // Redraw properly using push/pop turtle
    p.background(8, 8, 8);
    p.translate(p.width / 2, p.height);
    depth = 0;
    const turtleStack: any[] = [];

    for (let i = 0; i < drawUpTo; i++) {
      const ch = state.sentence[i];
      if (ch === 'F') {
        const t = maxDepth > 0 ? depth / maxDepth : 0;
        const r = p.lerp(p.red(baseColor) * 0.4, p.red(baseColor), t);
        const g = p.lerp(p.green(baseColor) * 0.3, p.green(baseColor), t);
        const b = p.lerp(p.blue(baseColor) * 0.3, p.blue(baseColor), t);
        p.stroke(r, g, b, 200);
        p.strokeWeight(p.map(depth, 0, maxDepth || 1, 2.5, 0.5));
        p.line(0, 0, 0, -len);
        p.translate(0, -len);
      } else if (ch === '+') {
        p.rotate(ang);
      } else if (ch === '-') {
        p.rotate(-ang);
      } else if (ch === '[') {
        p.push();
        depth++;
      } else if (ch === ']') {
        p.pop();
        depth--;
      }
    }

    state.drawIndex += Math.max(10, Math.floor(totalLen / 60));
    if (state.drawIndex >= totalLen) {
      state.done = true;
    }
  },
  onParamChange(p, params, state: any) {
    const grammar = grammars[params.axiom as string] || grammars.plant;
    state.sentence = generate(grammar.axiom, grammar.rules, params.iterations as number);
    state.drawIndex = 0;
    state.done = false;
  },
};
