export const PHOTOS = [
  '/photos/portrait-01.jpg',
  '/photos/portrait-02.jpg',
  '/photos/portrait-03.jpg',
  '/photos/portrait-04.jpg',
  '/photos/portrait-05.jpg',
] as const;

export type PhotoOption = typeof PHOTOS[number];

export const PHOTO_OPTIONS = [
  'portrait-01',
  'portrait-02',
  'portrait-03',
  'portrait-04',
  'portrait-05',
];

export function photoUrlFor(name: string): string {
  return `/photos/${name}.jpg`;
}
