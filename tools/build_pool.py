#!/usr/bin/env python3
"""Build data/pool-v1.json from the Art Institute of Chicago's public data dump: artworks that are on view, one entry each.

The museum asks scrapers to use its data dump instead of the API (https://api.artic.edu/docs/ , "Data Dumps"), and states that the
metadata is CC0 (https://www.artic.edu/open-access/); it asks for a credit in the form Artist, Title, Date, The Art Institute of Chicago.
The one text field it licenses differently (`description`, CC BY) is never read, and no image is used.

Eligible: an artwork with a title that the dump marks as on view. A blank value stays null (artist of an unattributed work, size of a
work with no recorded dimension, colour of an uncoloured record), so it never satisfies a badge.

Usage:
  curl -LO https://artic-api-data.s3.amazonaws.com/artic-api-data.tar.bz2      (about 130 MB; run it from a scratch folder)
  python tools/build_pool.py artic-api-data.tar.bz2        (from the repository root; run tools/test_import.py first)
"""
import datetime as dt
import json
import pathlib
import re
import sys
import tarfile


def num(x):
    return float(x) if isinstance(x, (int, float)) and not isinstance(x, bool) else None


def text(x):
    return x.strip() if isinstance(x, str) and x.strip() else None


def year(x):
    """A year the museum recorded, or None when it is not a plausible year (one record has 1486490 for "1486-90")."""
    return x if isinstance(x, int) and not isinstance(x, bool) and -6000 <= x <= 2100 else None


def life(display):
    """(born, died) from the artist line ("American, 1845-1921", "American, born 1960"); anything less plain stays unknown."""
    lines = (display or "").split("\n")
    line = lines[1] if len(lines) > 1 else ""
    m = re.search(r"(\d{4})\s*[-–]\s*(\d{4})", line)
    if m and not re.search(r"c\.|by |after |before ", line[: m.start()] + line[m.end():]):
        return int(m.group(1)), int(m.group(2))
    m = re.search(r"\bborn (\d{4})\b", line)
    return (int(m.group(1)), None) if m else (None, None)


def convert(d):
    if not (d.get("is_on_view") and text(d.get("title"))):
        return None
    dims = (d.get("dimensions_detail") or [{}])[0] or {}
    col = d.get("color") or {}
    born, died = life(d.get("artist_display"))
    gallery = text(d.get("gallery_title"))
    g = re.fullmatch(r"Gallery (\d+)", gallery or "")
    acc = re.match(r"(\d{4})\.", d.get("main_reference_number") or "")
    return {
        "id": str(d["id"]), "title": text(d["title"]), "artist": text(d.get("artist_title")), "born": born, "died": died,
        "dateStart": year(d.get("date_start")), "dateEnd": year(d.get("date_end")),
        "dateText": text(d.get("date_display")), "place": text(d.get("place_of_origin")), "medium": text(d.get("medium_display")),
        "h": num(dims.get("height")), "w": num(dims.get("width")), "d": num(dims.get("depth")), "diameter": num(dims.get("diameter")),
        "gallery": gallery, "galleryNo": int(g.group(1)) if g else None, "dept": text(d.get("department_title")), "type": text(d.get("artwork_type_title")),
        "style": text(d.get("style_title")), "kind": text(d.get("classification_title")),
        "colorfulness": num(d.get("colorfulness")), "hue": col.get("h"), "light": col.get("l"), "sat": col.get("s"),
        "acquired": int(acc.group(1)) if acc else None, "credit": text(d.get("credit_line")),
        "publicDomain": d.get("is_public_domain") is True, "copyrighted": bool(text(d.get("copyright_notice"))), "featured": d.get("is_boosted") is True,
        "multimedia": d.get("has_multimedia_resources") is True, "terms": len(d.get("term_titles") or []), "subjects": len(d.get("subject_titles") or []),
    }


def main(archive):
    members = []
    with tarfile.open(archive, "r|bz2") as tf:
        for m in tf:
            if "/json/artworks/" in m.name and m.isfile() and m.name.endswith(".json"):
                r = convert(json.load(tf.extractfile(m)))
                if r:
                    members.append(r)
    members.sort(key=lambda r: int(r["id"]))
    n, today = len(members), dt.datetime.now(dt.timezone.utc).date().isoformat()
    known = lambda f, what: f"known for {sum(m[f] is not None for m in members):,} of {n:,}; {what}"
    meta = {"version": "v1", "publishedAt": today, "capturedAt": today, "source": "Art Institute of Chicago public data dump, CC0 metadata (https://api.artic.edu/docs/)",
            "provenance": f"Snapshot of the Art Institute of Chicago data dump taken {today} by tools/build_pool.py. Catalog facts only; no images and no descriptions. Credit: The Art Institute of Chicago.",
            "selection": "Every artwork with a title that the museum's data marks as on view when the snapshot was taken. What is on view changes; this is one day's list.",
            "fieldStatus": {"id": "known (museum object id)", "title": "known", "artist": known("artist", "unattributed works have none"), "born": known("born", "read only from a plain birth year"),
                            "died": known("died", "read only from a plain death year"), "dateStart": known("dateStart", "year, negative for BCE"), "dateEnd": known("dateEnd", "year"),
                            "place": known("place", "place of origin"), "medium": known("medium", "as written by the museum"), "h": known("h", "centimetres, the first recorded dimension"),
                            "w": known("w", "centimetres"), "d": known("d", "centimetres"), "diameter": known("diameter", "centimetres, for round objects"), "gallery": known("gallery", "where it hangs when the snapshot was taken"),
                            "dept": known("dept", "curatorial department"), "type": known("type", "artwork type"), "style": known("style", "unknown never satisfies a badge"),
                            "colorfulness": known("colorfulness", "the museum's measure from its image; unknown never satisfies a badge"), "hue": known("hue", "dominant colour, degrees"),
                            "acquired": known("acquired", "year in the accession number"), "terms": "known (how many descriptive terms the museum lists)"}}
    lines = ",\n".join("  " + json.dumps(m, ensure_ascii=False, separators=(",", ":")) for m in members)
    out = pathlib.Path(__file__).resolve().parent.parent / "data" / "pool-v1.json"
    out.parent.mkdir(exist_ok=True)
    out.write_bytes(('{"meta":' + json.dumps(meta, ensure_ascii=False) + ',\n"members":[\n' + lines + "\n]}\n").encode("utf-8"))
    print(f"wrote {out}: {n} artworks")


if __name__ == "__main__":
    main(sys.argv[1])
