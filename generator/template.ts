export function pipelineTemplate(name: string, id: string, theme: string): string {
  const constName = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  return `import type { Pipeline } from '../_types';

export const ${constName}: Pipeline = {
  id: '${id}',
  name: '${name}',
  theme: '${theme}',
  description: 'A new ${theme} pipeline.',
  tags: ['${theme}'],
  params: {
    speed: { label: 'Speed', type: 'range', default: 1, min: 0.1, max: 5, step: 0.1 },
    color: { label: 'Color', type: 'color', default: '#e8e6e0' },
  },
  setup(p, params) {
    p.background(8, 8, 8);
    return {};
  },
  draw(p, params, state: any, frame) {
    p.background(8, 8, 8);
    // TODO: implement your pipeline
    p.fill(params.color as string);
    p.noStroke();
    p.circle(
      p.width / 2 + Math.sin(frame * 0.02 * (params.speed as number)) * 100,
      p.height / 2,
      50
    );
  },
};
`;
}

export function pageTemplate(name: string, id: string, theme: string): string {
  const constName = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  return `---
import PieceLayout from '../../../layouts/PieceLayout.astro';
import { ${constName} } from '../../../pipelines/${theme}/${id}';
---
<PieceLayout pipeline={${constName}} />
`;
}
