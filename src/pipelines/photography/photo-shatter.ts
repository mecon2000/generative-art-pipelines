import type { Pipeline } from '../_types';
import { PHOTO_OPTIONS, photoUrlFor } from './_photos';

interface Shard {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  phase: number;
}

export const photoShatter: Pipeline = {
  id: 'photo-shatter',
  name: 'Photo Shatter',
  theme: 'photography',
  description: 'Portrait fractured into displaced rectangular shards that drift, pulse, and recompose.',
  tags: ['glitch', 'portrait', 'displacement'],
  params: {
    photo:      { label: 'Photo',        type: 'select', default: 'portrait-03', options: PHOTO_OPTIONS },
    shardCount: { label: 'Shards',       type: 'range', default: 60, min: 10, max: 200, step: 10 },
    displacement: { label: 'Displacement', type: 'range', default: 30, min: 0, max: 120, step: 5 },
    speed:      { label: 'Drift Speed',  type: 'range', default: 1, min: 0.1, max: 4, step: 0.1 },
    rgbShift:   { label: 'RGB Shift',    type: 'range', default: 4, min: 0, max: 20, step: 1 },
    fadeBg:     { label: 'Background Fade', type: 'range', default: 20, min: 0, max: 80, step: 5 },
  },
  setup(p, params) {
    const state: any = {
      img: null,
      loaded: false,
      shards: [] as Shard[],
      currentPhoto: params.photo,
      currentCount: 0,
    };
    (p as any).loadImage(photoUrlFor(params.photo as string), (img: any) => {
      state.img = img;
      state.loaded = true;
    });
    return state;
  },
  draw(p, params, state: any, frame) {
    const fadeBg = params.fadeBg as number;
    p.background(8, 8, 8, fadeBg);

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
      state.shards = [];
      state.currentCount = 0;
      (p as any).loadImage(photoUrlFor(params.photo as string), (img: any) => {
        state.img = img;
        state.loaded = true;
      });
      return;
    }

    const count = params.shardCount as number;
    const displacement = params.displacement as number;
    const speed = params.speed as number;
    const rgbShift = params.rgbShift as number;

    const img = state.img;
    const scale = Math.min(p.width / img.width, p.height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const offsetX = (p.width - drawW) / 2;
    const offsetY = (p.height - drawH) / 2;

    // Regenerate shards if count changed
    if (state.currentCount !== count) {
      state.shards = [];
      for (let i = 0; i < count; i++) {
        const w = p.random(drawW * 0.05, drawW * 0.25);
        const h = p.random(drawH * 0.03, drawH * 0.15);
        state.shards.push({
          x: p.random(drawW - w),
          y: p.random(drawH - h),
          w,
          h,
          dx: p.random(-1, 1),
          dy: p.random(-1, 1),
          phase: p.random(p.TWO_PI),
        });
      }
      state.currentCount = count;
    }

    const t = frame * 0.02 * speed;

    // Draw base image faintly first
    p.push();
    p.tint(255, 60);
    p.image(img, offsetX, offsetY, drawW, drawH);
    p.pop();

    // Draw shards with RGB shift
    for (const shard of state.shards) {
      const dispX = Math.sin(t + shard.phase) * displacement * shard.dx;
      const dispY = Math.cos(t * 0.7 + shard.phase) * displacement * shard.dy;

      const sx = shard.x / drawW * img.width;
      const sy = shard.y / drawH * img.height;
      const sw = shard.w / drawW * img.width;
      const sh = shard.h / drawH * img.height;

      if (rgbShift > 0) {
        // Red channel offset
        p.push();
        p.tint(255, 0, 0, 180);
        (p as any).image(img, offsetX + shard.x + dispX - rgbShift, offsetY + shard.y + dispY, shard.w, shard.h, sx, sy, sw, sh);
        p.pop();

        // Blue channel offset
        p.push();
        p.tint(0, 100, 255, 180);
        (p as any).image(img, offsetX + shard.x + dispX + rgbShift, offsetY + shard.y + dispY, shard.w, shard.h, sx, sy, sw, sh);
        p.pop();

        // Green middle
        p.push();
        p.tint(0, 255, 100, 220);
        (p as any).image(img, offsetX + shard.x + dispX, offsetY + shard.y + dispY, shard.w, shard.h, sx, sy, sw, sh);
        p.pop();
      } else {
        (p as any).image(img, offsetX + shard.x + dispX, offsetY + shard.y + dispY, shard.w, shard.h, sx, sy, sw, sh);
      }
    }
    p.noTint();
  },
};
