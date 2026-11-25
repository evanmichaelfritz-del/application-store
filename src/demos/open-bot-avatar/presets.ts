import { examples } from './vendor/core/examples';
import type { AvatarDefinition } from './vendor/core/types';
import book from './vendor/gallery/book.json';
import brain from './vendor/gallery/brain.json';
import bull from './vendor/gallery/bull.json';
import bunny from './vendor/gallery/bunny.json';
import camera from './vendor/gallery/camera.json';
import cat from './vendor/gallery/cat.json';
import cloud from './vendor/gallery/cloud.json';
import colors from './vendor/gallery/colors.json';
import egg from './vendor/gallery/egg.json';
import ghost from './vendor/gallery/ghost.json';
import magnifier from './vendor/gallery/magnifier.json';
import paintBrush from './vendor/gallery/paint-brush.json';
import palette from './vendor/gallery/palette.json';
import rocket from './vendor/gallery/rocket.json';
import shield from './vendor/gallery/shield.json';
import star from './vendor/gallery/star.json';
import witchHat from './vendor/gallery/witch-hat.json';

type AvatarJson = {
  version: number;
  id: string;
  name: string;
  body: { path: string };
  eyes: { x: number; y: number; spacing: number; scale: number };
};

function avatar(value: AvatarJson): AvatarDefinition {
  if (value.version !== 1) throw new Error(`${value.id} is not version 1`);
  return {
    version: 1,
    id: value.id,
    name: value.name,
    body: { path: value.body.path },
    eyes: { x: value.eyes.x, y: value.eyes.y, spacing: value.eyes.spacing, scale: value.eyes.scale },
  };
}

const GALLERY = [book, brain, bull, bunny, camera, cat, cloud, egg, ghost, magnifier, paintBrush, palette, rocket, shield, star, witchHat].map(
  (value) => avatar(value),
);

const COLOR_OF: Record<string, string> = colors;

export const COLOR_ROW = [
  { value: '#f4f4f4', name: 'White' },
  { value: '#a8693f', name: 'Brown' },
  { value: '#f2384b', name: 'Red' },
  { value: '#ff6a1a', name: 'Orange' },
  { value: '#f8a01c', name: 'Amber' },
  { value: '#1fbf68', name: 'Green' },
  { value: '#14b3a5', name: 'Teal' },
  { value: '#1f7cf2', name: 'Blue' },
  { value: '#8b5cf6', name: 'Purple' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#7a7a7a', name: 'Gray' },
] as const;

export type PresetGroup = 'Examples' | 'Gallery';

export type Preset = {
  group: PresetGroup;
  definition: AvatarDefinition;
  color: string;
};

function colorFor(id: string): string {
  const listed = COLOR_OF[id];
  if (!listed) throw new Error(`${id} has no colour`);
  return listed;
}

export const PRESETS: readonly Preset[] = [
  ...examples.map((definition) => ({ group: 'Examples' as const, definition, color: colorFor(definition.id) })),
  ...GALLERY.map((definition) => ({ group: 'Gallery' as const, definition, color: colorFor(definition.id) })),
];

export const DEFAULT_PRESET_ID = 'cat';

export function presetById(id: string): Preset | undefined {
  return PRESETS.find((preset) => preset.definition.id === id);
}
