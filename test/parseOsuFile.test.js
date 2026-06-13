import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseOsuFile } from '../src/server/parseOsuFile.js';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

async function parseFixture(name) {
  const baseDir = join(fixturesDir, name.replace(/\.osu$/, ''));
  const text = await readFile(join(fixturesDir, name), 'utf8');
  return parseOsuFile(text, baseDir);
}

test('parses basic osu metadata, audio, background and timing point', async () => {
  const baseDir = join(fixturesDir, 'simple');
  const parsed = parseOsuFile(await readFile(join(fixturesDir, 'simple.osu'), 'utf8'), baseDir);

  assert.equal(parsed.audio, join(baseDir, 'audio.mp3'));
  assert.equal(parsed.title, 'Simple Title');
  assert.equal(parsed.artist, 'Simple Artist');
  assert.equal(parsed.creator, 'Mapper');
  assert.equal(parsed.version, 'Normal');
  assert.equal(parsed.background, join(baseDir, 'bg.jpg'));
  assert.deepEqual(parsed.timingPoints, [
    {
      offset: 0,
      beatLength: 500,
      meter: 4,
      uninherited: true,
      effects: 0,
      kiai: false,
    },
  ]);
});

test('parses inherited timing points and kiai effects', async () => {
  const parsed = await parseFixture('kiai.osu');

  assert.equal(parsed.audio.endsWith(join('kiai', 'kiai.ogg')), true);
  assert.equal(parsed.background.endsWith(join('kiai', 'storyboard.png')), true);
  assert.equal(parsed.timingPoints.length, 3);
  assert.equal(parsed.timingPoints[0].uninherited, true);
  assert.equal(parsed.timingPoints[1].uninherited, false);
  assert.equal(parsed.timingPoints[1].beatLength, -50);
  assert.equal(parsed.timingPoints[2].kiai, true);
  assert.equal(parsed.timingPoints[2].effects, 1);
});

test('prefers unicode metadata when present and exposes original unicode fields', async () => {
  const parsed = await parseFixture('unicode-title.osu');

  assert.equal(parsed.title, '中文标题');
  assert.equal(parsed.titleUnicode, '中文标题');
  assert.equal(parsed.artist, '日本語アーティスト');
  assert.equal(parsed.artistUnicode, '日本語アーティスト');
  assert.equal(parsed.creator, 'Unicode Mapper');
  assert.equal(parsed.version, '测试难度');
  assert.equal(parsed.audio.endsWith(join('unicode-title', 'unicode.flac')), true);
  assert.equal(parsed.background.endsWith(join('unicode-title', '背景.png')), true);
});
