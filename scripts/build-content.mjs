// Genera da content/faq.json: testo della pagina (HTML), JSON-LD e controlli di lunghezza per Yoast.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const faq = JSON.parse(readFileSync(join(root, 'content/faq.json'), 'utf8'));
const cfg = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));
const PAGE_URL = cfg.pageUrl;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SEO = {
  keyphrase: 'convertitore colori',
  related: 'convertitore rgb cmyk, da hex a cmyk, convertitore pantone',
  title: 'Convertitore colori RGB, CMYK, HEX e Pantone gratis',
  meta: 'Convertitore colori gratis: passa da RGB a CMYK, HEX e Pantone in un click e scopri il colore complementare. Pensato per chi lavora con grafica e stampa.',
};

const part1 = `<h1>Convertitore colori: RGB, CMYK, HEX e Pantone in un click</h1>
<p>Hai un colore in HEX preso dal sito e ti serve il CMYK per la stampa? O hai il Pantone del logo e ti serve l’HEX per il web?</p>
<p>Scrivi il valore qui sotto, in uno qualsiasi dei formati, oppure scegli il colore con il color picker o il contagocce. Vedi subito tutte le corrispondenze e anche il <strong>colore complementare</strong>. Ogni valore si copia con un click.</p>`;

const part2 = `<h2>Come usare il convertitore</h2>
<p>Cambia un campo qualsiasi e gli altri si aggiornano. Puoi scrivere i tre valori RGB, i quattro del CMYK, il codice HEX oppure cercare un Pantone per nome. Il color picker apre la tavolozza del browser; dove è disponibile compare anche il contagocce, che preleva un colore da qualsiasi punto dello schermo.</p>

<h2>Quanto è affidabile?</h2>
<p>Le conversioni tra RGB e HEX sono esatte. Quella verso il CMYK è un calcolo matematico, senza profilo colore di stampa: ti dà un riferimento, non il risultato finale della tipografia. Il Pantone è la tinta più vicina in una libreria di riferimento, non una conversione ufficiale. Per un lavoro di stampa fatti sempre dare una prova colore.</p>

<h2>Domande frequenti</h2>
${faq.map((f) => `<h3>${esc(f.q)}</h3>\n<p>${esc(f.a)}</p>`).join('\n')}

<p>Stai lavorando a un logo o a un’identità visiva e vuoi colori che funzionino sia a schermo sia in stampa? <a href="${cfg.contactUrl}">Scrivimi</a>: ne parliamo.</p>`;

writeFileSync(join(root, 'content/testo-pagina.html'),
`<!-- TESTO DELLA PAGINA "Convertitore colori" — HTML puro, leggibile da Google senza JavaScript.
     Se il tema stampa già il titolo della pagina come H1, togli l'<h1> qui sotto e metti lo stesso testo come titolo della pagina.
     Generato da scripts/build-content.mjs: non modificare a mano, cambia lo script o content/faq.json. -->

<!-- ===== PARTE 1: sopra il tool ===== -->
${part1}

<!-- ===== QUI VA IL BLOCCO DEL TOOL: wordpress/blocco-wordpress.html ===== -->

<!-- ===== PARTE 2: sotto il tool ===== -->
${part2}
`);

const jsonld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': PAGE_URL + '#strumento',
      name: 'Convertitore colori RGB, CMYK, HEX e Pantone',
      url: PAGE_URL,
      description: 'Strumento gratuito che converte un colore tra RGB, CMYK, HEX e Pantone (corrispondenza approssimata) e calcola il colore complementare. Funziona nel browser, senza inviare dati.',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Qualsiasi (nel browser)',
      browserRequirements: 'Richiede JavaScript',
      inLanguage: 'it',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      creator: { '@type': 'Person', name: 'Alessandro Minotto', url: 'https://www.crearecreativita.it/' },
      provider: { '@type': 'Organization', name: 'Creare Creatività', url: 'https://www.crearecreativita.it/' },
    },
    {
      '@type': 'FAQPage',
      '@id': PAGE_URL + '#faq',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

writeFileSync(join(root, 'content/json-ld.html'),
`<!-- Incolla in un widget "HTML" di Elementor in fondo alla pagina (o in Yoast > Schema). Le risposte coincidono con il testo visibile. -->
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
`);

const slug = new URL(PAGE_URL).pathname.replaceAll('/', '');
writeFileSync(join(root, 'content/yoast.md'),
`# Impostazioni Yoast per la pagina "Convertitore colori"

(Generato da scripts/build-content.mjs: non modificare a mano, cambia lo script.)

| Campo | Valore |
|---|---|
| **Frase chiave principale** | ${SEO.keyphrase} |
| **Frasi chiave correlate** | ${SEO.related} |
| **SEO title** (${SEO.title.length}/60) | ${SEO.title} |
| **Meta description** (${SEO.meta.length}/155) | ${SEO.meta} |
| **Slug** | ${slug} |
| **URL finale** | ${PAGE_URL} |
| **Canonical della versione su GitHub Pages** | punta a ${PAGE_URL} (già impostato in frontend/index.html) |

## Note

- La frase chiave "${SEO.keyphrase}" è nell'H1, nel primo paragrafo, nel title, nella meta description e nello slug.
- Il testo sta in HTML normale: Google lo legge anche senza JavaScript. Solo il tool è in JavaScript.
- Imposta la pagina su index, follow e inseriscila nella sitemap.
`);

const warn = [];
if (SEO.title.length > 60) warn.push(`title troppo lungo (${SEO.title.length})`);
if (SEO.meta.length > 155) warn.push(`meta description troppo lunga (${SEO.meta.length})`);
if (warn.length) { console.error('ATTENZIONE Yoast:', warn.join('; ')); process.exitCode = 1; }
console.log(`Generati content/testo-pagina.html, json-ld.html, yoast.md (title ${SEO.title.length}/60, meta ${SEO.meta.length}/155)`);
