# ArtRNG

A daily artwork discovery game: roll once per UTC day, draw one artwork from those on view at the Art Institute of Chicago, and see which badges make its catalog record unusual. A sibling of CinemaRNG, BrickRNG, ExoRNG, QuakeRNG, PeakRNG, AsteroidRNG, BookRNG, SpeciesRNG, AirportRNG, CityRNG, OpeningRNG, CometRNG and DinoRNG on the same engine.

**This is a prototype.** Catalog facts are a snapshot of the [Art Institute of Chicago](https://www.artic.edu) public data dump. There is no backend, so results live in the player's browser. **No images are shown**: the picture on a result is a generated frame drawn from the work's recorded size and dominant colour. Unofficial fan project, not affiliated with or endorsed by the Art Institute of Chicago.

## Data and licence

- The museum's API states, in every response, that all fields except `description` are released under Creative Commons Zero (CC0), and its open access page says the object metadata is CC0 and asks for a caption crediting the Art Institute of Chicago. Each result shows that caption ("Artist, Title, Date, The Art Institute of Chicago").
- `description` (licensed CC BY) is never read, and a test in `tools/test_import.py` and a pool check in `check.html` fail if it ever reaches the pool.
- The museum asks bulk users to use its [data dump](https://api.artic.edu/docs/) instead of scraping the API, so the pool is built from that one download (about 130 MB, from the museum's own bucket), not from thousands of API requests.
- **One thing I could not read:** the licence text points to the museum's Terms and Conditions (https://www.artic.edu/terms), and that page returned an error (HTTP 403) to my download, so I have not read it. This is a free, non-commercial fan project that shows no images and credits the museum. If those terms do not allow this use, replace `data/pool-v1.json`.

## What is in the pool

Works with a title that the museum's data marks as on view on the day of the snapshot (3,538). What hangs on the walls changes, so this is one day's list.

## What is built

| Area | Status |
| --- | --- |
| Daily roll, unbiased secure draw, one per UTC day, retry-safe | Done, browser-local (the day comes from the host's `Date` header, not the device clock) |
| 77 badge rules, families, RP = 100 / p, overall rarity tiers, tie rules | Done, tested in `rules.js`; `check.html` fails if any work earns no badge |
| Animated reveal, badges appearing from worst to best, reduced-motion aware | Done |
| Achievements derived from your rolls, with goals scaled to the pool size (2,065 for 3,538 works) | Done (`achievements.js`) |
| Badge catalog, badge pages, levels, history, export, delete, pool page | Done |
| Optional sign-in and leaderboards | Built, switched off until the backend is deployed (see the `rng-accounts` design) |

## Run it

No build step.

```
python -m http.server 8765
```

Open <http://localhost:8765>. Open `/check.html` for the self-check; its title becomes `PASS` or `FAIL n`.

## Layout

- `engine.js`, `achievements.js`, `account.js` generic scoring, tiers, sampling, day helpers, achievements and the optional account client (shared with sibling RNG games)
- `rules.js` this game's badge rules; `site.js` its names, copy, art and shelves; `fixtures.js` rule fixtures for `check.html`, plus pool checks (plausible dates, positive sizes, colour ranges, no description text)
- `app.js`, `index.html`, `style.css` the site (hash routes, so it works on any static host)
- `data/pool-v1.json` the published pool; `tools/build_pool.py` streams the museum's `artic-api-data.tar.bz2` dump into it, and `tools/test_import.py` checks the conversion. A blank value stays null so it never earns a badge; an impossible year (the museum's data has one, 1486490 for "1486-90") is treated as unknown

## Publishing

GitHub Pages serves the repository root from `main`. Push to `main` to update the site.
