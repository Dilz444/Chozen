# Copy voice: ChoZen Boutique

The copy standard for every page, product, email and social caption. The machine-checkable half is
`_gate/copy-lint-rules.json`. Rule ids in brackets point to it. Where this file and the lint disagree, this file
wins and the lint gets fixed.

Ported from the Book London Nightclubs (Mayfair) build. Everything generic came across: answer-first openers,
question headings, no AI tells, no page talking about itself, no research notes, numbers the way people say them.
Nothing nightclub-specific came across.

> **[pending capture]** Her own copy and About page haven't been read yet (`open-questions.md` A1). When the
> capture runs, read every page of hers in `capture/pages/*/copy.md`, pull out the phrases she uses about flowers,
> customers and Cyprus, and add them under "Her words" below. Her phrasing beats ours wherever it's clear and true.

---

## The voice in six lines

1. **Who is speaking:** Beyzan, the florist. She chooses the stems, makes up the bouquet and knows the roads it goes down. "We" for the shop, "I" on her story and in her notes.
2. **Who she's talking to:** someone with a phone out who wants a gift to arrive today, often for someone they love and sometimes for someone who's grieving. They're in a hurry and slightly worried it won't look like the photo.
3. **How it sounds:** warm, plain and sure of itself. She says what she'll do and when. "Order by 10am and it's at their door today."
4. **Specifics over adjectives:** the stems, the colours, the size in centimetres, the postcode, the time. If a sentence would fit any florist, it isn't finished.
5. **Short sentences, one idea each.** British English. Contractions are fine. The brand name never does the work "we" should do.
6. **No selling words, no research notes, no talking about the page.** She knows her flowers. She doesn't hype, hedge or explain how the website works.

## Her words [pending capture]

To be filled from her pages. Until then, use only what the brief gives: "hand-delivered", "same day", "jasmine
flower crowns in Cyprus", "Enfield", "North London".

---

## The rules

1. **The opening paragraph is the answer.** At most two sentences and 45 words. It answers the page's main question (what this is, where, by when, how much) and makes sense quoted alone by Google or ChatGPT. It names ChoZen Boutique at most once. It never opens with "Yes" or "No" unless the H1 is a yes/no question, and never with a numeral. [`ledeRules`]
2. **Headings are questions a person would type or say.** "How long do faux flowers last?" "Can you deliver flowers today in Winchmore Hill?" No colons, no two questions in one heading, 14 words at most, never "we" in the question ("Who are you?", not "Who are we?"), no pasted search strings ("Florist Enfield near me?"). The approved non-question H2s are: product and collection names, "What's in it", "Size", "Delivery", "Care", "More questions", "You might also like". [`headingRules`]
3. **Each answer starts with its answer.** The first sentence under a question heading answers it. Detail comes after.
4. **Each fact once per page.** The cut-off, the delivery fee, the delivery area, the returns rule: one statement each in the body. The product form, the delivery box and the sticky bar don't count, because that's where people act. Later mentions refer back in their own words. [`repetitionRules`]
5. **No health claims, ever.** Crystals and flowers don't heal, treat, cure, relieve, prevent, detox, calm anxiety, help sleep, balance energy or protect. Crystal meanings are tradition and story: "traditionally associated with", "in crystal lore", "often given as a symbol of", "said to". Every crystal page carries the short disclaimer. Full list and rewrites: `compliance/crystals.md`. [`bannedPhrases.healthClaims`]
6. **No promises we can't keep.** No "guaranteed", "always fresh", "lasts forever", "the best florist in Enfield", "award-winning", "luxury" as a claim, float times without a typical range, lasting times without conditions. Faux flowers "keep their shape and colour for years with a dust now and then", not "forever". [`bannedPhrases.overclaims`]
7. **Specifics over adjectives.** "Twelve red roses, eucalyptus and waxflower, about 45cm tall" beats "a stunning luxurious bouquet". Banned: stunning, gorgeous (except in a quoted review), luxurious, exquisite, breathtaking, curated, elevate, timeless, bespoke (say "made to order" or "made for you"), indulge, iconic, vibrant, unforgettable, "perfect for", "the perfect gift". [`bannedPhrases.sellingWordsAndAiTells`]
8. **No AI tells.** delve, dive into, embark, tapestry, "testament to", "it's worth noting", "in conclusion", navigate, game-changer, "when it comes to", "not only … but also", "whether you're … or …", "look no further", "in the heart of", "something for everyone", "rest assured", "we've got you covered", "elevate your", "unlock", seamless, nestled, boasts. Three em dashes per page at most. [`bannedPhrases.sellingWordsAndAiTells`]
9. **No page talking about itself.** Cut "This page covers", "Below you'll find", "Scroll down to", "Welcome to our website", "Browse our collection of". The page shows it. [`bannedPhrases.processNarration`]
10. **No research notes or caveats in visible text.** No "(unverified)", "as of [date]", "according to", source names in brackets, "we believe" about facts. Unconfirmed facts aren't content: they stay as a visible `[to confirm]` placeholder in the build, which the gate refuses at launch. [`bannedPhrases.researchNotes`, `placeholders`]
11. **No stacked colons or semicolons.** One per sentence at most. Labels stay on labels ("Size: 45cm" in a spec list is fine; in a sentence it isn't). [`p-colon-chain`, `p-semicolon-chain`]
12. **No templated sentence repeated down a page.** No identical sentence of six or more words three times on one page. Each product card line says something only that product has. [`rep-identical-sentence`]
13. **The brand is not the subject.** No "ChoZen Boutique offers / provides / is proud to". Say "we". At most two brand mentions in body prose; the lede and legal lines don't count. [`p-brand-subject`, `p-brand-count`]
14. **Numbers the way a person says them.** "Order by 10am", "from £45", "about 40cm tall", "two to three weeks". Never "10:00", never "£45.00" in prose, never a sentence starting with a numeral. Postcodes are capitals with no full stops (EN2, N21).
15. **UK English and UK words.** Colour, jewellery, personalised, organise, favourite, centre, post (not mail), postcode (not zip), mum, Mother's Day, basket (not cart in visible text; Shopify's "cart" URL stays), checkout, mobile. [`bannedPhrases.usTerms`]
16. **Kind words for hard days.** Sympathy pages and products: no exclamation marks, no "celebrate", no urgency language, no countdowns, no upsell of balloons. Plain, gentle, practical: where we can deliver, by when, what to write on the card.
17. **Urgency only when it's true.** The countdown shows only before the real cut-off on a real delivery day. No fake scarcity ("only 2 left" unless stock says so), no fake timers, no "order in the next" after the cut-off. [`dark-patterns`]
18. **Reviews are real or absent.** Never write, edit or paraphrase a review. No star ratings in copy or schema until real reviews exist. [`fake-reviews`]
19. **Alt text describes the photo, not the SEO.** "Twelve red roses with eucalyptus in kraft paper, tied with cream ribbon." Not "best red roses bouquet Enfield same day delivery". Under 125 characters. Decorative images get `alt=""`.

---

## Before and after (patterns to expect on the Wix site)

Her own sentences replace these examples once the capture exists. The patterns are the common ones on Wix florist
and crystal shops, so the rewrite rules are ready.

### 1. A product with a placeholder name
**Before:** "Flower 2 — £100"
**After:** "Blush garden roses with jasmine — from £[PRICE]. Ten blush garden roses, white spray roses and trailing jasmine, hand-tied in ivory paper. About 45cm tall."
**What changed:** the name says what it is. The first line is what arrives, with a size, so nobody's surprised at the door.

### 2. A crystal health claim
**Before (typical):** "Amethyst heals anxiety and helps you sleep."
**After:** "Amethyst has long been associated with calm and quiet evenings, and it's a favourite on bedside tables. A purple cluster about 6cm across."
**What changed:** the effect claim became tradition, and the sentence ends on what you actually get.

### 3. A heading written for a search engine
**Before:** "Same Day Flower Delivery Enfield | Florist Near Me"
**After:** "Can I get flowers delivered in Enfield today?"
**What changed:** a question a person asks. The answer's first sentence gives the cut-off and the area.

### 4. A page that describes itself
**Before:** "Welcome to our crystal library! Below you'll find information on all our crystals."
**After:** "Every crystal we sell, with its colour, where it's found and the meaning it's traditionally given."
**What changed:** the opener says what's there, in a sentence that works on its own.

### 5. Hype
**Before:** "Our stunning luxury bouquets are the perfect gift for any occasion!"
**After:** "Bouquets made up in Enfield on the morning they're delivered, from £[PRICE]."
**What changed:** one checkable fact and a price instead of three adjectives. (The "made up the morning" fact goes in only once she confirms it.)

---

## Words she uses (the starter set until the capture)

hand-delivered, same day, order by 10am, made up, hand-tied, stems, seasonal, card message, the door, Enfield,
North London, keepsake, kept for years, gift-wrapped (if true), posted UK-wide, traditionally associated with,
in crystal lore, a symbol of.

## Where the rules and SEO pull apart (and what wins)

1. **Place names in headings.** Area pages need "Winchmore Hill" in the H1 and title. Keep it, but in a sentence a person would say ("Flowers delivered today in Winchmore Hill, N21"), never a stacked keyword string.
2. **"Florist Enfield" is ambiguous** (Enfield, Connecticut fills US results). Titles say "Enfield, London" or carry a postcode. That's a fact, not keyword stuffing.
3. **FAQ blocks.** Questions mirror what people ask; answers stay short. FAQPage schema only mirrors visible text and isn't a ranking lever (Google retired the FAQ rich result for most sites).
4. **Area pages are not doorway pages.** One page per real delivery area group (8–10), each with that area's fee, the roads or landmarks we really deliver to, and real delivery photos as they come. If an area page can't say something only it can say, it gets merged.
