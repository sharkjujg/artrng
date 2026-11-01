// ArtRNG fixtures for check.html: one row per case, [rule id, field overrides, expected match].
export const V = '2026-11-01';
export const base = { id: '1', title: 'Sample Work', artist: 'Jane Doe', born: 1900, died: 1980, dateStart: 1700, dateEnd: 1750, dateText: '1700-1750', place: 'Austria', medium: 'Mixed', h: 50, w: 40, d: null,
  gallery: 'Gallery 150', galleryNo: 150, dept: 'Other Dept', type: 'Other Type', style: null, kind: null, colorfulness: 20, hue: 100, light: 50, sat: 10, acquired: 1960, credit: 'Gift',
  publicDomain: false, copyrighted: false, featured: false, multimedia: false, terms: 3, subjects: 0 };

const by = (id, key, rows) => rows.map(([v, want]) => [id, { [key]: v }, want]);
const set = (id, over, rows) => rows.map(([o, want]) => [id, { ...over, ...o }, want]);
const titles = (id, yes, no) => [...yes.map((t) => [id, { title: t }, true]), ...no.map((t) => [id, { title: t }, false]), [id, { title: undefined }, false], [id, { title: '  ' }, false]];
const exact = (rows, key, tag) => rows.flatMap(([id, v]) => [[id, { [key]: v }, true], [id, { [key]: 'Something Else' }, false], [id, { [key]: null }, false]]);
const boolRule = (id, key) => [[id, { [key]: true }, true], [id, { [key]: false }, false], [id, { [key]: 'yes' }, false], [id, { [key]: null }, false]];

export const cases = [
  ...exact([['dept-applied-arts-europe', 'Applied Arts of Europe'], ['dept-arts-asia', 'Arts of Asia'], ['dept-painting-sculpture-europe', 'Painting and Sculpture of Europe'], ['dept-prints-drawings', 'Prints and Drawings'],
    ['dept-modern-art', 'Modern Art'], ['dept-ancient', 'Arts of Greece, Rome, and Byzantium'], ['dept-americas', 'Arts of the Americas'], ['dept-contemporary', 'Contemporary Art']], 'dept'),
  ...exact([['type-painting', 'Painting'], ['type-sculpture', 'Sculpture'], ['type-vessel', 'Vessel'], ['type-ritual-object', 'Religious/Ritual Object'], ['type-ceramics', 'Ceramics'], ['type-arms', 'Arms'],
    ['type-armor', 'Armor'], ['type-drawing', 'Drawing and Watercolor']], 'type'),
  ...exact([['origin-china', 'China'], ['origin-france', 'France'], ['origin-united-states', 'United States'], ['origin-italy', 'Italy'], ['origin-germany', 'Germany'], ['origin-japan', 'Japan'],
    ['origin-england', 'England'], ['origin-spain', 'Spain']], 'place'),

  ...by('era-antiquity', 'dateStart', [[-3000, true], [499, true], [500, false], [null, false], ['x', false], [-9000, false]]),
  ...by('era-middle-ages', 'dateStart', [[500, true], [1399, true], [1400, false], [499, false], [null, false]]),
  ...by('era-renaissance', 'dateStart', [[1400, true], [1599, true], [1600, false], [1399, false], [null, false]]),
  ...by('era-baroque', 'dateStart', [[1600, true], [1799, true], [1800, false], [1599, false], [null, false]]),
  ...by('era-nineteenth', 'dateStart', [[1800, true], [1899, true], [1900, false], [1799, false], [null, false]]),
  ...by('era-twentieth', 'dateStart', [[1900, true], [1999, true], [2000, false], [1899, false], [null, false]]),
  ...by('era-twenty-first', 'dateStart', [[2000, true], [2026, true], [1999, false], [null, false]]),
  ...by('over-a-thousand-years', 'dateEnd', [[1026, true], [-500, true], [1027, false], [2000, false], [null, false]]),
  ...by('brand-new-work', 'dateStart', [[2015, true], [2026, true], [2014, false], [null, false]]),
  ...set('single-year-date', {}, [[{ dateStart: 1900, dateEnd: 1900 }, true], [{ dateStart: 1900, dateEnd: 1901 }, false], [{ dateStart: 1900, dateEnd: null }, false], [{ dateStart: null, dateEnd: null }, false]]),
  ...set('wide-date-range', {}, [[{ dateStart: 1500, dateEnd: 1600 }, true], [{ dateStart: 1500, dateEnd: 1599 }, false], [{ dateStart: 1500, dateEnd: null }, false], [{ dateStart: null, dateEnd: 1600 }, false]]),

  ...set('miniature-work', {}, [[{ h: 5, w: null, d: null }, true], [{ h: 5.1, w: null, d: null }, false], [{ h: null, w: null, d: null }, false], [{ h: 0, w: null, d: null }, false], [{ h: 5, w: 6, d: null }, false]]),
  ...set('small-work', {}, [[{ h: 10, w: 4, d: null }, true], [{ h: 10.1, w: null, d: null }, false], [{ h: null, w: null, d: null }, false]]),
  ...set('large-work', {}, [[{ h: 10, w: 200, d: null }, true], [{ h: 199, w: null, d: null }, false], [{ h: null, w: null, d: null }, false]]),
  ...set('monumental-work', {}, [[{ h: 1, w: 1, d: 400 }, true], [{ h: 399, w: null, d: null }, false], [{ h: null, w: null, d: null }, false]]),
  ...set('wide-format', {}, [[{ h: 10, w: 21 }, true], [{ h: 10, w: 20 }, false], [{ h: null, w: 30 }, false], [{ h: 10, w: null }, false]]),
  ...set('tall-format', {}, [[{ h: 21, w: 10 }, true], [{ h: 20, w: 10 }, false], [{ h: 30, w: null }, false], [{ h: null, w: 10 }, false]]),

  ...by('vivid-colour', 'colorfulness', [[50, true], [49.9, false], [null, false], [-1, false]]),
  ...by('colourless', 'colorfulness', [[0, true], [0.1, false], [null, false], [undefined, false]]),
  ...by('dark-work', 'light', [[20, true], [0, true], [21, false], [null, false], [101, false]]),
  ...by('light-work', 'light', [[80, true], [100, true], [79, false], [null, false]]),
  ...set('blue-toned', {}, [[{ hue: 200, sat: 25 }, true], [{ hue: 260, sat: 25 }, true], [{ hue: 261, sat: 25 }, false], [{ hue: 199, sat: 25 }, false], [{ hue: 230, sat: 24 }, false], [{ hue: null, sat: 50 }, false], [{ hue: 230, sat: null }, false]]),
  ...set('red-toned', {}, [[{ hue: 15, sat: 30 }, true], [{ hue: 345, sat: 30 }, true], [{ hue: 0, sat: 30 }, true], [{ hue: 16, sat: 30 }, false], [{ hue: 344, sat: 30 }, false], [{ hue: 0, sat: 29 }, false], [{ hue: null, sat: 50 }, false]]),

  ...set('single-digit-gallery', {}, [[{ galleryNo: 9 }, true], [{ galleryNo: 1 }, true], [{ galleryNo: 10 }, false], [{ galleryNo: 0 }, false], [{ galleryNo: null }, false]]),
  ...set('round-gallery', {}, [[{ galleryNo: 100 }, true], [{ galleryNo: 200 }, true], [{ galleryNo: 150 }, false], [{ galleryNo: 0 }, false], [{ galleryNo: null }, false]]),
  ...set('named-space', {}, [[{ gallery: 'North Garden' }, true], [{ gallery: 'Research Center Franke Reading Room' }, true], [{ gallery: 'Gallery 101A' }, false], [{ gallery: 'gallery 12' }, false], [{ gallery: null }, false]]),

  ...by('early-collection', 'acquired', [[1929, true], [1888, true], [1930, false], [1700, false], [null, false]]),
  ...by('recent-acquisition', 'acquired', [[2000, true], [2026, true], [1999, false], [null, false]]),
  ...by('new-acquisition', 'acquired', [[2015, true], [2014, false], [null, false]]),

  ...[['oil-on-canvas', 'oil on canvas'], ['bronze', 'bronze'], ['porcelain', 'porcelain'], ['silver', 'silver'], ['jade', 'jade'], ['wood', 'wood'], ['steel', 'steel'], ['glass', 'glass'], ['gold', 'gold'], ['ivory', 'ivory']]
    .flatMap(([id, w]) => [[`material-${id}`, { medium: `Carved ${w}, mounted` }, true], [`material-${id}`, { medium: `${w.toUpperCase()}` }, true], [`material-${id}`, { medium: `${w}y thing` }, false], [`material-${id}`, { medium: 'Mixed' }, false], [`material-${id}`, { medium: null }, false]]),
  ['material-wood', { medium: 'Woodcut on paper' }, false], ['material-silver', { medium: 'Gelatin silver print' }, true],

  ...by('unattributed-work', 'artist', [[null, true], ['  ', true], ['Jane Doe', false]]),
  ...by('named-maker', 'artist', [['Jane Doe', true], [null, false], ['  ', false]]),
  ...set('long-lived-artist', {}, [[{ born: 1800, died: 1885 }, true], [{ born: 1800, died: 1884 }, false], [{ born: 1800, died: null }, false], [{ born: null, died: 1885 }, false], [{ born: 900, died: 1000 }, false]]),
  ...set('short-lived-artist', {}, [[{ born: 1900, died: 1940 }, true], [{ born: 1900, died: 1941 }, false], [{ born: 1900, died: 1899 }, false], [{ born: 1900, died: null }, false], [{ born: null, died: null }, false]]),

  ...boolRule('public-domain', 'publicDomain'), ...boolRule('in-copyright', 'copyrighted'), ...boolRule('featured-work', 'featured'), ...boolRule('multimedia-guide', 'multimedia'),

  ...titles('untitled-work', ['Untitled (Blue)', 'Untitled'], ['Untitledness', 'Titled']),
  ...titles('portrait-title', ['Portrait of a Man', 'Self-Portrait'], ['Portraits', 'Portraiture']),
  ...titles('saint-title', ['Saint Jerome', 'St. Anne', 'Saints and Sinners'], ['Stone', 'Constant', 'Stay']),
  ...titles('madonna-title', ['Madonna and Child', 'The Virgin'], ['Madonnas', 'Virginia']),
  ...titles('short-title', ['Bird', 'Abcdefgh'], ['Abcdefghi']),
  ...titles('long-title', ['x'.repeat(60)], ['x'.repeat(59)]),
  ...titles('numbered-title', ['Study 2', 'Tableau 14'], ['Study']),
];

export function poolChecks(raw, pool, ok) {
  const ms = raw.members;
  ok('object ids are numeric strings and ascend', ms.every((m, i) => /^[1-9]\d*$/.test(m.id) && (i === 0 || +m.id > +ms[i - 1].id)));
  ok('every work has a title and an artwork type', ms.every((m) => typeof m.title === 'string' && m.title.trim() && typeof m.type === 'string' && m.type.trim()));
  ok('dates are plausible years and never run backwards', ms.every((m) => (m.dateStart === null || (m.dateStart >= -6000 && m.dateStart <= 2100)) && (m.dateStart === null || m.dateEnd === null || m.dateStart <= m.dateEnd)));
  ok('recorded dimensions are positive centimetres', ms.every((m) => ['h', 'w', 'd'].every((k) => m[k] === null || (m[k] > 0 && m[k] < 5000))));
  ok('colour measures are in range', ms.every((m) => (m.hue === null || (m.hue >= 0 && m.hue <= 360)) && (m.light === null || (m.light >= 0 && m.light <= 100)) && (m.sat === null || (m.sat >= 0 && m.sat <= 100))));
  ok('artist years are plain and in order', ms.every((m) => (m.born === null || (m.born > 1000 && m.born < 2100)) && (m.died === null || m.born === null || m.died >= m.born)));
  ok('accession years are real', ms.every((m) => m.acquired === null || (m.acquired >= 1800 && m.acquired <= 2100)));
  ok('no description text was copied into the pool (it is licensed differently)', ms.every((m) => !('description' in m)));
  ok('the pool is large enough to be a game (>= 1000)', pool.n >= 1000);
}
