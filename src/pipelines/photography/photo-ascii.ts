import type { Pipeline } from '../_types';
import { PHOTO_OPTIONS, photoUrlFor } from './_photos';

const CHARSET_BLOCKS = ' .:-=+*#%@';
const CHARSET_CODE = ' .,:;i!lI?/\\|()1{}[]-_+~<>*#%8@';
const CHARSET_DENSE = '░▒▓█';

export const photoAscii: Pipeline = {
  id: 'photo-ascii',
  name: 'Photo ASCII',
  theme: 'photography',
  description: 'Portrait rendered in monospace characters, brightness mapped to character density.',
  tags: ['ascii', 'portrait', 'typography'],
  params: {
    photo:    { label: 'Photo',     type: 'select', default: 'portrait-02', options: PHOTO_OPTIONS },
    cellSize: { label: 'Cell Size', type: 'range', default: 10, min: 4, max: 24, step: 1 },
    charset:  { label: 'Charset',   type: 'select', default: 'blocks', options: ['blocks', 'code', 'dense'] },
    useColor: { label: 'Use Color', type: 'boolean', default: true },
    bgColor:  { label: 'Background', type: 'color', default: '#080808' },
    fgColor:  { label: 'Mono Color', type: 'color', default: '#d4a373' },
  },
  setup(p, params) {
    const state: any = { img: null, loaded: false, currentPhoto: params.photo };
    (p as any).loadImage(photoUrlFor(params.photo as string), (img: any) => {
      state.img = img;
      img.loadPixels();
      state.loaded = true;
    });
    return state;
  },
  draw(p, params, state: any, frame) {
    const bg = params.bgColor as string;
    p.background(bg);

    if (!state.loaded || !state.img) {
      p.fill(102, 102, 96);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.text('loading...', p.width / 2, p.height / 2);
      return;
    }

    if (state.currentPhoto !== params.photo) {
      state.loaded = false;
      state.currentPhoto = params.photo;
      (p as any).loadImage(photoUrlFor(params.photo as string), (img: any) => {
        state.img = img;
        img.loadPixels();
        state.loaded = true;
      });
      return;
    }

    const cellSize = params.cellSize as number;
    const charsetName = params.charset as string;
    const useColor = params.useColor as boolean;
    const fg = p.color(params.fgColor as string);

    const charset =
      charsetName === 'code' ? CHARSET_CODE :
      charsetName === 'dense' ? CHARSET_DENSE :
      CHARSET_BLOCKS;

    const img = state.img;
    const scale = Math.min(p.width / img.width, p.height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const offsetX = (p.width - drawW) / 2;
    const offsetY = (p.height - drawH) / 2;

    p.textFont('DM Mono, monospace');
    p.textSize(cellSize);
    p.textAlign(p.CENTER, p.CENTER);
    p.noStroke();

    for (let y = 0; y < drawH; y += cellSize) {
      for (let x = 0; x < drawW; x += cellSize * 0.6) {
        const sx = Math.floor((x / drawW) * img.width);
        const sy = Math.floor((y / drawH) * img.height);
        const pi = (sy * img.width + sx) * 4;
        const r = img.pixels[pi];
        const g = img.pixels[pi + 1];
        const b = img.pixels[pi + 2];
        const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

        const charIdx = Math.floor(lum * (charset.length - 1));
        const ch = charset[charIdx];

        if (useColor) {
          p.fill(r, g, b);
        } else {
          p.fill(p.red(fg), p.green(fg), p.blue(fg), 50 + lum * 205);
        }

        p.text(ch, offsetX + x + cellSize / 2, offsetY + y + cellSize / 2);
      }
    }
  },
};
