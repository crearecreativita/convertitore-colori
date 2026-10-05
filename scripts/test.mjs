// Test della logica dei colori (nessuna dipendenza): node scripts/test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const core = require(join(dirname(fileURLToPath(import.meta.url)), '../frontend/ac-colori.js'));
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

t('rgbToCmyk: primari, nero e bianco', () => {
  assert.deepEqual(core.rgbToCmyk(255, 0, 0), { c: 0, m: 100, y: 100, k: 0 });
  assert.deepEqual(core.rgbToCmyk(0, 255, 0), { c: 100, m: 0, y: 100, k: 0 });
  assert.deepEqual(core.rgbToCmyk(0, 0, 255), { c: 100, m: 100, y: 0, k: 0 });
  assert.deepEqual(core.rgbToCmyk(0, 0, 0), { c: 0, m: 0, y: 0, k: 100 });
  assert.deepEqual(core.rgbToCmyk(255, 255, 255), { c: 0, m: 0, y: 0, k: 0 });
});

t('cmykToRgb: inverso dei casi noti e valori limitati a 0-255', () => {
  assert.deepEqual(core.cmykToRgb(0, 100, 100, 0), { r: 255, g: 0, b: 0 });
  assert.deepEqual(core.cmykToRgb(0, 0, 0, 100), { r: 0, g: 0, b: 0 });
  const o = core.cmykToRgb(500, -50, 0, 0); // valori fuori scala non devono uscire da 0-255
  assert.ok(o.r >= 0 && o.r <= 255 && o.g >= 0 && o.g <= 255);
});

t('andata e ritorno RGB → CMYK → RGB resta vicina (±3 per canale)', () => {
  for (const [r, g, b] of [[249, 34, 115], [27, 26, 28], [127, 194, 0], [240, 240, 10]]) {
    const c = core.rgbToCmyk(r, g, b);
    const o = core.cmykToRgb(c.c, c.m, c.y, c.k);
    assert.ok(Math.abs(o.r - r) <= 3 && Math.abs(o.g - g) <= 3 && Math.abs(o.b - b) <= 3, `${r},${g},${b} → ${o.r},${o.g},${o.b}`);
  }
});

t('toHex / hexToRgb / clamp', () => {
  assert.equal(core.toHex(249, 34, 115), '#f92273');
  assert.equal(core.toHex(0, 0, 0), '#000000');
  assert.deepEqual(core.hexToRgb('#f92273'), { r: 249, g: 34, b: 115 });
  assert.equal(core.clamp(300), 255);
  assert.equal(core.clamp(-4), 0);
  assert.equal(core.clamp(NaN), 0);
  assert.equal(core.clamp(12.6), 13);
});

t('Pantone: una voce esatta della libreria torna sé stessa, in C e in U', () => {
  assert.equal(core.LIB_C.length, core.PANTONE_BASE.length);
  assert.equal(core.LIB_U.length, core.PANTONE_BASE.length);
  for (const lib of [core.LIB_C, core.LIB_U]) {
    for (const p of lib) {
      const c = core.hexToRgb(p.hex);
      assert.equal(core.closestPantone(c.r, c.g, c.b, lib).name, p.name);
    }
  }
});

t('Pantone: nomi unici e con suffisso C/U', () => {
  const names = [...core.LIB_C, ...core.LIB_U].map((p) => p.name);
  assert.equal(new Set(names).size, names.length);
  assert.ok(core.LIB_C.every((p) => / C$/.test(p.name)) && core.LIB_U.every((p) => / U$/.test(p.name)));
});

t('uncoated è più chiaro/desaturato del coated', () => {
  assert.equal(core.toUncoatedHex('#000000'), '#2b2a27');
  const lum = (h) => { const c = core.hexToRgb(h); return c.r + c.g + c.b; };
  assert.ok(lum(core.toUncoatedHex('#001489')) > lum('#001489'));
});

t('complementare: 255 meno ogni canale', () => {
  const c = core.complementary(255, 0, 0);
  assert.equal(c.hex, '#00FFFF');
  assert.deepEqual([c.r, c.g, c.b], [0, 255, 255]);
  assert.deepEqual(c.cmyk, { c: 100, m: 0, y: 0, k: 0 });
  assert.ok(c.pantoneC.name.endsWith(' C') && c.pantoneU.name.endsWith(' U'));
});

console.log(`\n${n} test passati`);
