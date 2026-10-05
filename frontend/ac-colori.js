/* Convertitore colori — Creare Creatività
   JavaScript autonomo (nessuna dipendenza). Tutto vive dentro #ac-colori. */
(function () {
  'use strict';

  // ---------- Logica dei colori (pura, testata da scripts/test.mjs) ----------

  var PANTONE_BASE = [
    ['Pantone 199', '#D0104C'], ['Pantone 186', '#C8102E'],
    ['Pantone Red 032', '#EF3340'], ['Pantone 1795', '#C41230'],
    ['Pantone 165', '#FF6E1B'], ['Pantone Orange 021', '#FE5000'],
    ['Pantone 1375', '#FF8200'], ['Pantone 1225', '#FFC72C'],
    ['Pantone Yellow', '#FEDD00'], ['Pantone 116', '#FFCD00'],
    ['Pantone 382', '#C4D600'], ['Pantone 375', '#84BD00'],
    ['Pantone 355', '#00A651'], ['Pantone 348', '#00843D'],
    ['Pantone 3415', '#00594C'], ['Pantone 3405', '#00A99D'],
    ['Pantone 320', '#00778B'], ['Pantone 300', '#005EB8'],
    ['Pantone 286', '#0032A0'], ['Pantone Reflex Blue', '#001489'],
    ['Pantone 2685', '#330072'], ['Pantone 2593', '#7D3AC1'],
    ['Pantone 2607', '#652D90'], ['Pantone 226', '#DA1884'],
    ['Pantone 219', '#CC0066'], ['Pantone 663', '#B0A9E4'],
    ['Pantone 468', '#D9C89E'], ['Pantone 4625', '#3D2B1F'],
    ['Pantone 7530', '#7A6A53'], ['Pantone Cool Gray 9', '#75787B'],
    ['Pantone Warm Gray 8', '#948B7E'], ['Pantone 425', '#54585A'],
    ['Pantone Black', '#2D2926'], ['Pantone White', '#F2F2F2'],
    ['Pantone 158', '#E4610F'], ['Pantone 3115', '#5CE1E6'],
    ['Pantone 3245', '#84E8B0'], ['Pantone 5395', '#7BA4DB'],
    ['Pantone 7683', '#3C5B90']
  ];

  function clamp(n) { n = Math.round(n); return isNaN(n) ? 0 : Math.max(0, Math.min(255, n)); }
  function hex2(n) { n = n.toString(16); return n.length < 2 ? '0' + n : n; }
  function toHex(r, g, b) { return '#' + hex2(r) + hex2(g) + hex2(b); }
  function hexToRgb(hex) {
    return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
  }

  function rgbToCmyk(r, g, b) {
    if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
    var rp = r / 255, gp = g / 255, bp = b / 255;
    var k = 1 - Math.max(rp, gp, bp);
    return {
      c: Math.round(((1 - rp - k) / (1 - k)) * 100),
      m: Math.round(((1 - gp - k) / (1 - k)) * 100),
      y: Math.round(((1 - bp - k) / (1 - k)) * 100),
      k: Math.round(k * 100)
    };
  }

  function cmykToRgb(c, m, y, k) {
    c /= 100; m /= 100; y /= 100; k /= 100;
    return {
      r: clamp(255 * (1 - c) * (1 - k)),
      g: clamp(255 * (1 - m) * (1 - k)),
      b: clamp(255 * (1 - y) * (1 - k))
    };
  }

  // La carta non patinata (uncoated) assorbe di più: i colori risultano più chiari e meno saturi.
  // Approssimazione: miscela verso un bianco carta.
  function toUncoatedHex(hex) {
    var c = hexToRgb(hex);
    function mix(v, p) { return Math.round(v * 0.82 + p * 0.18); }
    return toHex(mix(c.r, 238), mix(c.g, 231), mix(c.b, 214));
  }

  var LIB_C = PANTONE_BASE.map(function (p) { return { name: p[0] + ' C', hex: p[1].toUpperCase() }; });
  var LIB_U = PANTONE_BASE.map(function (p) { return { name: p[0] + ' U', hex: toUncoatedHex(p[1]).toUpperCase() }; });

  function closestPantone(r, g, b, lib) {
    var best = null, bestDist = Infinity;
    for (var i = 0; i < lib.length; i++) {
      var c = hexToRgb(lib[i].hex);
      var d = (r - c.r) * (r - c.r) + (g - c.g) * (g - c.g) + (b - c.b) * (b - c.b);
      if (d < bestDist) { bestDist = d; best = lib[i]; }
    }
    return best;
  }

  // Complementare "a luce" (RGB): 255 meno ogni canale.
  function complementary(r, g, b) {
    var cr = 255 - r, cg = 255 - g, cb = 255 - b;
    return {
      r: cr, g: cg, b: cb,
      hex: toHex(cr, cg, cb).toUpperCase(),
      cmyk: rgbToCmyk(cr, cg, cb),
      pantoneC: closestPantone(cr, cg, cb, LIB_C),
      pantoneU: closestPantone(cr, cg, cb, LIB_U)
    };
  }

  var core = {
    PANTONE_BASE: PANTONE_BASE, LIB_C: LIB_C, LIB_U: LIB_U,
    clamp: clamp, toHex: toHex, hexToRgb: hexToRgb,
    rgbToCmyk: rgbToCmyk, cmykToRgb: cmykToRgb,
    toUncoatedHex: toUncoatedHex, closestPantone: closestPantone, complementary: complementary
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document === 'undefined') return;

  // ---------- Interfaccia ----------

  var root = document.getElementById('ac-colori');
  if (!root || root.getAttribute('data-ac-ready')) return;
  root.setAttribute('data-ac-ready', '1');

  function $(sel) { return root.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function ui(name) { return $('[data-ac="' + name + '"]'); }

  var el = {
    swatch: ui('swatch'), picker: ui('picker'), eye: ui('eyedropper'),
    hex: ui('hex'), pantone: ui('pantone'), list: ui('pantone-list'),
    pName: ui('pantone-name'), pHex: ui('pantone-hex'),
    cSwatch: ui('comp-swatch'), cHex: ui('comp-hex'), cRgb: ui('comp-rgb'), cCmyk: ui('comp-cmyk'),
    cPc: ui('comp-pc'), cPu: ui('comp-pu')
  };
  var nums = {};
  $$('[data-ac-num]').forEach(function (i) { nums[i.getAttribute('data-ac-num')] = i; });

  var COPY_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var TICK_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  $$('.ac-copy').forEach(function (b) { b.innerHTML = COPY_ICON; });

  var state = { r: 255, g: 255, b: 255, hexDraft: '#FFFFFF', finish: 'C', pantoneDraft: null };
  var listFinish = null;

  function setRGB(r, g, b) {
    state.r = clamp(r); state.g = clamp(g); state.b = clamp(b);
    state.hexDraft = toHex(state.r, state.g, state.b).toUpperCase();
    render();
  }

  function lib() { return state.finish === 'U' ? LIB_U : LIB_C; }

  function setValue(input, value) {
    value = String(value);
    if (input.value !== value) input.value = value;
  }

  function render() {
    var r = state.r, g = state.g, b = state.b;
    var hex = toHex(r, g, b);
    var cmyk = rgbToCmyk(r, g, b);
    var pantone = closestPantone(r, g, b, lib());
    var comp = complementary(r, g, b);

    el.swatch.style.background = hex;
    setValue(el.picker, hex);
    setValue(nums.r, r); setValue(nums.g, g); setValue(nums.b, b);
    setValue(nums.c, cmyk.c); setValue(nums.m, cmyk.m); setValue(nums.y, cmyk.y); setValue(nums.k, cmyk.k);
    setValue(el.hex, state.hexDraft);
    setValue(el.pantone, state.pantoneDraft === null ? pantone.name : state.pantoneDraft);
    el.pName.textContent = pantone.name;
    el.pHex.textContent = pantone.hex;

    if (listFinish !== state.finish) {
      listFinish = state.finish;
      el.list.innerHTML = '';
      lib().forEach(function (p) {
        var o = document.createElement('option');
        o.value = p.name;
        el.list.appendChild(o);
      });
    }
    $$('[data-ac-finish]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-ac-finish') === state.finish ? 'true' : 'false');
    });

    el.cSwatch.style.background = comp.hex;
    el.cHex.textContent = comp.hex;
    el.cRgb.textContent = comp.r + ', ' + comp.g + ', ' + comp.b;
    el.cCmyk.textContent = comp.cmyk.c + ', ' + comp.cmyk.m + ', ' + comp.cmyk.y + ', ' + comp.cmyk.k;
    el.cPc.textContent = comp.pantoneC.name;
    el.cPu.textContent = comp.pantoneU.name;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
    }
    fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (e) { /* niente da fare */ }
    document.body.removeChild(t);
  }

  function copyValue(key) {
    var cmyk = rgbToCmyk(state.r, state.g, state.b);
    var map = {
      r: state.r, g: state.g, b: state.b, c: cmyk.c, m: cmyk.m, y: cmyk.y, k: cmyk.k,
      hex: toHex(state.r, state.g, state.b).toUpperCase(),
      pantone: closestPantone(state.r, state.g, state.b, lib()).name
    };
    return String(map[key]);
  }

  // Campi numerici: si applicano a "change" (invio o uscita dal campo), non a ogni tasto.
  root.addEventListener('change', function (e) {
    var key = e.target.getAttribute && e.target.getAttribute('data-ac-num');
    if (!key) return;
    var v = +e.target.value;
    var cmyk = rgbToCmyk(state.r, state.g, state.b);
    if (key === 'r') return setRGB(v, state.g, state.b);
    if (key === 'g') return setRGB(state.r, v, state.b);
    if (key === 'b') return setRGB(state.r, state.g, v);
    cmyk[key] = v;
    var rgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
    setRGB(rgb.r, rgb.g, rgb.b);
  });

  root.addEventListener('input', function (e) {
    var t = e.target;
    if (t === el.picker) {
      var c = hexToRgb(t.value);
      return setRGB(c.r, c.g, c.b);
    }
    if (t === el.hex) {
      state.hexDraft = t.value;
      var m = t.value.match(/^#?([0-9a-f]{6})$/i);
      if (m) { var h = hexToRgb('#' + m[1]); setRGB(h.r, h.g, h.b); }
      return;
    }
    if (t === el.pantone) {
      var q = t.value.trim().toLowerCase();
      state.pantoneDraft = t.value;
      var hit = lib().filter(function (p) { return p.name.toLowerCase() === q; })[0];
      if (hit) { state.pantoneDraft = null; var p = hexToRgb(hit.hex); setRGB(p.r, p.g, p.b); }
    }
  });

  el.pantone.addEventListener('focus', function () { state.pantoneDraft = ''; el.pantone.value = ''; });
  el.pantone.addEventListener('blur', function () { state.pantoneDraft = null; render(); });
  el.hex.addEventListener('blur', function () { state.hexDraft = toHex(state.r, state.g, state.b).toUpperCase(); render(); });

  root.addEventListener('click', function (e) {
    var node = e.target.closest ? e.target.closest('[data-ac-copy],[data-ac-finish]') : null;
    if (!node || !root.contains(node)) return;
    if (node.hasAttribute('data-ac-finish')) {
      state.finish = node.getAttribute('data-ac-finish');
      state.pantoneDraft = null;
      return render();
    }
    copyText(copyValue(node.getAttribute('data-ac-copy')));
    node.innerHTML = TICK_ICON;
    node.setAttribute('data-copied', '');
    setTimeout(function () { node.innerHTML = COPY_ICON; node.removeAttribute('data-copied'); }, 1200);
  });

  if (window.EyeDropper) {
    el.eye.hidden = false;
    el.eye.addEventListener('click', function () {
      new window.EyeDropper().open().then(function (res) {
        var c = hexToRgb(res.sRGBHex);
        setRGB(c.r, c.g, c.b);
      }).catch(function () { /* annullato dall'utente */ });
    });
  }

  render();
})();
