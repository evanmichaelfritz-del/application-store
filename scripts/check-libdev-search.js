#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const catalog = fs.readFileSync(path.join(__dirname, '../src/catalog.ts'), 'utf8');
const snippets = fs.readFileSync(path.join(__dirname, '../src/snippets.ts'), 'utf8');
const prompts = fs.readFileSync(path.join(__dirname, '../src/agentPrompts.ts'), 'utf8');

const items = [...catalog.matchAll(
  /id: '([^']+)',\s*title: '([^']+)',\s*subtitle: '([^']+)',\s*categories: \[([^\]]+)\],\s*tags: \[([^\]]*)\],\s*sections: \[([^\]]+)\],\s*pro: (true|false)/g,
)].map((m) => ({
  id: m[1],
  title: m[2],
  subtitle: m[3],
  categories: m[4].split(',').map((s) => s.replace(/['\s]/g, '')).filter(Boolean),
  tags: m[5].split(',').map((s) => s.replace(/['\s]/g, '')).filter(Boolean),
  sections: m[6].split(',').map((s) => s.replace(/['\s]/g, '')).filter(Boolean),
  pro: m[7] === 'true',
}));

function filterTags(item) {
  return item.pro ? [...item.categories, 'pro'] : [...item.categories];
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [item.title, item.subtitle, item.id, ...filterTags(item), ...item.tags].join(' ').toLowerCase();
  return haystack.includes(q);
}

function matchesFilter(item, key) {
  if (key === 'all') return true;
  if (key === 'pro') return item.pro;
  return item.categories.includes(key);
}

let failed = 0;
const expect = {
  Beam: 'border-beam',
  Gooey: 'gooey',
  Metal: 'liquid-metal',
};

const splitOrbIds = [
  'orb-solving',
  'orb-thinking',
  'orb-agent-listening',
  'orb-searching',
  'orb-agent-planning',
  'orb-agent-thinking',
  'orb-working',
  'orb-agent-shaping',
  'orb-state-picker',
];

for (const [query, id] of Object.entries(expect)) {
  const hits = items.filter((item) => matchesSearch(item, query)).map((item) => item.id);
  const ok = hits.includes(id);
  console.log(`${ok ? 'ok' : 'FAIL'} search "${query}" → ${hits.join(', ') || '(none)'}`);
  if (!ok) failed += 1;
}

for (const id of Object.values(expect)) {
  const item = items.find((entry) => entry.id === id);
  const inEffects = item && matchesFilter(item, 'effects');
  console.log(`${inEffects ? 'ok' : 'FAIL'} Effects filter has ${id}`);
  if (!inEffects) failed += 1;
  const hasSnippet = snippets.includes(`'${id}'`) || snippets.includes(`${id}:`);
  const hasLock = prompts.includes(`'${id}'`) || prompts.includes(`${id}:`);
  console.log(`${hasSnippet ? 'ok' : 'FAIL'} snippet ${id}`);
  console.log(`${hasLock ? 'ok' : 'FAIL'} AGENT_PROMPT lock ${id}`);
  if (!hasSnippet || !hasLock) failed += 1;
}

const thinkingHits = items.filter((item) => matchesSearch(item, 'Thinking orbs')).map((item) => item.id);
const splitFound = splitOrbIds.every((id) => thinkingHits.includes(id));
console.log(`${splitFound ? 'ok' : 'FAIL'} search "Thinking orbs" → ${thinkingHits.join(', ') || '(none)'}`);
if (!splitFound) failed += 1;

for (const id of splitOrbIds) {
  const item = items.find((entry) => entry.id === id);
  const placed = item
    && matchesFilter(item, 'effects')
    && item.sections.includes('effects')
    && !item.sections.includes('ai-skills');
  console.log(`${placed ? 'ok' : 'FAIL'} ${id} stays in Effects, not AI skills`);
  if (!placed) failed += 1;
  const hasSnippet = snippets.includes(`'${id}'`);
  const hasLock = prompts.includes(`'${id}'`);
  console.log(`${hasSnippet ? 'ok' : 'FAIL'} snippet ${id}`);
  console.log(`${hasLock ? 'ok' : 'FAIL'} AGENT_PROMPT lock ${id}`);
  if (!hasSnippet || !hasLock) failed += 1;
}

const bundled = items.find((item) => item.id === 'thinking-orbs-playground' || item.id === 'thinking-orbs');
const oldCard = items.find((item) => item.subtitle === 'Animated thinking orb component');
console.log(`${!bundled && !oldCard ? 'ok' : 'FAIL'} combined and removed Thinking orbs cards stay gone`);
if (bundled || oldCard) failed += 1;

const transitionIds = items.filter((item) => item.sections.includes('transitions')).map((item) => item.id);
console.log(`ok transitions seed count ${transitionIds.length}`);
if (transitionIds.length < 15) {
  console.log('FAIL transitions seed looks truncated');
  failed += 1;
}

const taggedOk = items.length === 35 && items.every((item) => item.tags.length > 0);
console.log(`${taggedOk ? 'ok' : 'FAIL'} every catalog item has tags (${items.length})`);
if (!taggedOk) failed += 1;

for (const section of ['graphic-design', 'ai-skills', 'tools', 'manual']) {
  const n = items.filter((item) => item.sections.includes(section)).length;
  console.log(`${n === 0 ? 'ok' : 'FAIL'} ${section} empty (${n})`);
  if (n !== 0) failed += 1;
}

if (failed) process.exit(1);
console.log('search/filter lock passed');
