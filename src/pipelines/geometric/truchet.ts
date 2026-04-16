import type { Pipeline } from '../_types';

export const truchet: Pipeline = {
  id: 'truchet',
  name: 'Truchet Tiles',
  theme: 'geometric',
  description: 'Truchet tiling with quarter-circle arcs creating mesmerizing labyrinthine patterns.',
  tags: ['tiling', 'arcs', 'pattern'],
  params: {
    tileSize:     { label: 'Tile Size',     type: 'range', default: 40, min: 15, max: 100, step: 5 },
    randomize:    { label: 'Click to Remix', type: 'boolean', default: false },
    strokeWeight: { label: 'Stroke Weight', type: 'range', default: 3, min: 1, max: 8, step: 0.5 },
    color1:       { label: 'Color 1',       type: 'color', default: '#6ea8c8' },
    color2:       { label: 'Color 2',       type: 'color', default: '#1a1a1a' },
    animated:     { label: 'Animate',       type: 'boolean', default: true },
  },
  setup(p, params) {
    p.background(8, 8, 8);
    const ts = params.tileSize as number;
    const cols = Math.ceil(p.width / ts) + 1;
    const rows = Math.ceil(p.height / ts) + 1;
    const grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() > 0.5 ? 1 : 0)
    );
    return { grid, cols, rows, animPhase: 0, swapQueue: [] as [number, number][] };
  },
  draw(p, params, state: any, frame) {
    p.background(8, 8, 8);
    const ts = params.tileSize as number;
    const sw = params.strokeWeight as number;
    const c1 = params.color1 as string;
    const c2 = params.color2 as string;
    const animated = params.animated as boolean;

    p.noFill();
    p.strokeCap(p.ROUND);

    // Animate: swap random tiles slowly
    if (animated && frame % 15 === 0) {
      const rx = Math.floor(Math.random() * state.cols);
      const ry = Math.floor(Math.random() * state.rows);
      if (state.grid[ry]) {
        state.grid[ry][rx] = 1 - state.grid[ry][rx];
      }
    }

    for (let row = 0; row < state.rows; row++) {
      for (let col = 0; col < state.cols; col++) {
        const x = col * ts;
        const y = row * ts;
        const type = state.grid[row]?.[col] ?? 0;

        p.push();
        p.translate(x, y);

        // Draw filled background quarter circles
        p.strokeWeight(sw);

        if (type === 0) {
          // Top-left to bottom-right diagonal arcs
          p.stroke(c1);
          p.arc(0, 0, ts, ts, 0, p.HALF_PI);
          p.arc(ts, ts, ts, ts, p.PI, p.PI + p.HALF_PI);

          p.stroke(c2);
          p.arc(ts, 0, ts, ts, p.HALF_PI, p.PI);
          p.arc(0, ts, ts, ts, p.PI + p.HALF_PI, p.TWO_PI);
        } else {
          // Top-right to bottom-left diagonal arcs
          p.stroke(c1);
          p.arc(ts, 0, ts, ts, p.HALF_PI, p.PI);
          p.arc(0, ts, ts, ts, p.PI + p.HALF_PI, p.TWO_PI);

          p.stroke(c2);
          p.arc(0, 0, ts, ts, 0, p.HALF_PI);
          p.arc(ts, ts, ts, ts, p.PI, p.PI + p.HALF_PI);
        }

        p.pop();
      }
    }
  },
  onParamChange(p, params, state: any) {
    const ts = params.tileSize as number;
    state.cols = Math.ceil(p.width / ts) + 1;
    state.rows = Math.ceil(p.height / ts) + 1;
    state.grid = Array.from({ length: state.rows }, () =>
      Array.from({ length: state.cols }, () => Math.random() > 0.5 ? 1 : 0)
    );
  },
};
