#!/usr/bin/env node
/**
 * The /a and /c rewrites are an allowlist. Fail when they drift from the catalog.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function listed(source, marker) {
  const prefix = `${marker}(`;
  if (!source.startsWith(prefix) || !source.endsWith(')')) {
    throw new Error(`unexpected rewrite source: ${source}`);
  }
  return source.slice(prefix.length, -1).split('|');
}

function same(label, expected, actual) {
  const problems = [];
  if (expected.length !== actual.length || expected.some((item, index) => item !== actual[index])) {
    const missing = expected.filter((item) => !actual.includes(item));
    const extra = actual.filter((item) => !expected.includes(item));
    problems.push(
      `${label} does not match.\n  missing: ${missing.join(', ') || '(none)'}\n  extra: ${extra.join(', ') || '(none)'}`,
    );
  }
  return problems;
}

const catalog = readFileSync(join(root, 'src/catalog.ts'), 'utf8');
const taxonomy = readFileSync(join(root, 'src/library/taxonomy.ts'), 'utf8');
const craft = readFileSync(join(root, 'src/library/craftApps.ts'), 'utf8');
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));

const ids = [...catalog.matchAll(/^\s+id: '([^']+)',$/gm)].map((match) => match[1]);
const typesBlock = taxonomy.match(/export const COMPONENT_TYPES = \[([\s\S]*?)\] as const;/);
if (!typesBlock) throw new Error('COMPONENT_TYPES not found');
const types = [...typesBlock[1].matchAll(/slug: '([^']+)'/g)].map((match) => match[1]);
const craftIds = [...craft.matchAll(/^\s+slug: "([^"]+)",$/gm)].map((match) => match[1]);
const craftType = craft.match(/export const CRAFT_CATEGORY_SLUG = '([^']+)';/);
if (!craftType) throw new Error('CRAFT_CATEGORY_SLUG not found');

if (new Set(ids).size !== ids.length) throw new Error('catalog ids are not unique');
if (new Set(craftIds).size !== craftIds.length) throw new Error('craft slugs are not unique');
if (ids.some((id) => craftIds.includes(id))) throw new Error('a craft slug collides with a catalog id');
if (ids.length === 0 || types.length === 0 || craftIds.length === 0) {
  throw new Error('parsed an empty catalog, type list, or craft list');
}

const rewrites = Array.isArray(vercel.rewrites) ? vercel.rewrites : [];
const asset = rewrites.find((rule) => typeof rule.source === 'string' && rule.source.startsWith('/a/:slug'));
const type = rewrites.find((rule) => typeof rule.source === 'string' && rule.source.startsWith('/c/:type'));
const playground = rewrites.find((rule) => rule.source === '/playground' && rule.destination === '/index.html');
if (!asset || !type) throw new Error('vercel.json is missing the /a or /c allowlist rewrite');
if (!playground) throw new Error('vercel.json is missing the /playground rewrite');

const problems = [
  ...same('/a/:slug', [...ids, ...craftIds], listed(asset.source, '/a/:slug')),
  ...same('/c/:type', [...types, craftType[1]], listed(type.source, '/c/:type')),
];
if (asset.destination !== '/index.html' || type.destination !== '/index.html') {
  problems.push('allowlist rewrites must destination to /index.html');
}
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(
  `vercel routes match the catalog (${ids.length} assets, ${types.length} types, ${craftIds.length} apps)`,
);
