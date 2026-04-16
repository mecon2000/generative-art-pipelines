# Generative Art Pipelines

A living gallery of algorithmic 2D art. Each piece is a self-contained p5.js pipeline with real-time parameter controls, URL sharing, and PNG export.

**Live**: [Deploy to Vercel to see it live]

## Quick Start

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

## Galleries

| Theme | Accent | Pipelines |
|-------|--------|-----------|
| **Organic** | Green | Flow Field, L-System, Reaction-Diffusion |
| **Geometric** | Blue | Truchet Tiles, Voronoi, Isometric Grid |
| **Cosmic** | Pink | Strange Attractors, Aurora, Star Field |
| **Glitch** | Orange | Pixel Sort, Noise Corruption |

## Adding a Single Pipeline

The fastest way — use the generator:

```bash
pnpm generate --name "crystal-growth" --theme geometric
```

This creates two files:
- `src/pipelines/geometric/crystal-growth.ts` — the pipeline logic
- `src/pages/gallery/geometric/crystal-growth.astro` — the page

Then:
1. Edit `src/pipelines/geometric/crystal-growth.ts` — implement `setup()` and `draw()`
2. Add a `<CanvasCard>` entry to `src/pages/gallery/geometric/index.astro`
3. Optionally drop a preview at `public/previews/crystal-growth.png`
4. Push — Vercel deploys automatically

### Manual pipeline creation

1. Create `src/pipelines/{theme}/{kebab-name}.ts`:

```typescript
import type { Pipeline } from '../_types';

export const crystalGrowth: Pipeline = {
  id: 'crystal-growth',
  name: 'Crystal Growth',
  theme: 'geometric',
  description: 'Crystalline structures growing from seed points.',
  tags: ['growth', 'crystal'],
  params: {
    speed: { label: 'Speed', type: 'range', default: 1, min: 0.1, max: 5, step: 0.1 },
    color: { label: 'Color', type: 'color', default: '#6ea8c8' },
    branches: { label: 'Branches', type: 'range', default: 6, min: 3, max: 12, step: 1 },
    symmetry: { label: 'Symmetry', type: 'boolean', default: true },
  },
  setup(p, params) {
    p.background(8, 8, 8);
    return { /* your state */ };
  },
  draw(p, params, state, frame) {
    // your rendering logic — runs every frame
  },
};
```

2. Create `src/pages/gallery/geometric/crystal-growth.astro`:

```astro
---
import PieceLayout from '../../../layouts/PieceLayout.astro';
import { crystalGrowth } from '../../../pipelines/geometric/crystal-growth';
---
<PieceLayout pipeline={crystalGrowth} />
```

3. Add to the theme's gallery index (`src/pages/gallery/geometric/index.astro`):

```astro
import { crystalGrowth } from '../../../pipelines/geometric/crystal-growth';
// Add to the pieces array
const pieces = [truchet, voronoi, isometric, crystalGrowth];
```

## Adding a New Gallery Theme

1. Add the theme to `src/data/galleries.ts`:

```typescript
{
  id: 'minimal',
  name: 'Minimal',
  tagline: 'Less is more',
  description: 'Stripped-back compositions exploring negative space.',
  accentColor: '#a0a0a0',
  accentDim: '#606060',
  coverPipeline: 'your-cover-pipeline-id',
  order: 5,
}
```

2. Create the gallery index page at `src/pages/gallery/minimal/index.astro`:

```astro
---
import GalleryLayout from '../../../layouts/GalleryLayout.astro';
import CanvasCard from '../../../components/CanvasCard.astro';
import { galleries } from '../../../data/galleries';
import { yourPipeline } from '../../../pipelines/minimal/your-pipeline';

const theme = galleries.find(g => g.id === 'minimal')!;
const pieces = [yourPipeline];
---
<GalleryLayout theme={theme} pieceCount={pieces.length}>
  {pieces.map((p, i) => (
    <CanvasCard pipeline={p} href={`/gallery/minimal/${p.id}`} index={i} />
  ))}
</GalleryLayout>
```

3. Create pipeline files under `src/pipelines/minimal/`
4. Create piece pages under `src/pages/gallery/minimal/`
5. Update piece counts in `src/pages/index.astro` and `src/pages/gallery/index.astro`

## Parameter Types

| Type | Control | Value |
|------|---------|-------|
| `range` | Slider | `number` (requires `min`, `max`, `step`) |
| `color` | Color picker | `string` (hex) |
| `boolean` | Toggle | `boolean` |
| `select` | Dropdown | `string` (requires `options[]`) |

## Tech Stack

Astro + Tailwind CSS + p5.js + Vercel

## Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Dev server at localhost:4321 |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm generate --name "name" --theme theme` | Scaffold new pipeline |
