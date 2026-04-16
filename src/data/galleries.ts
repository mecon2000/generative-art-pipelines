export interface GalleryTheme {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  accentDim: string;
  coverPipeline: string;
  order: number;
}

export const galleries: GalleryTheme[] = [
  {
    id: 'organic',
    name: 'Organic',
    tagline: 'Living systems, natural emergence',
    description: 'Algorithms drawn from biology — growth, flow, reaction. Art that breathes.',
    accentColor: '#7eb87e',
    accentDim: '#4a6e4a',
    coverPipeline: 'flow-field',
    order: 1,
  },
  {
    id: 'geometric',
    name: 'Geometric',
    tagline: 'Mathematical precision, infinite variation',
    description: 'Tilings, tessellations, and structures that reveal order inside chaos.',
    accentColor: '#6ea8c8',
    accentDim: '#3d6478',
    coverPipeline: 'truchet',
    order: 2,
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    tagline: 'Vast, luminous, unknowable',
    description: 'Strange attractors, aurora fields, and the mathematics of deep space.',
    accentColor: '#c86e9e',
    accentDim: '#7a3d5e',
    coverPipeline: 'aurora',
    order: 3,
  },
  {
    id: 'glitch',
    name: 'Glitch',
    tagline: 'Digital entropy, controlled corruption',
    description: 'Sorting algorithms turned against images, noise eating signal.',
    accentColor: '#e87e4a',
    accentDim: '#8a4a2a',
    coverPipeline: 'pixelsort',
    order: 4,
  },
  {
    id: 'dimensional',
    name: 'Dimensional',
    tagline: 'Three dimensions, rendered in real time',
    description: 'WebGL sketches exploring volume, depth, and rotation.',
    accentColor: '#b89be8',
    accentDim: '#6e5a8a',
    coverPipeline: 'torus-field',
    order: 5,
  },
  {
    id: 'photography',
    name: 'Photography',
    tagline: 'Photographs transformed by algorithms',
    description: 'Portraits run through code — sorted, shattered, abstracted, remade.',
    accentColor: '#d4a373',
    accentDim: '#7a5a42',
    coverPipeline: 'photo-sort',
    order: 6,
  },
];
