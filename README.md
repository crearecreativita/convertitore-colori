# Convertitore colori — Creare Creatività

Convertitore gratuito tra **RGB, CMYK, HEX e Pantone**, con colore complementare, color picker e contagocce. Uno strumento di [Creare Creatività](https://www.crearecreativita.it).

Tutto client-side: nessun backend, nessun dato inviato, nessuna dipendenza (niente React, niente librerie). Costo: zero, gira su GitHub Pages.

## Cosa fa

- Modifichi un campo qualsiasi (RGB, CMYK, HEX, Pantone per nome, color picker, contagocce) e gli altri si aggiornano.
- **Pantone**: tinta più vicina in una libreria di riferimento di 39 colori, in versione Coated e Uncoated. È un'approssimazione, non una conversione ufficiale (il disclaimer è nella pagina).
- **CMYK**: calcolo matematico dall'RGB, senza profilo colore di stampa.
- **Colore complementare**: 255 meno ogni canale RGB (il complementare "a luce": rosso → ciano).
- Copia in un click di ogni valore. Il contagocce compare solo nei browser che lo supportano (Chrome, Edge).

## Com'è fatto

```
colorconverter/
├── config.json                  URL della pagina WordPress, pagina contatti, tema (unico posto da modificare)
├── frontend/                    ac-colori.css, ac-colori.js, block.html, index.html (GitHub Pages), font e immagini
├── wordpress/blocco-wordpress.html   blocco già pronto da incollare (CSS + HTML + JS)
├── content/                     testo SEO, FAQ, JSON-LD, impostazioni Yoast
└── scripts/                     build.mjs, build-content.mjs, test.mjs
```

Le classi hanno prefisso `ac-` e tutti i selettori partono da `.ac-colori`, quindi il blocco non tocca il tema. Il font è quello del tema (`--ac-font`, `inherit`); la pagina su GitHub Pages usa Inter e Poppins self-hosted.

Dopo ogni modifica a `frontend/`, `config.json` o `content/faq.json` riesegui:

```bash
node scripts/test.mjs           # test della logica dei colori
node scripts/build.mjs          # rigenera frontend/index.html e wordpress/blocco-wordpress.html
node scripts/build-content.mjs  # rigenera testo pagina, JSON-LD e Yoast
```

## Incollare lo strumento in Elementor

1. Crea la pagina **Convertitore colori** con slug `convertitore-colori` (se usi un altro slug, cambia `pageUrl` in `config.json` e riesegui i due build).
2. Apri `content/testo-pagina.html`: contiene la parte sopra il tool, il segnaposto e la parte sotto. Usa i widget *Titolo* e *Editor di testo* (o un widget *HTML*) per le due parti.
3. Nel punto del segnaposto trascina un widget **HTML** e incolla tutto il contenuto di `wordpress/blocco-wordpress.html`. Contiene CSS, markup e JavaScript.
4. In fondo alla pagina aggiungi un altro widget HTML con `content/json-ld.html` (schema WebApplication + FAQPage).
5. Yoast: frase chiave, title e meta description sono in `content/yoast.md`.
6. Se un plugin di cache o minificazione rompe lo script, escludi la pagina dalla minificazione JS.
7. Se il widget sta in una colonna stretta, il layout passa da solo in verticale (usa le container query, non la larghezza dello schermo).

Il testo attorno al tool è HTML normale: Google lo legge anche senza JavaScript.

## GitHub Pages

Il workflow [.github/workflows/pages.yml](.github/workflows/pages.yml) esegue i test, rigenera `frontend/` e pubblica la cartella a ogni push su `main`. In **Settings → Pages** la sorgente deve essere *GitHub Actions*.

La pagina su GitHub Pages ha `<link rel="canonical">` che punta a `pageUrl` (la pagina WordPress), quindi Google considera quella principale.

Per un sottodominio (es. `colori.crearecreativita.it`): aggiungi un file `frontend/CNAME` con il nome, imposta il Custom domain in Settings → Pages e crea il record DNS `CNAME` → `crearecreativita.github.io`.

## Sviluppo locale

```bash
node scripts/build.mjs
python3 -m http.server 8080 -d frontend   # apri http://localhost:8080
```

## Note

- **Nessun Analytics** sulla pagina GitHub Pages: le visite si misurano sul sito WordPress, che è la pagina principale (il canonical punta lì).
- Il tema chiaro è disponibile con `"theme": "light"` in `config.json`.
