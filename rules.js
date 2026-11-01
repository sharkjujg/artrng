// ArtRNG badge rules. Each rule is a deterministic predicate over known fields: a value the catalog does not have never matches.
// test(m, poolDate) and evidence(m, poolDate) read the prepared member from prep().

export const RULESET = '1';

export const norm = (s) => s.normalize('NFKC').toLowerCase();

const text = (x) => (typeof x === 'string' && x.trim() ? x.trim() : null);
const posn = (x) => (typeof x === 'number' && Number.isFinite(x) && x > 0 ? x : null);
const year = (x) => (Number.isInteger(x) && x >= -6000 && x <= 2100 ? x : null);
const pct = (x, hi) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= hi ? x : null);

export function prep(raw) {
  const title = text(raw.title), dims = [posn(raw.h), posn(raw.w), posn(raw.d), posn(raw.diameter)].filter((x) => x !== null);
  const born = Number.isInteger(raw.born) && raw.born > 1000 && raw.born < 2100 ? raw.born : null;
  const died = Number.isInteger(raw.died) && raw.died > 1000 && raw.died < 2100 ? raw.died : null;
  return {
    ...raw,
    t: title ? norm(title) : null, artist: text(raw.artist), born, died, lived: born !== null && died !== null && died >= born ? died - born : null,
    dateStart: year(raw.dateStart), dateEnd: year(raw.dateEnd), place: text(raw.place), dept: text(raw.dept), type: text(raw.type),
    medium: text(raw.medium) ? norm(raw.medium) : null, h: posn(raw.h), w: posn(raw.w), diameter: posn(raw.diameter), maxDim: dims.length ? Math.max(...dims) : null,
    gallery: text(raw.gallery), galleryNo: Number.isInteger(raw.galleryNo) && raw.galleryNo > 0 ? raw.galleryNo : null,
    colorfulness: pct(raw.colorfulness, 400), hue: pct(raw.hue, 360), light: pct(raw.light, 100), sat: pct(raw.sat, 100),
    acquired: Number.isInteger(raw.acquired) && raw.acquired >= 1800 && raw.acquired <= 2100 ? raw.acquired : null,
    publicDomain: raw.publicDomain === true, copyrighted: raw.copyrighted === true, featured: raw.featured === true, multimedia: raw.multimedia === true,
  };
}

const fmt = (n) => n.toLocaleString('en');
const cm = (x) => `${Number(x.toPrecision(3))} cm`;
const nm = (m) => `"${m.title}"`;
const dated = (m) => `${m.title} dates from ${m.dateStart}${m.dateEnd !== null && m.dateEnd !== m.dateStart ? ` to ${m.dateEnd}` : ''}`;
const when = (lo, hi) => (m) => m.dateStart !== null && m.dateStart >= lo && m.dateStart < hi;
const size = (m) => `${m.title} measures ${cm(m.maxDim)} at its largest`;
const word = (re) => (m) => m.t !== null && re.test(m.t);
const hue = (m) => `${m.title} has a dominant hue of ${m.hue}° at ${m.sat}% saturation`;

const DEPARTMENTS = [['dept-applied-arts-europe', 'Applied Arts of Europe'], ['dept-arts-asia', 'Arts of Asia'], ['dept-painting-sculpture-europe', 'Painting and Sculpture of Europe'],
  ['dept-prints-drawings', 'Prints and Drawings'], ['dept-modern-art', 'Modern Art'], ['dept-ancient', 'Arts of Greece, Rome, and Byzantium'], ['dept-americas', 'Arts of the Americas'], ['dept-contemporary', 'Contemporary Art']];
const TYPES = [['type-painting', 'Painting'], ['type-sculpture', 'Sculpture'], ['type-vessel', 'Vessel'], ['type-ritual-object', 'Religious/Ritual Object'], ['type-ceramics', 'Ceramics'],
  ['type-arms', 'Arms'], ['type-armor', 'Armor'], ['type-drawing', 'Drawing and Watercolor']];
const PLACES = [['origin-china', 'China'], ['origin-france', 'France'], ['origin-united-states', 'United States'], ['origin-italy', 'Italy'], ['origin-germany', 'Germany'],
  ['origin-japan', 'Japan'], ['origin-england', 'England'], ['origin-spain', 'Spain']];
const MATERIALS = [['oil-on-canvas', 'Oil on Canvas', 'oil on canvas'], ['bronze', 'Bronze', 'bronze'], ['porcelain', 'Porcelain', 'porcelain'], ['silver', 'Silver', 'silver'], ['jade', 'Jade', 'jade'],
  ['wood', 'Wood', 'wood'], ['steel', 'Steel', 'steel'], ['glass', 'Glass', 'glass'], ['gold', 'Gold', 'gold'], ['ivory', 'Ivory', 'ivory']];

export const RULES = [
  ...DEPARTMENTS.map(([id, dept]) => ({ id, name: dept.replace(', and ', ' and '), family: 'Department', rule: `Curatorial department: ${dept}`, test: (m) => m.dept === dept, evidence: (m) => `${m.title} belongs to ${dept}` })),
  ...TYPES.map(([id, type]) => ({ id, name: type.replace('/', ' or '), family: 'Artwork type', rule: `Artwork type: ${type}`, test: (m) => m.type === type, evidence: (m) => `${m.title} is catalogued as ${type.toLowerCase()}` })),

  { id: 'era-antiquity', name: 'Antiquity', family: 'Era', rule: 'Made before the year 500', test: when(-6000, 500), evidence: dated },
  { id: 'era-middle-ages', name: 'Middle Ages', family: 'Era', rule: 'Made from 500 to 1399', test: when(500, 1400), evidence: dated },
  { id: 'era-renaissance', name: 'Renaissance', family: 'Era', rule: 'Made from 1400 to 1599', test: when(1400, 1600), evidence: dated },
  { id: 'era-baroque', name: 'Baroque to Enlightenment', family: 'Era', rule: 'Made from 1600 to 1799', test: when(1600, 1800), evidence: dated },
  { id: 'era-nineteenth', name: 'Nineteenth Century', family: 'Era', rule: 'Made from 1800 to 1899', test: when(1800, 1900), evidence: dated },
  { id: 'era-twentieth', name: 'Twentieth Century', family: 'Era', rule: 'Made from 1900 to 1999', test: when(1900, 2000), evidence: dated },
  { id: 'era-twenty-first', name: 'Twenty-First Century', family: 'Era', rule: 'Made in 2000 or later', test: when(2000, 2101), evidence: dated },
  { id: 'over-a-thousand-years', name: 'Over a Thousand Years Old', family: 'Age', rule: 'Finished a thousand or more years before the pool was captured', test: (m, poolDate) => m.dateEnd !== null && m.dateEnd <= Number(String(poolDate).slice(0, 4)) - 1000, evidence: dated },
  { id: 'brand-new-work', name: 'Brand New', family: 'Age', rule: 'Made in 2015 or later', test: (m) => m.dateStart !== null && m.dateStart >= 2015, evidence: dated },
  { id: 'single-year-date', name: 'Single-Year Date', family: 'Date precision', rule: 'The catalog gives one exact year', test: (m) => m.dateStart !== null && m.dateStart === m.dateEnd, evidence: dated },
  { id: 'wide-date-range', name: 'Wide Date Range', family: 'Date precision', rule: 'The catalog dates it within a span of 100 years or more', test: (m) => m.dateStart !== null && m.dateEnd !== null && m.dateEnd - m.dateStart >= 100, evidence: dated },

  ...PLACES.map(([id, place]) => ({ id, name: place, family: 'Origin', rule: `Place of origin: ${place}`, test: (m) => m.place === place, evidence: (m) => `${m.title} comes from ${place}` })),

  { id: 'miniature-work', name: 'Miniature', family: 'Size', rule: 'Largest recorded dimension of 5 cm or less', test: (m) => m.maxDim !== null && m.maxDim <= 5, evidence: size },
  { id: 'small-work', name: 'Small Work', family: 'Size', rule: 'Largest recorded dimension of 10 cm or less', test: (m) => m.maxDim !== null && m.maxDim <= 10, evidence: size },
  { id: 'large-work', name: 'Large Work', family: 'Size', rule: 'Largest recorded dimension of 200 cm or more', test: (m) => m.maxDim !== null && m.maxDim >= 200, evidence: size },
  { id: 'monumental-work', name: 'Monumental', family: 'Size', rule: 'Largest recorded dimension of 400 cm or more', test: (m) => m.maxDim !== null && m.maxDim >= 400, evidence: size },
  { id: 'wide-format', name: 'Wide Format', family: 'Shape', rule: 'At least twice as wide as it is high', test: (m) => m.h !== null && m.w !== null && m.w > 2 * m.h, evidence: (m) => `${m.title} is ${cm(m.w)} wide and ${cm(m.h)} high` },
  { id: 'tall-format', name: 'Tall Format', family: 'Shape', rule: 'At least twice as high as it is wide', test: (m) => m.h !== null && m.w !== null && m.h > 2 * m.w, evidence: (m) => `${m.title} is ${cm(m.h)} high and ${cm(m.w)} wide` },

  { id: 'vivid-colour', name: 'Vivid Colour', family: 'Colourfulness', rule: 'The museum’s colourfulness measure is 50 or more', test: (m) => m.colorfulness !== null && m.colorfulness >= 50, evidence: (m) => `${m.title} has a colourfulness of ${Number(m.colorfulness.toPrecision(3))}` },
  { id: 'colourless', name: 'Colourless', family: 'Colourfulness', rule: 'The museum’s colourfulness measure is exactly 0', test: (m) => m.colorfulness === 0, evidence: (m) => `${m.title} has a colourfulness of 0` },
  { id: 'dark-work', name: 'Dark Work', family: 'Lightness', rule: 'Dominant colour at 20% lightness or less', test: (m) => m.light !== null && m.light <= 20, evidence: (m) => `${m.title} has a dominant colour at ${m.light}% lightness` },
  { id: 'light-work', name: 'Light Work', family: 'Lightness', rule: 'Dominant colour at 80% lightness or more', test: (m) => m.light !== null && m.light >= 80, evidence: (m) => `${m.title} has a dominant colour at ${m.light}% lightness` },
  { id: 'blue-toned', name: 'Blue-Toned', family: 'Hue', rule: 'Dominant hue from 200 to 260 degrees at 25% saturation or more', test: (m) => m.hue !== null && m.sat !== null && m.hue >= 200 && m.hue <= 260 && m.sat >= 25, evidence: hue },
  { id: 'red-toned', name: 'Red-Toned', family: 'Hue', rule: 'Dominant hue within 15 degrees of red at 30% saturation or more', test: (m) => m.hue !== null && m.sat !== null && (m.hue <= 15 || m.hue >= 345) && m.sat >= 30, evidence: hue },

  { id: 'single-digit-gallery', name: 'Single-Digit Gallery', family: 'Gallery', rule: 'Hangs in a gallery numbered 1 to 9', test: (m) => m.galleryNo !== null && m.galleryNo < 10, evidence: (m) => `${m.title} is in ${m.gallery}` },
  { id: 'round-gallery', name: 'Round-Number Gallery', family: 'Gallery', rule: 'Hangs in a gallery numbered a whole multiple of 100', test: (m) => m.galleryNo !== null && m.galleryNo % 100 === 0, evidence: (m) => `${m.title} is in ${m.gallery}` },
  { id: 'named-space', name: 'Named Space', family: 'Gallery', rule: 'Shown in a named space rather than a numbered gallery', test: (m) => m.gallery !== null && !/^gallery\b/i.test(m.gallery), evidence: (m) => `${m.title} is in ${m.gallery}` },

  { id: 'early-collection', name: 'Early Collection', family: 'Acquired', rule: 'Accessioned before 1930', test: (m) => m.acquired !== null && m.acquired < 1930, evidence: (m) => `${m.title} entered the collection in ${m.acquired}` },
  { id: 'recent-acquisition', name: 'Recent Acquisition', family: 'Acquired', rule: 'Accessioned in 2000 or later', test: (m) => m.acquired !== null && m.acquired >= 2000, evidence: (m) => `${m.title} entered the collection in ${m.acquired}` },
  { id: 'new-acquisition', name: 'New Acquisition', family: 'Acquired', rule: 'Accessioned in 2015 or later', test: (m) => m.acquired !== null && m.acquired >= 2015, evidence: (m) => `${m.title} entered the collection in ${m.acquired}` },

  ...MATERIALS.map(([id, name, w]) => ({ id: `material-${id}`, name, family: 'Material', rule: `The medium line mentions the word "${w}"`, test: (m) => m.medium !== null && new RegExp('\\b' + w + '\\b').test(m.medium), evidence: (m) => `${m.title} is made of: ${m.medium}` })),

  { id: 'unattributed-work', name: 'Unattributed', family: 'Maker', rule: 'No individual artist is recorded', test: (m) => m.artist === null, evidence: (m) => `${m.title} has no individual artist recorded` },
  { id: 'named-maker', name: 'Named Artist', family: 'Maker', rule: 'An individual artist is recorded', test: (m) => m.artist !== null, evidence: (m) => `${m.title} is by ${m.artist}` },
  { id: 'long-lived-artist', name: 'Long-Lived Artist', family: 'Artist lifespan', rule: 'The artist lived 85 years or more (both years plainly recorded)', test: (m) => m.lived !== null && m.lived >= 85, evidence: (m) => `${m.artist} lived ${m.lived} years (${m.born} to ${m.died})` },
  { id: 'short-lived-artist', name: 'Short-Lived Artist', family: 'Artist lifespan', rule: 'The artist lived 40 years or fewer (both years plainly recorded)', test: (m) => m.lived !== null && m.lived <= 40, evidence: (m) => `${m.artist} lived ${m.lived} years (${m.born} to ${m.died})` },

  { id: 'public-domain', name: 'Public Domain', family: 'Copyright', rule: 'The museum lists the work as public domain', test: (m) => m.publicDomain, evidence: (m) => `${m.title} is listed as public domain` },
  { id: 'in-copyright', name: 'In Copyright', family: 'Copyright', rule: 'The record carries a copyright notice', test: (m) => m.copyrighted, evidence: (m) => `${m.title} carries a copyright notice` },
  { id: 'featured-work', name: 'Featured Work', family: 'Featured', rule: 'The museum boosts it in its own search results', test: (m) => m.featured, evidence: (m) => `${m.title} is a featured work` },
  { id: 'multimedia-guide', name: 'Multimedia Guide', family: 'Multimedia', rule: 'Has multimedia resources attached', test: (m) => m.multimedia, evidence: (m) => `${m.title} has multimedia resources` },

  { id: 'untitled-work', name: 'Untitled', family: 'Title word', rule: 'Title contains "untitled"', test: word(/\buntitled\b/), evidence: nm },
  { id: 'portrait-title', name: 'Portrait', family: 'Title word', rule: 'Title contains "portrait"', test: word(/\bportrait\b/), evidence: nm },
  { id: 'saint-title', name: 'Saint', family: 'Title word', rule: 'Title contains "Saint" or "St."', test: word(/\b(saint|st\.)/), evidence: nm },
  { id: 'madonna-title', name: 'Madonna', family: 'Title word', rule: 'Title contains "Madonna" or "Virgin"', test: word(/\b(madonna|virgin)\b/), evidence: nm },
  { id: 'short-title', name: 'Short Title', family: 'Title length', rule: 'Title of 8 characters or fewer', test: (m) => m.t !== null && Array.from(m.t).length <= 8, evidence: (m) => `${nm(m)} has ${Array.from(m.t).length} characters` },
  { id: 'long-title', name: 'Long Title', family: 'Title length', rule: 'Title of 60 characters or more', test: (m) => m.t !== null && Array.from(m.t).length >= 60, evidence: (m) => `${nm(m)} has ${fmt(Array.from(m.t).length)} characters` },
  { id: 'numbered-title', name: 'Numbered Title', family: 'Title digits', rule: 'Title contains a digit 0-9', test: word(/[0-9]/), evidence: (m) => `${nm(m)} contains a digit` },
];
