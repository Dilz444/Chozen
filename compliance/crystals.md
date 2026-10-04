# Crystals, astrology and gemstone jewellery: the copy rules

The rules every crystal, birthstone, zodiac and gemstone-jewellery word on the new site follows: product titles
and descriptions, collection names and filters, guides, emails, captions and alt text. `copy-voice.md` rule 5
points here. Sources are in `research/legal.md` §5 and `research/keywords.md` (cluster 6 and the ASA note).
Not legal advice. Points marked **[TS]** are worth checking with Enfield Trading Standards.

---

## 1. The rule

Crystal meanings are tradition and story, never effect. The CAP Code applies to marketing on her own website,
including product pages and the meaning content that sells them (CAP Code section 12, rules 12.1 and 12.6 on
medicinal and health claims, https://www.asa.org.uk/type/non_broadcast/code_section/12.html). The ASA's "Health:
Crystal Therapy" guidance says the ASA and CAP have seen no evidence that crystal therapy can treat medical
conditions, that such claims are unlikely to be acceptable without robust clinical evidence, that marketers must
not discourage essential treatment, and that the history and traditions of crystals may be described as long as
no efficacy is claimed (https://www.asa.org.uk/advice-online/health-crystal-therapy.html). The rulings show how
low the bar is: *Spirit Walker Crystals* (17 April 2013) was ruled misleading for implying crystals help with
Alzheimer's, asthma, depression and heart conditions; *Octopus Publishing Group* (19 October 2005) was ruled
misleading for a general reference to the "healing power" of crystals; and *GKOnlineCo t/a Aida Wellbeing* (24
April 2024) made a medical claim ("relieved my meno-bloat") that turned a bracelet into a medical device needing
MHRA registration (https://www.lexisnexis.com/en-gb/legal/news/asa-rulings-24-april-2024). Astrology and birthstone
content is fine as tradition and fun, but must not promise luck, wealth, love, protection or a changed life, must
not use fear ("ward off bad luck") and must not target vulnerable people
(https://www.asa.org.uk/advice-online/psychics-spiritualists-fortune-tellers-astrologers-and-clairvoyants.html).
A disclaimer never rescues an explicit health claim. Testimonials count as our claims, so a review saying "my
anxiety went" can't be quoted, featured or put in schema. So: say what a stone is, where it comes from and what
it has traditionally been taken to mean, then end on what the customer actually gets.

---

## 2. Banned terms (regex-friendly)

All patterns are case-insensitive. Two tiers:

- **BLOCK**: always wrong in shop copy. The gate fails the page.
- **REVIEW**: often innocent ("a treat for mum", "to stop it fading"). The gate warns and a person decides.

**Exceptions** (strip these before linting): the exact standard disclaimer in §5; `heat-treated`, `untreated`
and the treatment words in a gem-disclosure line (§7); the word "healing" inside a quoted ASA ruling name in this
file. Nothing else is exempt, including blog posts, captions and alt text. Scope: the health-claims rules run on
every page, but a flower pet-safety page (`content/guides/flowers-and-pets.md`) may name symptoms such as
"stomach pain" in an animal, because that's a warning, not a claim; whitelist that file for the Pain group only.

### BLOCK

| Group | Pattern | Catches |
|---|---|---|
| Heal | `\bheal(s\|ed\|ing\|er\|ers)?\b` | heals, healing crystals, master healer |
| Cure | `\bcur(e\|es\|ed\|ing)\b` | cures |
| Relieve | `\brelie(f\|fs\|ve\|ves\|ved\|ving)\b` | relieves, relief, stress relief |
| Remedy | `\bremed(y\|ies\|ial)\b` | remedy |
| Therapy | `\btherap(y\|ies\|ist\|eutic\|eutically)\b` | crystal therapy, therapeutic |
| Detox | `\bdetox\w*` | detox, detoxifies |
| Immunity | `\bimmun\w*` | immune, immunity |
| Anxiety | `\banxi(ety\|eties\|ous)\b`, `\bpanic\b` | anxiety, anxious, panic attacks |
| Depression | `\bdepress(ion\|ed\|ive)\b` | depression |
| Stress | `\bstress[- ]?(relie\w*\|free\|buster\|less)\b`, `\b(reduc\|eas\|lower\|melt)\w*\s+(your\s+)?stress\b` | stress relief, eases stress |
| Sleep | `\binsomnia\b`, `\bsleep\s+aid\b`, `\bhelps?\s+(you\s+)?(to\s+)?sleep\b`, `\b(better\|deeper\|restful)\s+sleep\b`, `\bfor\s+sleep\b` | sleep aid, helps you sleep |
| Pain | `\bpain(s\|ful\|kill\w*)?\b`, `\bach(e\|es\|ing)\b`, `\bheadaches?\b`, `\bmigraines?\b` | pain, headaches |
| Reproductive | `\bfertil(e\|ity)\b`, `\bconcei(ve\|ving\|ption)\b`, `\bhormon\w*`, `\bmenopaus\w*`, `\bmeno\b`, `\bmenstrua\w*`, `\bperiod\s+pain\b`, `\blibido\b` | fertility, hormone, meno |
| Circulation | `\bblood\s+pressure\b`, `\bcirculation\b`, `\bheart\s+(health\|condition\w*\|disease)\b` | blood pressure |
| Radiation | `\bEMF\b`, `\banti-?radiation\b`, `\bradiation\s+(protect\w*\|shield\w*\|block\w*)`, `\b(absorb\|block\|shield\|neutrali[sz])\w*\s+(\w+\s+)?radiation\b`, `\b5G\s+protect\w*`, `\bwi-?fi\s+(protect\w*\|shield\w*)` | EMF protection, absorbs radiation (bare "radiation" is REVIEW, because "natural radiation" explains amethyst and smoky quartz colour) |
| Chakra as effect | `\bchakra\s+(heal\w*\|balanc\w*\|align\w*\|clear\w*\|open\w*\|unblock\w*\|activat\w*)`, `\b(balanc\|align\|open\|unblock\|clear\|activat)\w*\s+(your\s+\|the\s+\|all\s+)?(\w+\s+)?chakras?\b` | chakra balancing, opens your heart chakra |
| Energy as effect | `\benergy\s+(heal\w*\|work\s+heal\w*)`, `\b(absorb\|neutrali[sz]\|remov\|block\|repel\|purif\|transmut)\w*\s+(all\s+)?(negative\s+\|bad\s+\|harmful\s+)?energ\w*` | energy healing, absorbs negative energy |
| Vibration | `\braises?\s+(your\s+)?vibration\w*`, `\bhigh[- ]vibration(al)?\b`, `\bfrequency\s+(heal\w*\|align\w*)` | raises your vibration |
| Protection as promise | `\bprotects?\s+(you\|your\|the\s+wearer\|against\|from\|children\|babies\|pets)\b`, `\bprotection\s+(from\|against)\b`, `\bshields?\s+(you\|your)\b`, `\bwards?\s+off\b` | protects you, wards off |
| Promise | `\battract(s\|ing)?\s+(more\s+)?(money\|wealth\|love\|luck\|abundance\|success\|prosperity\|a\s+partner\|good\s+fortune)`, `\bbring(s\|ing)?\s+(you\s+)?(money\|wealth\|love\|luck\|abundance\|success\|prosperity)`, `\bwill\s+(bring\|attract\|protect\|change\|transform\|heal)\b`, `\bguarantee\w*` | attracts money, will bring love |
| Medical authority | `\bmedical(ly)?\b`, `\bclinical(ly)?\b`, `\bscientifically\b`, `\bproven\b`, `\bdoctors?\b`, `\bmedicine\b`, `\bprescri\w*` | clinically proven |
| Conditions | `\b(asthma\|arthritis\|diabetes\|alzheimer'?s\|dementia\|adhd\|autism\|eczema\|psoriasis\|inflammation\|infection\|illness\|disease\|addiction\|ptsd\|trauma\|grief\s+recovery\|thyroid\|digestion\|metabolism\|eyesight)\b` | any named condition |
| Calming as effect | `\bcalm(s\|ing)?\s+(the\s+\|your\s+)?(mind\|nerves\|nervous\|you\|emotions)\b`, `\bsooth(e\|es\|ing)\s+(the\s+\|your\s+)?(mind\|nerves\|soul\|emotions)\b`, `\b(reduc\|eas\|lower)\w*\s+(anger\|tension\|fear\|worry\|overthinking)\b` | calms the mind |
| Cosmetic | `\banti-?(ageing\|aging\|wrinkle\|inflammatory)\b`, `\bwrinkles?\b`, `\bpuffiness\b`, `\blymphatic\b`, `\bcollagen\b` | rose quartz roller claims |
| Fear | `\bbad\s+luck\b`, `\bcurse[sd]?\b`, `\bevil\s+eye\b`, `\bnegative\s+entit\w*` | ward off bad luck |
| Elixirs | `\b(gem\|crystal)\s+(elixir\|water)\b`, `\belixirs?\b` | crystal water (also a safety risk, see malachite) |

### REVIEW

| Pattern | Usually fine when | Wrong when |
|---|---|---|
| `\bradiation\b` | geology: "natural radiation" in the rock darkens smoky quartz and colours amethyst | any link between a stone and radiation from phones, wifi or devices |
| `\bcancers?\b` | the star sign Cancer (zodiac copy) | the illness, anywhere |
| `\btreat(s\|ed\|ing)?\b`, `\btreatment\b` | "a treat for mum", gem-treatment disclosure | "treats", "treatment for" a condition |
| `\bprevent\w*` | care copy ("to stop it fading" is better anyway) | "prevents" anything bodily |
| `\bsleep\w*`, `\bbedtime\b`, `\bnight(s)?\b` | "for the bedside", a product name | any effect on sleep |
| `\bstress\w*`, `\bcalm\w*`, `\bpeace\w*`, `\brelax\w*` | after a frame ("traditionally associated with calm") | as a result ("brings calm", "relaxes you") |
| `\bprotect\w*` | after a frame ("traditionally regarded as protective"), packaging ("protected in tissue") | as a promise |
| `\benerg\w*` | "in crystal lore, a stone of energy and courage" | "cleanses your energy" as fact |
| `\bmanifest\w*` | "a reminder of what you're working towards" (better to drop the word) | "manifest your dream life" |
| `\bluck\w*`, `\bfortune\w*`, `\babundan\w*`, `\bwealth\b`, `\bmoney\b` | "in folklore, a stone of good fortune" | any promise |
| `\bhealth\w*`, `\bwell-?being\b`, `\bwellness\b` | not in crystal copy at all if avoidable | anything linking a stone to health |
| `\bboost\w*`, `\bbalanc\w*`, `\benhanc\w*`, `\bimprov\w*`, `\bincreas\w*`, `\bpromot\w*`, `\bsupport\w*` | describing the shop or delivery | describing what a stone does to a person |
| `\bproperties\b`, `\bpowers?\b`, `\bpowerful\b` | "meaning" is the word to use instead | "healing properties", "powerful protection" |
| `\bcleans\w*`, `\bcharg(e\|es\|ing)\b`, `\bprogramm\w*` | framed as a ritual people like ("many people like to…") | as a fact about the stone |
| `\bpsychic\b`, `\bthird\s+eye\b`, `\baura\b`, `\bintuition\b` | "in crystal lore, linked with intuition" | "awakens psychic abilities" |
| `\bpregnan\w*`, `\bbab(y\|ies)\b`, `\bchild(ren)?\b`, `\bpets?\b` | gift framing plus the small-parts note | any protective or bodily claim |
| `\bgenuine\b`, `\bnatural\b`, `\breal\b` | only for untreated natural stones with supplier evidence | for dyed, reconstituted, synthetic or imitation material |

### JSON for `_gate/copy-lint-rules.json`

The gate's rule file doesn't exist yet. When it's built, `bannedPhrases.healthClaims` takes the BLOCK column and
`reviewPhrases.healthClaims` the REVIEW column, as JS regex source strings with the `i` flag. Example shape:

```json
{
  "bannedPhrases": {
    "healthClaims": {
      "flags": "i",
      "exceptions": [
        "Crystals are sold as decorative and spiritual items\\. Their traditional meanings are not scientifically proven and are not a substitute for medical advice or treatment\\.",
        "\\bheat-treated\\b", "\\buntreated\\b"
      ],
      "patterns": ["\\bheal(s|ed|ing|er|ers)?\\b", "\\bcur(e|es|ed|ing)\\b", "\\brelie(f|fs|ve|ves|ved|ving)\\b", "…"]
    }
  }
}
```

---

## 3. Allowed frames

Use one frame per claim, then end the sentence on something real (size, colour, where it's from).

- "traditionally associated with …"
- "in crystal lore, … is …" / "crystal lore links … with …"
- "in folklore, … was carried / kept / worn for …"
- "often given as a symbol of …" / "a gift that stands for …"
- "said to …" / "believed by some to …"
- "known as the stone of …" / "long linked with …"
- "in [named culture or era], … was …" (a historical fact, e.g. "Roman signet rings were often carnelian")
- "in chakra tradition, … is matched with the … chakra" (a colour correspondence, not an effect)
- "many people like to keep … on their desk / bedside table / windowsill while they …"
- "a reminder of …" / "a keepsake for …"
- "for fun" / "just for fun" (zodiac and astrology)
- "the UK birthstone for …" / "an alternative birthstone on the UK list" (a fact about a list)

A frame doesn't make a medical word acceptable. "Traditionally said to cure headaches" is still a health claim.
Drop the condition entirely.

---

## 4. Claim → rewrite table

"Delete" means there is no compliant version of the idea. Replace it with the suggested line, which says something
else true. Sizes and prices in rewrites are examples; use the real product's.

| # | Stone or area | Typical claim (UK crystal and Wix shops) | Rewrite |
|---|---|---|---|
| 1 | Amethyst | "Amethyst heals anxiety and calms the mind." | "Amethyst has long been associated with calm, and many people keep a piece somewhere quiet in the house." |
| 2 | Amethyst | "Helps you sleep and cures insomnia. Put it under your pillow." | "A small amethyst cluster is a favourite on bedside tables. About 6cm across, with deep purple points." |
| 3 | Amethyst | "Prevents drunkenness and helps beat addiction." | "The name comes from the Greek *amethystos*, 'not drunk', from an old belief that the stone kept its wearer sober. A good story to write on the gift card." (Addiction: delete.) |
| 4 | Amethyst | "Relieves headaches and migraines." | Delete. "Amethyst is February's birthstone on the UK list." |
| 5 | Rose quartz | "Rose quartz heals a broken heart." | "In crystal lore, rose quartz is the stone of love, and it's often given after a hard year as a small, kind gesture." |
| 6 | Rose quartz | "Attracts love into your life." | "Rose quartz is traditionally associated with love, and it's often given to a partner, a mum or a close friend." |
| 7 | Rose quartz | "Boosts self-love and self-esteem." | "Said in crystal lore to be a stone of self-kindness. A pale pink tumble stone for a dressing table." |
| 8 | Rose quartz | "Supports fertility and a healthy pregnancy." | Delete. "A rose quartz heart is a popular new-baby keepsake for the parents' shelf, kept out of reach of small hands." |
| 9 | Rose quartz | "Rose quartz roller reduces puffiness and wrinkles." | "A rose quartz facial roller, cool to the touch, for your skincare routine." |
| 10 | Clear quartz | "The master healer. Amplifies healing energy." | "Known in crystal lore as the 'master crystal'. A six-sided clear quartz point that catches the light on a windowsill." |
| 11 | Clear quartz | "Programme it with your intention and manifest your goals." | "Many people like to keep a clear quartz point on their desk as a reminder of something they're working towards." |
| 12 | Clear quartz | "Strengthens the immune system." | Delete. "Clear quartz, or rock crystal, is the alternative April birthstone on the UK list." |
| 13 | Citrine | "Citrine attracts money and abundance." | "In folklore, citrine is the 'merchant's stone', and some shopkeepers keep a piece by the till." |
| 14 | Citrine | "Never needs cleansing because it doesn't hold negative energy." | "In crystal lore, citrine is said to be one stone that never needs cleansing." |
| 15 | Citrine | "Natural citrine" (on heated amethyst). | "Heat-treated citrine (amethyst heated to a golden orange)." See §7. |
| 16 | Citrine | "Aids digestion and metabolism." | Delete. "A warm yellow stone, often given for a new job or a new business." |
| 17 | Black tourmaline | "Protects you from negative energy and EMF from phones and wifi." | "Black tourmaline is traditionally regarded as a protective stone, and many people keep a piece by the front door." (EMF: delete.) |
| 18 | Black tourmaline | "Grounding. Draws toxins out of the body." | "Often called a grounding stone in crystal lore. Black, ridged along its length and heavy for its size." |
| 19 | Tiger's eye | "Gives you courage and confidence." | "Tiger's eye is traditionally associated with courage, which makes it a popular good-luck gift before an exam or a new job." |
| 20 | Tiger's eye | "Brings wealth and success." | "In folklore, tiger's eye was carried for good fortune. The band of gold light moves as you turn it." |
| 21 | Tiger's eye | "Good for eye problems and night vision." | Delete. "Polished tiger's eye shows a moving band of light, called chatoyancy, from the fibres inside it." |
| 22 | Selenite | "Selenite cleanses and charges your other crystals." | "In crystal lore, selenite is said to cleanse other crystals, and many people rest their pieces on a selenite plate." |
| 23 | Selenite | "Removes negative energy from your home." | "Selenite is traditionally associated with clarity and calm. A white, satiny tower that glows when a lamp is behind it." |
| 24 | Selenite | "Cleanse it under running water / in salt." | "Selenite is a soft form of gypsum and dissolves slowly in water. Dust it with a dry cloth." (A care fact, and true.) |
| 25 | Labradorite | "Awakens psychic abilities and intuition." | "In crystal lore, labradorite is linked with intuition. Flashes of blue and gold appear as it turns in the light." |
| 26 | Labradorite | "Shields your aura." | "Traditionally regarded as a stone of change and new chapters, so it's often given at a leaving do." |
| 27 | Green aventurine | "The luckiest stone. Wear it to win." | "Green aventurine is known in folklore as a lucky stone, often tucked into a card for someone starting something new." |
| 28 | Green aventurine | "Supports heart health and lowers blood pressure." | Delete. "In chakra tradition, green stones are matched with the heart chakra." |
| 29 | Carnelian | "Boosts fertility and libido." | Delete. "Carnelian is the alternative July birthstone on the UK list, a warm orange chalcedony." |
| 30 | Carnelian | "Increases motivation and energy." | "Said in crystal lore to be a stone of courage and creativity. A desk stone for someone starting a project." |
| 31 | Obsidian | "Obsidian absorbs negativity and protects you." | "Obsidian is volcanic glass. In crystal lore it's regarded as a protective, grounding stone." |
| 32 | Obsidian | "Draws out trauma and emotional pain." | Delete. "Polished obsidian was made into mirrors in Aztec Mexico. Today it's a reflective black stone for a shelf." |
| 33 | Moonstone | "Balances hormones and helps with menopause and periods." | Delete. "Moonstone is traditionally linked with the moon and new beginnings, and it's the alternative June birthstone in the UK." |
| 34 | Moonstone | "Protects travellers." | "In folklore, moonstone was a travellers' stone, which makes it a going-away gift." |
| 35 | Lapis lazuli | "Opens the third eye and enhances wisdom." | "Lapis lazuli has been linked with wisdom and royalty since ancient Egypt, where it was carved into jewellery and scarabs." |
| 36 | Lapis lazuli | "Heals sore throats and the thyroid." | Delete. "In chakra tradition, lapis is matched with the throat chakra and with speaking honestly." |
| 37 | Smoky quartz | "Detoxes and absorbs radiation." | "Smoky quartz is often called a grounding stone in crystal lore. The Scottish variety, Cairngorm, was set in Highland brooches." |
| 38 | Fluorite | "Improves focus. Great for ADHD and studying." | "Fluorite is traditionally associated with clear thinking, and a small piece is a popular desk stone for students." |
| 39 | Jade | "Promotes long life and good health." | "In Chinese tradition, jade has stood for virtue and good fortune for thousands of years, and it's often given at births and weddings." |
| 40 | Jade | "Genuine jade bracelet" (dyed quartzite or serpentine). | "Green dyed quartzite bead bracelet" or "Serpentine bead bracelet". See §7. |
| 41 | Turquoise | "Protects against falls and the evil eye." | "Turquoise has been worn as a charm in many cultures, from Persia to the American Southwest. It's December's birthstone." |
| 42 | Turquoise | "Genuine turquoise" (dyed howlite or magnesite). | "Howlite, dyed turquoise blue." See §7. |
| 43 | Malachite | "Absorbs pain and draws out toxins." | Delete. "Malachite's green bands come from copper. In crystal lore it's a stone of change." Add: "Keep it dry and don't cut or sand it." |
| 44 | Pyrite | "Pyrite attracts money and prosperity." | "Pyrite is 'fool's gold', and in folklore it's kept as a token of good fortune. The cubes form naturally in clay in northern Spain." |
| 45 | Howlite | "Calms anger and helps you sleep." | "Howlite is traditionally associated with patience. White with grey veins, and often dyed (when it is, the label says so)." |
| 46 | Any | Shop or collection called "Healing crystals". | "Crystals" or "Crystal gifts". |
| 47 | Any | "Crystal healing kit for beginners." | "Crystal starter set: seven tumbled stones with a card of their traditional meanings." |
| 48 | Any | "Chakra healing set. Balance your chakras." | "Chakra set: seven stones matched to the seven chakra colours in the yoga tradition." |
| 49 | Any | "Raises your vibration." | Delete. "Many people like to keep a crystal on a windowsill where it catches the light." |
| 50 | Any | "Scientifically proven" / "backed by science" / "recommended by doctors". | Delete. Nothing replaces it. |
| 51 | Any | "Anti-anxiety bracelet" / "detox bracelet". | "Amethyst bead bracelet, 8mm beads on stretch cord." |
| 52 | Any | "Manifest your dream life with citrine." | "A citrine point to keep where you'll see it, as a small reminder of what you're aiming for." |
| 53 | Any | "This crystal will protect your baby." | Delete. "A keepsake for the nursery shelf, out of reach of small children (small parts)." |
| 54 | Any | Review quoted on the page: "My anxiety disappeared in a week!" | Don't publish, feature or mark up. Reviews about health are claims we'd have to prove. Keep the review out of featured slots; if the review app shows all reviews, ask her [TS]. |
| 55 | Any | "Use crystal water / make an elixir." | Delete. Some minerals (malachite, pyrite, some others) aren't safe in water. |
| 56 | Any | "Cleanse your crystals under the full moon to recharge their healing power." | "Many people like to set their crystals on a windowsill under a full moon. It's a ritual, and a nice one." |
| 57 | Any | "Pet healing crystals" / "crystals for anxious dogs". | Delete. Don't sell crystals for animals. |
| 58 | Category | **Healing** | **Gifts of comfort.** Acceptable: comfort is the giver's gesture, not the stone's effect. Two conditions: product copy inside never mentions illness or recovery, and the category isn't merged into the "Get well soon" collection. |
| 59 | Category | **Anxiety** → "For calmer evenings"? | **No.** "For calmer evenings" still says the stone makes the evening calmer, and a navigation label is an ad claim like any other. Because it replaces an anxiety category, the ASA would read it in that context. Use **Traditionally linked with calm** (tradition label) or a placement name like **For quiet corners**. Same for **Stress relief**. |
| 60 | Category | **Protection** | **Traditionally protective stones.** The "traditionally" carries the claim to tradition. Product copy inside still uses a frame, and nothing promises protection from anything specific. |
| 61 | Category | **Abundance / Money / Wealth / Success** | **Stones of good fortune in folklore.** |
| 62 | Category | **Sleep** | **For the bedside.** A place, not an effect. Product copy inside says nothing about sleep. |
| 63 | Category | **Love / Attract love** | **Love and friendship.** Stones given as symbols of love. |
| 64 | Category | **Confidence / Courage** | **Stones of courage in folklore.** |
| 65 | Category | **Focus / Study** | **For the desk.** |
| 66 | Category | **Grounding / Negative energy** | **Dark and earthy stones** (a colour group) or **Grounding stones in crystal lore**. |
| 67 | Category | **Chakra healing** | **Chakra colours.** |
| 68 | Astrology | "Every Scorpio needs obsidian to protect them." | "Obsidian is one of the stones often paired with Scorpio in modern crystal lists, a fun gift for a November birthday." |
| 69 | Astrology | "Your zodiac crystal will bring you luck all year." | "Zodiac pairings are just for fun. Pick the one that suits them, or the colour they'd wear." |
| 70 | Astrology | "Wearing your birthstone brings good luck. Wearing the wrong one brings bad luck." | Delete the second sentence. "Garnet is January's birthstone on the UK list, a traditional birthday gift." |
| 71 | Astrology | "Mercury retrograde protection kit." | "Mercury retrograde gift box, for fun: a smoky quartz tumble stone and a card." |
| 72 | Astrology | "This stone matches your personality and will transform your year." | "Taurus is an earth sign, and green and pink stones are the ones most often paired with it." |
| 73 | Astrology | Monthly horoscope or prediction in a product description. | Delete. No forecasts in shop copy. |

**Row count: 73** (57 stone and generic claims, 10 category names, 6 astrology).

---

## 5. The standard disclaimer

> Crystals are sold as decorative and spiritual items. Their traditional meanings are not scientifically proven and are not a substitute for medical advice or treatment.

Where it goes:

1. **Every crystal guide** (`content/guides/*crystal*`, `*-meaning`, birthstones, zodiac, colour): last paragraph of
   the body, in italics, no heading.
2. **Every crystal product page**: a fixed line under the description, from a theme block (one source, so it can't drift).
3. **The crystals collection page** `/collections/crystals`: under the product grid.
4. **Gemstone jewellery** product pages when the description mentions any meaning.
5. **Emails and social posts** that give a meaning: link to a guide rather than repeat it; the guide carries the
   disclaimer. A paid ad that mentions a meaning carries a short version: "Traditional meanings, for gifting."

It is the gate's one exception to the `medical`, `scientifically` and `proven` patterns. The exact string only.
Remember it does not fix a page that makes a claim; the claim still has to go.

---

## 6. Checking her existing pages after the capture

Her Wix crystal pages (crystal library, by colour, by intention, by formation, astrology pairing, gifting guides,
ethical sourcing) couldn't be read from this environment. When `npm run capture` has run:

1. **Lint.** Run `npm run gate` against `capture/pages/*/copy.md` (health-claims rules). The gate isn't built yet
   (`_gate/run.mjs` and `_gate/copy-lint-rules.json` don't exist at the time of writing). Until it is, use:

   ```sh
   rg -n -i -f compliance/crystal-banned.rx capture/pages/*/copy.md
   ```

   `compliance/crystal-banned.rx` holds the BLOCK patterns from §2, one per line, without the `\|` table
   escapes. Ignore hits on the standard disclaimer and on "heat-treated". Then grep the REVIEW patterns and
   read each hit.
2. **Also read, not just lint:** product titles, image alt text, collection and filter names, the "by intention"
   menu, review widgets and any PDF or image with text (a lint can't see text in an image).
3. **Rewrite each hit** using the table in §4. No row fits? Write one in the same pattern (frame, then something
   real), add it to the table, and keep the table numbering.
4. **Log every claim and rewrite** in `compliance/crystal-claims-log.md`: the page, her exact words, the rule it
   broke, the rewrite, and whether she approved it.
5. **Check the treatment and metal words** on every crystal and jewellery product against §7. "Natural",
   "genuine", "real", "silver" and "gold" each need evidence.
6. **Ethical sourcing page:** every claim on it needs evidence she can show (open question B12). What she can't
   evidence comes off. It's a greenwashing risk, not a health one, but the same "say only what's true" rule.
7. **Re-run the gate** on `content/` before launch. Zero BLOCK hits; every REVIEW hit read by a person.

---

## 7. Gemstone jewellery: metals and treatments

### Metals (Hallmarking Act 1973)

- It's an offence to describe an item as **silver, gold, platinum or palladium** unless it's hallmarked or under
  the exemption weight.
- Exemption weights (precious metal content): **silver 7.78g**, **gold 1g**, **palladium 1g**, **platinum 0.5g**.
  Above these, the item needs a UK Assay Office or convention hallmark.
- Under the exemption weight, "925 sterling silver" can be used if the item really is that standard. Keep the
  supplier's assay or test evidence on file.
- Plated items are never "gold" or "silver". Use "gold-plated brass", "silver-plated base metal", "gold vermeil"
  only if it meets the vermeil standard the supplier can evidence [TS], "stainless steel".
- **Dealer's Notice B** (British Hallmarking Council, online version) is shown on `/collections/gemstone-jewellery`
  and linked from every jewellery product page and the footer.
- Sources: https://www.edinburghassayoffice.co.uk/complying-with-the-hallmarking-act/ ,
  https://www.businesscompanion.info/en/quick-guides/miscellaneous/hallmarking ,
  https://www.assayoffice.co.uk/news/hallmarking-dealers-notice-goes-digital-alongside-launch-of-new-halo-award

### Stones (DMCC Act Part 4 misleading omissions; CIBJO Blue Book; NAJ Gemstone Guidance Note 2024)

- Disclose any treatment: heated, dyed, irradiated, stabilised, reconstituted, oiled, waxed, coated, filled.
- Say "synthetic" or "lab-created" where it is.
- Never use "genuine", "natural" or "real" for imitation, dyed or reconstituted material.
- Use "simulant" or "imitation" where that's what it is (e.g. "glass imitation of moonstone", "opalite, a glass").
- Trade names that mislead get the true name first: "goldstone (glass)", "opalite (glass)", "Swiss lapis (dyed
  jasper)", "African jade (green grossular garnet)" [check each with the supplier].
- Source: https://www.naj.co.uk/write/MediaUploads/Resources/NAJGuidanceNote-Gemstone2024.pdf

### Disclosure checklist for product data

One row per product, in `products-template.xlsx` (and Shopify metafields when the store exists). The product
description pulls the disclosure line from these fields, so it can't be left out.

| Field | Values | Copy it produces |
|---|---|---|
| `stone_name` | The true mineral or material name | Comes first in the title: "Amethyst cluster", "Howlite bracelet" |
| `material_type` | natural · synthetic (lab-created) · imitation/simulant · glass · composite | "Lab-created", "Glass imitation of …" |
| `treatment` | none known · heated · dyed · irradiated · stabilised · reconstituted · waxed · oiled · coated · filled · unknown | "Heat-treated", "Dyed", "Stabilised" in the first line of the description |
| `treatment_evidence` | supplier statement / invoice wording / own test / none | Internal only. "none" + "none known" means the copy says nothing about treatment and doesn't say "natural" |
| `dyed` | yes / no / unknown | If yes: "dyed" in the title as well as the description ("Dyed howlite, turquoise blue") |
| `reconstituted` | yes / no / unknown | If yes: "reconstituted [stone]" in the title (common for turquoise and amber) |
| `stabilised` | yes / no / unknown | If yes: "stabilised [stone]" in the description (common for turquoise) |
| `trade_name_check` | true name if the supplier's name misleads | True name first, trade name in brackets |
| `origin_country` | where the supplier says it was mined, or blank | Only when the supplier states it; never guessed |
| `metal` | 925 sterling silver · 9ct gold · gold-plated brass · silver-plated base metal · stainless steel · elastic cord · other | Exact phrase, no shortening to "silver" or "gold" |
| `metal_weight_g` | precious metal content in grams | Internal: checks against the exemption weights |
| `hallmarked` | yes / no / exempt-under-weight | If over the weight and not hallmarked, the product can't be described with that metal |
| `assay_evidence` | file reference | Internal |
| `small_parts` | yes / no | If yes: "Small parts. Not for young children." |

Common cases to expect on her stock (check each, don't assume): citrine (usually heated amethyst), smoky quartz
(often irradiated clear quartz), carnelian (often dyed or heated agate), red tiger's eye (heated), turquoise
(often stabilised or reconstituted, or dyed howlite or magnesite), lapis lazuli (often dyed or waxed), "jade"
beads (often dyed quartzite or serpentine), howlite (often dyed), blue or pink agate slices (dyed), "aura" or
"angel aura" quartz (metal-coated), "rainbow moonstone" (white labradorite, a fact rather than a treatment),
"selenite" towers (usually satin spar gypsum), opalite and goldstone (glass).
