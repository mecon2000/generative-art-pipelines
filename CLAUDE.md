# Generative Art Pipelines

## Project Overview
A living gallery of algorithmic 2D art built with Astro, p5.js, and Tailwind CSS. Each piece is a self-contained "pipeline" — a p5.js sketch with a typed parameter schema. Organized into 4 themed galleries (Organic, Geometric, Cosmic, Glitch).

## Tech Stack
- **Framework**: Astro 6.x (static output, file-based routing)
- **Styling**: Tailwind CSS 3.x + CSS custom properties (design tokens in `src/styles/global.css`)
- **Art Runtime**: p5.js (instance mode, loaded client-side)
- **Deployment**: Vercel (`@astrojs/vercel` adapter)
- **Package Manager**: pnpm
- **TypeScript**: strict mode

## Key Commands
```bash
pnpm dev        # Start dev server on :4321
pnpm build      # Production build
pnpm preview    # Preview production build
pnpm generate --name "pipeline-name" --theme <theme>  # Scaffold new pipeline
```

## Architecture

### Pipeline Contract
Every pipeline implements the `Pipeline` interface from `src/pipelines/_types.ts`:
- `setup(p5, params, canvas)` → called once, returns mutable state
- `draw(p5, params, state, frame)` → called every frame
- `onParamChange?()` → called when user tweaks params
- `destroy?()` → cleanup

### File Structure
- `src/pipelines/{theme}/{id}.ts` — pipeline implementations
- `src/pages/gallery/{theme}/{id}.astro` — piece pages (each imports PieceLayout + pipeline)
- `src/pages/gallery/{theme}/index.astro` — theme gallery pages
- `src/components/SketchCanvas.astro` — p5 instance runner (client-side)
- `src/components/ParamPanel.astro` — real-time parameter controls
- `src/data/galleries.ts` — gallery theme registry

### Design System
- Aesthetic: editorial dark luxury (deep blacks, warm gold accent)
- Fonts: Cormorant Garamond (display), DM Mono (body/labels)
- Colors: CSS vars (`--color-void`, `--color-accent`, etc.) — each gallery overrides accent
- Motion: `cubic-bezier(0.16, 1, 0.3, 1)` (expo out)

### Adding a Pipeline
1. Create `src/pipelines/{theme}/{kebab-name}.ts` implementing Pipeline interface
2. Create `src/pages/gallery/{theme}/{kebab-name}.astro` importing PieceLayout
3. Add CanvasCard to `src/pages/gallery/{theme}/index.astro`
4. Or use: `pnpm generate --name "name" --theme theme`

### Adding a Gallery Theme
1. Add entry to `src/data/galleries.ts` with id, name, colors, coverPipeline
2. Create `src/pages/gallery/{id}/index.astro` using GalleryLayout
3. Create pipeline files under `src/pipelines/{id}/`
4. Update piece counts in `src/pages/index.astro` and `src/pages/gallery/index.astro`

## Current Galleries & Pipelines
- **Organic** (accent: #7eb87e): flow-field, lsystem, reaction-diffusion
- **Geometric** (accent: #6ea8c8): truchet, voronoi, isometric
- **Cosmic** (accent: #c86e9e): attractors, aurora, starfield
- **Glitch** (accent: #e87e4a): pixelsort, noise-corruption
