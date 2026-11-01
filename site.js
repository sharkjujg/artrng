// Everything specific to ArtRNG: names, copy, card art, and which facts the result card shows. app.js is generic.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n) => n.toLocaleString('en');
const band = (x, cuts) => cuts.find(([max]) => x < max)[1];
const unknown = 'not recorded';
const cm = (x) => `${Number(x.toPrecision(3))}`;
const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10 < 4 ? n % 10 : 0]}`;
const yr = (y) => (y < 0 ? `${-y} BCE` : String(y));
const dateOf = (m) => m.dateText ?? (m.dateStart !== null ? (m.dateEnd !== null && m.dateEnd !== m.dateStart ? `${yr(m.dateStart)} to ${yr(m.dateEnd)}` : yr(m.dateStart)) : null);
const sizeText = (m) => [m.h, m.w, m.d].every((x) => x === null) ? unknown : [m.h, m.w, m.d].filter((x) => x !== null).map(cm).join(' × ') + ' cm (height, width, depth as recorded)';

export default {
  key: 'artrng',
  name: 'ArtRNG',
  pageTitle: 'ArtRNG: a daily artwork discovery game',
  noun: 'artwork', nouns: 'artworks', thing: 'Artwork',
  worldNote: 'every artwork in the world',
  repo: 'https://github.com/sharkjujg/artrng',
  headline: 'Discover an artwork. Once a day.',
  intro: (n) => `Roll once to draw one artwork from the <b>${fmt(n)}</b> on view at the Art Institute of Chicago when this snapshot was taken. Every work has the same 1-in-${fmt(n)} chance, masterpiece or armor. Badges explain what is unusual about its record, and rarer badges earn more rarity points (RP). The daily limit resets at 00:00 UTC.`,
  notice: 'Prototype: the catalog facts are real (Art Institute of Chicago, CC0 metadata), but no images are shown, there are no accounts yet, and your results are saved only in this browser. <a href="#/about">What that means</a>',
  header: (m) => ({ title: m.title, sub: [m.artist ?? 'Artist not recorded', dateOf(m)].filter(Boolean).join(' · ') }),
  label: (m) => m.title,
  shelves: (m) => [
    ...(m.dept ? [['Department', m.dept]] : []), ['Type', m.type],
    ...(m.dateStart !== null ? [['Century', m.dateStart < 0 ? 'Before the common era' : `${ordinal(Math.floor(m.dateStart / 100) + 1)} century`]] : []),
    ...(m.place ? [['Place of origin', m.place]] : []),
    ...(m.gallery ? [['Gallery', m.gallery]] : []),
    ...(m.maxDim !== null ? [['Size', band(m.maxDim, [[10, 'Under 10 cm'], [30, '10 to 29 cm'], [100, '30 to 99 cm'], [200, '1 to 2 m'], [Infinity, 'Over 2 m']])]] : []),
    ...(m.acquired !== null ? [['Accessioned', `${Math.floor(m.acquired / 10) * 10}s`]] : []),
    ['Maker', m.artist ? 'Named artist' : 'No individual artist recorded'], ['Copyright', m.publicDomain ? 'Public domain' : 'Not listed as public domain'],
  ],
  facts: (m) => [
    ['Artist', m.artist ? `${m.artist}${m.born !== null ? ` (${m.born}${m.died !== null ? `–${m.died}` : ' to the present'})` : ''}` : 'no individual artist recorded'],
    ['Date', dateOf(m) ?? unknown], ['Place of origin', m.place ?? unknown], ['Medium', m.medium ?? unknown], ['Dimensions', sizeText(m)],
    ['Department', m.dept ?? unknown], ['Type', m.type], ['Classification', m.kind ?? unknown], ['Style', m.style ?? unknown], ['Gallery', m.gallery ?? 'not on a numbered gallery wall'],
    ['Accessioned', m.acquired !== null ? String(m.acquired) : unknown], ['Credit line', m.credit ?? unknown],
    ['Dominant colour', m.hue !== null ? `hue ${m.hue}°, saturation ${m.sat}%, lightness ${m.light}%` : unknown],
    ['Museum caption', `${m.artist ?? 'Unknown artist'}, ${m.title}, ${dateOf(m) ?? 'undated'}, The Art Institute of Chicago`],
    ['Source', `Art Institute of Chicago object ${m.id}`, `https://www.artic.edu/artworks/${encodeURIComponent(m.id)}`],
  ],
  art(m) { // original frame: its proportions are the work's recorded height and width, its fill is the work's dominant colour; it never shows the artwork and never affects scoring
    const ratio = m.h !== null && m.w !== null ? Math.max(0.3, Math.min(3.3, m.w / m.h)) : 1;
    const bw = ratio >= 1 ? 62 : 62 * ratio, bh = ratio >= 1 ? 62 / ratio : 62, x = 50 - bw / 2, y = 44 - bh / 2;
    const fill = m.hue !== null ? `hsl(${m.hue} ${Math.max(18, m.sat ?? 30)}% ${Math.max(22, Math.min(78, m.light ?? 50))}%)` : '#8a8479';
    return `<svg class="avatar" viewBox="0 0 100 100" role="img" aria-label="Generated frame for the artwork, drawn from its recorded size and dominant colour. Not an image of the artwork.">
      <rect width="100" height="100" rx="8" fill="#26231f"/>
      <rect x="${(x - 3).toFixed(1)}" y="${(y - 3).toFixed(1)}" width="${(bw + 6).toFixed(1)}" height="${(bh + 6).toFixed(1)}" fill="#b08d4e"/><rect x="${(x - 1).toFixed(1)}" y="${(y - 1).toFixed(1)}" width="${(bw + 2).toFixed(1)}" height="${(bh + 2).toFixed(1)}" fill="#e9dcc0"/>
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${fill}"/>
      <text x="50" y="86" text-anchor="middle" font-family="system-ui,sans-serif" font-size="5.2" font-weight="700" letter-spacing=".6" fill="#d9cdb2">${m.h !== null && m.w !== null ? `${esc(cm(m.h))} × ${esc(cm(m.w))} CM` : 'SIZE NOT RECORDED'}</text>
      <text x="50" y="94" text-anchor="middle" font-family="system-ui,sans-serif" font-size="4.4" letter-spacing=".6" fill="#8e8672">GENERATED FRAME</text></svg>`;
  },
  poolNotice: 'Every artwork comes from the <a href="https://api.artic.edu/docs/">Art Institute of Chicago data dump</a>, whose open access policy states that object metadata is CC0: the works the museum’s data marks as on view on the day this snapshot was taken, with a title. What hangs on the walls changes, so this is one day’s list, not the whole collection or a permanent display. No images and no descriptions are used. A blank field in the museum’s record stays blank and never earns a badge.',
  poolExtra(pool) {
    const tally = (get) => { const c = new Map(); for (const m of pool.members) for (const v of get(m)) c.set(v, (c.get(v) || 0) + 1); return [...c]; };
    const table = (title, rows) => `<table><thead><tr><th>${title}</th><th class="n">Works</th></tr></thead><tbody>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${fmt(v)}</td></tr>`).join('')}</tbody></table>`;
    const top = (rows, k) => rows.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, k);
    return `<h2>What is in the pool</h2><p class="small muted">Disclosed because a badge is only rare relative to this mix.</p>
      ${table('Department', top(tally((m) => (m.dept ? [m.dept] : [])), 10))}${table('Artwork type', top(tally((m) => [m.type]), 10))}${table('Place of origin', top(tally((m) => (m.place ? [m.place] : [])), 10))}`;
  },
  aboutData: `<h2>Where the facts come from</h2>
    <p>Title, artist, dates, place of origin, medium, dimensions, department, type, gallery, accession number, credit line, copyright status, the colour measures and the descriptive-term counts come from the <a href="https://api.artic.edu/docs/">Art Institute of Chicago</a> public data dump (the museum asks bulk users to use the dump rather than its API). The museum states that its object metadata is released under Creative Commons Zero (CC0) and asks for a caption crediting the Art Institute of Chicago; each result shows that caption. The one field the museum licenses differently, the long description text, is never used, and no image is shown: the picture on a result is a generated frame drawn from the recorded size and dominant colour. "Colourfulness" and the dominant colour are the museum's own measures of its image, not of the object itself. A missing value is shown as "not recorded" and never earns a badge. Artist birth and death years are read only when the museum writes them plainly.</p>`,
  terms: 'It is not affiliated with or endorsed by the Art Institute of Chicago. Badges describe how a work is catalogued and displayed, not its quality, value or importance.',
};
