#!/usr/bin/env python3
"""Check build_pool.convert and life against hand-made records in the dump's layout. Usage: python tools/test_import.py"""
import build_pool as bp

rec = {"id": 4, "title": " Priest and Boy ", "is_on_view": True, "artist_title": "Lawrence Carmichael Earle", "artist_display": "Lawrence Carmichael Earle\nAmerican, 1845-1921",
       "date_start": 1865, "date_end": 1880, "date_display": "n.d.", "place_of_origin": "United States", "medium_display": "Watercolor", "main_reference_number": "1880.1",
       "dimensions_detail": [{"height": 47, "width": 34.5, "depth": None}], "gallery_title": "Gallery 239", "department_title": "Prints and Drawings", "artwork_type_title": "Drawing and Watercolor",
       "colorfulness": 18.86, "color": {"h": 43, "l": 49, "s": 16}, "credit_line": "The Charles Deering Collection", "is_public_domain": True, "is_boosted": False,
       "has_multimedia_resources": False, "copyright_notice": None, "term_titles": ["a", "b"], "subject_titles": [], "description": "NEVER READ"}
m = bp.convert(rec)
assert (m["id"], m["title"], m["artist"], m["born"], m["died"], m["h"], m["w"], m["d"], m["galleryNo"], m["acquired"], m["terms"], m["publicDomain"], m["copyrighted"]) == \
    ("4", "Priest and Boy", "Lawrence Carmichael Earle", 1845, 1921, 47.0, 34.5, None, 239, 1880, 2, True, False), m
assert "description" not in m and not any("NEVER" in str(v) for v in m.values()), "the CC BY description must never be copied"
assert bp.convert({**rec, "is_on_view": False}) is None and bp.convert({**rec, "title": "  "}) is None, "off view or untitled works are out"
anon = bp.convert({"id": 9, "title": "Armor", "is_on_view": True, "artist_title": None, "artist_display": "Southern German", "gallery_title": "North Garden", "main_reference_number": "x"})
assert (anon["artist"], anon["born"], anon["died"], anon["galleryNo"], anon["gallery"], anon["acquired"], anon["h"], anon["colorfulness"], anon["publicDomain"], anon["terms"]) == (None, None, None, None, "North Garden", None, None, None, False, 0), anon
assert bp.life("X\nAmerican, 1845-1921") == (1845, 1921) and bp.life("X\nAmerican, born 1960") == (1960, None)
assert bp.life("X\nWorkshop of Y (Netherlandish, c. 1470/75–by 1533)") == (None, None) and bp.life("X\nTiffany (American, founded 1837)") == (None, None) and bp.life(None) == (None, None)
assert bp.convert({**rec, "date_start": 1486490, "date_end": 1490})["dateStart"] is None and bp.convert({**rec, "date_start": -500})["dateStart"] == -500, "an impossible year is unknown, a BCE year is kept"
print("OK")
