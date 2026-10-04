#!/usr/bin/env python3
"""Turns Beyzan's products-template.xlsx into a Shopify product import CSV.

    python3 tools/import/products_to_csv.py products/products-template.xlsx > products/shopify-products.csv

Shopify admin → Products → Import → choose the CSV. Every product comes in as a DRAFT: the builder rewrites the
description in her voice (copy-voice.md), runs the gate's health-claims check and adds photos before publishing.
Rows whose name starts with "EXAMPLE" are skipped. Tags drive the smart collections (tools/import/push.mjs):
local-only / keepsake, line:<line>, occasion:<occasion>.
"""
import csv
import re
import sys

import openpyxl

LINES = {
    "Fresh flowers": "fresh", "Balloons": "balloon", "Flowers + balloons": "balloon", "Faux flowers": "faux",
    "Crystal": "crystal", "Jewellery": "jewellery", "Other gift": "other", "Subscription": "subscription", "Hire": "hire",
}
OCCASIONS = {
    "birthday": "birthday", "anniversary": "anniversary", "new baby": "new-baby", "thank you": "thank-you",
    "get well": "get-well", "sympathy": "sympathy", "mother's day": "mothers-day", "mothers day": "mothers-day",
    "valentine's": "valentines", "valentines": "valentines", "just because": "just-because",
}
META = lambda key, label: f"{label} (product.metafields.custom.{key})"
COLS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published", "Option1 Name", "Option1 Value",
    "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy",
    "Variant Fulfillment Service", "Variant Price", "Variant Requires Shipping", "Variant Taxable", "Status",
    META("line", "Line"), META("summary", "Summary"), META("whats_in_it", "What's in it"), META("size", "Size"),
    META("materials", "Materials"), META("treatment", "Treatment"), META("occasions", "Occasions"),
    META("contains_lilies", "Contains lilies"), META("latex", "Latex"), META("foil", "Foil"),
    META("personalised", "Personalised"), META("card_message", "Card message"),
]


def handle(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def price(text):
    m = re.search(r"£\s*(\d+(?:\.\d{1,2})?)", str(text or ""))
    return m.group(1) if m else ""


def variants(row):
    """'Standard £45 / Large £65' -> [('Standard', '45'), ('Large', '65')]; else one default variant."""
    opts = str(row.get("Sizes / options and their prices") or "").strip()
    out = []
    for part in [p.strip() for p in opts.split("/") if p.strip()]:
        name = re.sub(r"£\s*[\d.—-]*", "", part).strip(" :-")
        out.append((name or part, price(part)))
    return out or [("Default Title", price(row.get("Price £")))]


def main(path):
    ws = openpyxl.load_workbook(path, data_only=True)["Products"]
    rows = list(ws.iter_rows(values_only=True))
    head = [str(h).strip() if h else "" for h in rows[0]]
    w = csv.DictWriter(sys.stdout, fieldnames=COLS)
    w.writeheader()
    for raw in rows[1:]:
        row = dict(zip(head, raw))
        name = str(row.get("Product name") or "").strip()
        if not name or name.upper().startswith("EXAMPLE"):
            continue
        line = LINES.get(str(row.get("Line") or "").strip(), "other")
        delivery = str(row.get("Delivery type") or "")
        local = line in ("fresh", "balloon") or "Local" in delivery
        occ = [OCCASIONS.get(o.strip().lower()) for o in str(row.get("Occasions") or "").split(",")]
        occ = [o for o in occ if o]
        tags = ["local-only" if local else "keepsake", f"line:{line}"] + [f"occasion:{o}" for o in occ]
        is_balloon = line == "balloon"
        latex = str(row.get("Latex balloons?") or "").lower().startswith("y")
        whats = str(row.get("What's in it") or "")
        base = {
            "Handle": handle(name), "Title": name,
            "Body (HTML)": f"<p>{row.get('Short description in your words') or ''}</p>",
            "Vendor": "ChoZen Boutique", "Type": str(row.get("Category") or ""), "Tags": ", ".join(tags),
            "Published": "FALSE", "Status": "draft",
            META("line", "Line"): line, META("summary", "Summary"): str(row.get("Short description in your words") or ""),
            META("whats_in_it", "What's in it"): whats, META("size", "Size"): str(row.get("Size") or ""),
            META("materials", "Materials"): str(row.get("Materials (metal, stone)") or ""),
            META("treatment", "Treatment"): str(row.get("Stone treatment") or ""),
            META("occasions", "Occasions"): "; ".join(occ),
            META("contains_lilies", "Contains lilies"): "TRUE" if str(row.get("Contains lilies?") or "").lower().startswith("y") else "FALSE",
            META("latex", "Latex"): "TRUE" if latex else "FALSE",
            META("foil", "Foil"): "TRUE" if is_balloon and "foil" in whats.lower() else "FALSE",
            META("personalised", "Personalised"): "TRUE" if str(row.get("Personalised / made to their spec?") or "").lower().startswith("y") else "FALSE",
            META("card_message", "Card message"): "TRUE" if local else "FALSE",
        }
        stock = str(row.get("Stock") or "").strip()
        tracked = stock.isdigit()
        for i, (opt, p) in enumerate(variants(row)):
            r = dict(base) if i == 0 else {"Handle": base["Handle"]}
            r.update({
                "Option1 Name": "Size" if opt != "Default Title" else "Title", "Option1 Value": opt,
                "Variant Grams": str(row.get("Weight (g, packed)") or ""), "Variant Inventory Tracker": "shopify" if tracked else "",
                "Variant Inventory Qty": stock if tracked else "", "Variant Inventory Policy": "deny" if tracked else "continue",
                "Variant Fulfillment Service": "manual", "Variant Price": p, "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE",
            })
            w.writerow({k: r.get(k, "") for k in COLS})


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "products/products-template.xlsx")
