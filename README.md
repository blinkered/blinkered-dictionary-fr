# Blinkered dictionary: French

The French word list, and the evidence for every word in it.

Built by [`blinkered-attestation`](https://github.com/blinkered/blinkered-attestation). The rule,
the evidence format and the reasoning live there; what lives here is French.

## What is in this repository

```
sources.mjs        which collections attest French, and why those
attestations/      the evidence: every candidate, what saw it, and where
words.txt          what survived, in Blinkered's own format
dropped.tsv        what did not, and how close it came
SATURATION.md      what each family was worth, measured from the evidence
curve.json         the same curve, for the chart in blinkered-attestation
searched.tsv       the harvest: which pages were fetched, and what they held
```

The evidence is a **directory** because French's runs to sixty megabytes and GitHub warns above
fifty. Each shard is a complete, independently valid evidence file with its own header and digest.

`.cache/` holds the downloaded collections and is not tracked. Everything here is regenerable
with `pnpm build`.

## Where the words come from

144,105 candidates from Blinkered's current French list, answered by fourteen families: a
Wikipedia and a Wikisource, seven years of Leipzig news and web crawls, Tatoeba, Project
Gutenberg, an eBible translation, and the French-language press of France, Belgium, Switzerland
and Quebec fetched a few hundred pages at a time.

**Thirteen of those fourteen can be checked by fetching.** Only Leipzig cannot, because its
locators record where somebody else's crawler found a sentence and the document holding it is
Leipzig's own published package. That count matters more than the family count: it is how much of
this list a sceptic could confirm without taking our word for anything.

## What is missing, and it is not volume

[`dropped.tsv`](dropped.tsv) is the check, not the keep rate. Asked which families keep pairing
up in the near misses, it gives an unambiguous answer:

```
fr: 39,795 words came within one family of surviving

    32941   82.8%  gutenberg + wikimedia    ABACA, ABAISSANTE, ABAISSENT, ABAISSERAIT
     4126   10.4%  leipzig + wikimedia      ABRASIF, ABRASIFS, ABRASIVES, ABYSSE
```

Thirty-three thousand words — nearly a quarter of the candidate list — are attested by a
Wikipedia and a Gutenberg and by nothing else. ABAISSANTE, ABAISSERAIT: ordinary literary French
that a newspaper has no use for. Another newspaper would add a hundred words; what these need is
a second shelf of books, gathered by somebody other than Gutenberg. `DOMAINS` now carries a
literary tier for exactly that, and the next build is where it shows.

## Rebuilding

```sh
pnpm install
pnpm build       # writes the evidence, words.txt, dropped.tsv
pnpm conform     # checks that words.txt says only what the evidence supports
pnpm saturation  # re-measures what each family was worth
pnpm verify --sample 10      # fetches cited pages and checks they hold the word
pnpm harvest 250 # fetches pages from the publishers in DOMAINS
```

A change here is not finished until the roll-up in `blinkered-attestation` is regenerated —
`pnpm roll` there. That is
[the rule](https://github.com/blinkered/blinkered-attestation#the-rule-for-changing-a-language),
and it exists because a summary nobody can trust is worse than no summary.

## Before this ships

The common-tier cut in `sources.mjs` is carried over from Blinkered's calibration against the
**old** list and has to be re-measured. Skipping it is a silent fault rather than a loud one: the
word floor ends up above what any board can reach, every draw is rejected, and the generator
plays its best failed attempt while reporting failure.

## Licensing

Three kinds of thing live here and they do not share terms. The distinction is the
project: a licence that claimed more than we can support would undo the argument the
evidence is here to make. [NOTICE](NOTICE) is the authority; this is the summary.

| | terms | what |
| --- | --- | --- |
| **Code and docs** | [Apache-2.0](LICENSE) | `build.mjs`, `sources.mjs`, `harvest.mjs`, `conform.mjs`, `saturation.mjs`, and the Markdown |
| **The list and its evidence** | [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `words.txt`, `attestations/*.tsv`, `status.json`, `SATURATION.md`, `COLLECTIONS.md`, `searched.tsv` |
| **The words we could not prove** | `MPL-2.0` | `dropped.tsv` — **not ours to license** |

**Why the list is CC0.** A word ships because three independent collections of text were
found to contain it. The record of which collections, and where in them, is a statement
of fact about those texts rather than a copy of them, and nothing a licence governs was
taken from the dictionary that proposed the candidates. To the extent any right subsists
in the compilation, it is waived.

**Why `dropped.tsv` is not.** Every other file here rests on evidence we gathered. That
one does not: it is the candidates that failed, and a candidate that failed is a word we
have nothing to say about except that somebody's dictionary proposed it. That makes the
file a subset of that dictionary and it carries that dictionary's terms — here
`MPL-2.0`. See
[`blinkered-attestation/candidates/fr/LICENSE`](https://github.com/blinkered/blinkered-attestation/blob/main/candidates/fr/LICENSE).
