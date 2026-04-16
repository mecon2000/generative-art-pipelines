import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pipelineTemplate, pageTemplate } from './template';

const args = process.argv.slice(2);
const nameIdx = args.indexOf('--name');
const themeIdx = args.indexOf('--theme');

if (nameIdx === -1 || themeIdx === -1 || !args[nameIdx + 1] || !args[themeIdx + 1]) {
  console.error('Usage: pnpm generate --name "pipeline-name" --theme <theme>');
  console.error('Example: pnpm generate --name "crystal-growth" --theme geometric');
  process.exit(1);
}

const rawName = args[nameIdx + 1];
const theme = args[themeIdx + 1];

// Validate theme
const validThemes = ['organic', 'geometric', 'cosmic', 'glitch'];
if (!validThemes.includes(theme)) {
  console.error(`Invalid theme "${theme}". Must be one of: ${validThemes.join(', ')}`);
  process.exit(1);
}

// Kebab-case the name
const id = rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const displayName = rawName
  .split(/[-\s]+/)
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');

const root = join(import.meta.dirname, '..');
const pipelinePath = join(root, 'src', 'pipelines', theme, `${id}.ts`);
const pagePath = join(root, 'src', 'pages', 'gallery', theme, `${id}.astro`);

// Check if files already exist
if (existsSync(pipelinePath)) {
  console.error(`Pipeline already exists: ${pipelinePath}`);
  process.exit(1);
}

// Create pipeline file
const pipelineDir = join(root, 'src', 'pipelines', theme);
if (!existsSync(pipelineDir)) mkdirSync(pipelineDir, { recursive: true });
writeFileSync(pipelinePath, pipelineTemplate(displayName, id, theme));
console.log(`Created pipeline: src/pipelines/${theme}/${id}.ts`);

// Create page file
const pageDir = join(root, 'src', 'pages', 'gallery', theme);
if (!existsSync(pageDir)) mkdirSync(pageDir, { recursive: true });
writeFileSync(pagePath, pageTemplate(displayName, id, theme));
console.log(`Created page: src/pages/gallery/${theme}/${id}.astro`);

console.log('\nNext steps:');
console.log(`  1. Edit src/pipelines/${theme}/${id}.ts to implement your pipeline`);
console.log(`  2. Add a CanvasCard to src/pages/gallery/${theme}/index.astro`);
console.log(`  3. Drop a preview image at public/previews/${id}.png`);
console.log(`  4. Run "pnpm dev" and visit /gallery/${theme}/${id}`);
