# Status after the switch to Wix (Dilz's latest message)

Beyzan stays on Wix. The work so far splits three ways.

## Still valid as is
| File | Why |
|---|---|
| `research/` (keywords, competitors, platform, legal) | Market, competitors and UK law don't change with the platform. The Shopify-app parts of `research/shopify-platform.md` become reference only |
| `target-queries.md` | Clusters, confidence and the five-competitor benchmark stand. URLs change to Wix slugs in the SEO sheet |
| `focus.md` | The recommendation stands (fresh flowers + balloons first; faux ahead of crystals; lead on hand-delivery and balloons, not speed) |
| `compliance/crystals.md` | Banned terms, the 73 claim → rewrite pairs, the disclaimer |
| `products/products-template.xlsx`, `products/photo-guide.pdf` | Platform-neutral |
| `tools/capture/` | The capture script. Needs the network fixed (open-questions A1); its wait-and-scroll logic gets the hardening Dilz listed before it runs |

## Valid but needs reworking for Wix
| File | Change |
|---|---|
| `baseline-scores.md` | Re-score from the real capture. Add the Wix speed ceiling. Nothing in it was scored from screenshots (none of the live site exist) |
| `fixes.md` | Re-label every item API / Editor / Wix can't, with Wix menu paths |
| `growth.md` | Swap Shopify apps for Wix equivalents (Wix Stores reviews, Wix Google Shopping channel, Ascend email, abandoned cart) |
| `design-tokens.md`, `mockup/` | The palette and fonts are a provisional stand-in (not Mayfair's, and not hers either). Replace them with her measured style after the capture, then rebuild the homepage and product mockups at iPhone width for `mobile.md` |
| `redirects/` | Becomes a Wix URL Redirect Manager list, needed only where a slug changes |

## Withdrawn
| What | Why |
|---|---|
| `archive/content-v1-superseded/`, `archive/copy-voice-v1-superseded.md`, `archive/copy-lint-rules-v1-superseded.json` | Wrong voice. Replaced by the new `copy-voice.md`, `voice-samples.md` and `_gate/copy-lint-rules.json` |

## Parked (kept, not used)
`theme/`, `tools/preview/`, `tools/import/push.mjs`, `build-plan.md`, `launch.md`, `handover/`, `summary.md` and the
Shopify parts of `_gate/run.mjs` were all written for Shopify. If the platform question ever comes back, they're ready.

## Next, in order (after the voice samples are confirmed and the network is open)
1. Harden and run the capture (real Chrome user agent, network idle, slow scroll down and back, fonts ready, all images
   loaded, banner dismissed, URL and timestamp on every shot), compare the homepage with `reference-home.png`, and confirm the match.
2. `design-tokens.md` from her real site, then `copy-voice.md` checked against her own words.
3. Scores, fixes.md (API / Editor / Wix can't), mobile.md with mockups, wix-seo-sheet.xlsx, page-copy/, growth.md.
4. Phase 2: dry run and backup before any API write.
