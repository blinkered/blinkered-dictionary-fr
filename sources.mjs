/**
 * The collections that attest French, and where each comes from.
 *
 * The only language-specific file in this repository. How to read a collection lives in
 * `@blinkered/attestation`; what lives here is which collections, and why those.
 *
 * Chosen for **family** as much as for volume. Three collections gathered by one organization
 * are one opinion, so what matters is how many genuinely separate gatherers a word can be found
 * by: a wiki, a newspaper crawler, a shelf of books, a sentence bank, a translation, the crawled
 * web, and any site we fetch ourselves.
 */

import { createReadStream, existsSync, readFileSync, readdirSync } from 'node:fs'
import { createInterface } from 'node:readline'
import {
  fileDocuments,
  fineweb2Documents,
  gutenbergBody,
  harvestDocuments,
  leipzigLocators,
  leipzigSentences,
  tatoebaDocuments,
  verseDocuments,
  wikiDocuments,
} from '@blinkered/attestation'

export const LANGUAGE = 'fr'

const CACHE = new URL('.cache/raw/', import.meta.url).pathname

/** A Leipzig package, with its sentence-to-URL index resolved up front. */
function leipzig(pkg) {
  const base = `${CACHE}${pkg}/${pkg}`
  const locators = leipzigLocators(
    readFileSync(`${base}-inv_so.txt`, 'utf8'),
    readFileSync(`${base}-sources.txt`, 'utf8'),
  )
  const lines = createInterface({
    input: createReadStream(`${base}-sentences.txt`),
    crlfDelay: Infinity,
  })
  return leipzigSentences(lines, locators)
}

/** A directory of Gutenberg texts, each named by its permanent ebook number. */
function gutenberg(dir) {
  const at = `${CACHE}${dir}`
  const books = readdirSync(at)
    .filter((file) => file.endsWith('.txt'))
    .map((file) => ({ locator: file.replace('.txt', ''), path: `${at}/${file}` }))
  return fileDocuments(books, async (path) => gutenbergBody(readFileSync(path, 'utf8')))
}

export const SOURCES = [
  {
    id: 'wiki:fr',
    what: 'French Wikipedia — modern encyclopedic prose',
    needs: `${CACHE}frwiki.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}frwiki.xml.bz2`),
  },
  {
    id: 'wikisource:fr',
    what: 'Wikisource — same Wikimedia family, so it corroborates rather than counts',
    needs: `${CACHE}frwikisource.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}frwikisource.xml.bz2`),
  },
  {
    id: 'lz:fra_news_2024_1M',
    what: 'Leipzig fra_news_2024_1M — modern news, cited by the page each sentence came from',
    needs: `${CACHE}fra_news_2024_1M`,
    documents: () => leipzig('fra_news_2024_1M'),
  },
  {
    id: 'lz:fra_news_2023_1M',
    what: 'Leipzig fra_news_2023_1M — modern news, cited by the page each sentence came from',
    needs: `${CACHE}fra_news_2023_1M`,
    documents: () => leipzig('fra_news_2023_1M'),
  },
  {
    id: 'tat',
    from: 'https://downloads.tatoeba.org/exports/per_language/fra/fra_sentences.tsv.bz2',
    what: 'Tatoeba — contemporary, conversational',
    needs: `${CACHE}fra_sentences.tsv`,
    documents: () => tatoebaDocuments(`${CACHE}fra_sentences.tsv`),
  },
  {
    id: 'gut',
    from: 'https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv',
    what: 'Project Gutenberg — published books, a register nothing else here reaches',
    needs: `${CACHE}gutenberg-fr`,
    documents: () => gutenberg('gutenberg-fr'),
  },
  {
    id: 'ebible:fraLSG',
    from: 'https://ebible.org/Scriptures/fraLSG_vpl.zip',
    what: 'A translation — a family nothing else here belongs to',
    needs: `${CACHE}ebible-fraLSG/fraLSG_vpl.txt`,
    documents: () => verseDocuments(`${CACHE}ebible-fraLSG/fraLSG_vpl.txt`),
  },
  {
    id: 'ia',
    // Scanned books are OCR, and OCR fails in a way that looks like text. Clean Gutenberg scores
    // a median 52% known words and never below 36%; the worst of these scored 1%, an English
    // book read as Cyrillic. Below this floor a book is not legible enough to attest anything.
    legible: 0.35,
    what: 'Internet Archive french books — literature, and the register a newspaper never reaches',
    needs: `${CACHE}archive-fr`,
    from: 'https://archive.org/details/booksbylanguage_french',
    documents: () => {
      const dir = `${CACHE}archive-fr`
      // A locator names the text, not the item: the catalogue page holds no word of the book.
      // `files.tsv` maps an item to the file we read; a book with no recorded name is skipped
      // rather than cited at a page that cannot support it.
      const named = new Map(
        readFileSync(`${dir}/files.tsv`, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((line) => line.split('\t')),
      )
      const books = readdirSync(dir)
        .filter((file) => file.endsWith('.txt'))
        .map((file) => file.replace('.txt', ''))
        .filter((id) => named.has(id))
        // The filename is percent-encoded: two thirds of them contain spaces, and a locator with
        // a space in it would split into two locators, because the evidence format spends spaces
        // as separators. Encoding is also what the URL needs.
        .map((id) => ({
          locator: `${id}/${encodeURIComponent(named.get(id))}`,
          path: `${dir}/${id}.txt`,
        }))
      return fileDocuments(books, async (path) => readFileSync(path, 'utf8'))
    },
  },
].filter((source) => {
  // A collection that has not been downloaded is skipped with a warning rather than crashing
  // the build, and which collections a language actually has is a fact worth seeing in the log.
  // Checked by path rather than by calling `documents()`: these are lazy generators, so calling
  // one proves nothing and calling it twice would open the file twice.
  if (existsSync(source.needs)) return true
  process.stderr.write(`  (skipping ${source.id}: ${source.needs} is not in .cache/raw)\n`)
  return false
})

/**
 * Pages fetched by searching for words the collections missed, one family per domain.
 *
 * Absent until a harvest has been run; see the repository README.
 */
export const HARVEST = existsSync(new URL('searched.tsv', import.meta.url).pathname)
  ? () => harvestDocuments(new URL('searched.tsv', import.meta.url).pathname)
  : undefined

/**
 * French publishers, each its own family, for the harvest that mops up the tail.
 *
 * French starts well off — a Wikipedia, Leipzig news, four thousand Gutenberg books, Tatoeba and
 * a Bible make five families before a single page is fetched — so these exist to rescue the last
 * few hundred words rather than to carry the language. Chosen across registers: a wire service,
 * broadsheets, a tabloid, regional press, and the Belgian and Swiss and Canadian French that
 * Paris does not write.
 */
export const DOMAINS = [
  // Books and scholarship, a register the news domains above never reach
  'atramenta.net', 'bibebook.com', 'inlibroveritas.net', 'journals.openedition.org',
  'persee.fr', 'actualitte.com', 'poesie.webnet.fr', 'oeuvresouvertes.net',
  'lemonde.fr',
  'liberation.fr',
  'lefigaro.fr',
  // France Télévisions serves its journalism here; francetvinfo.fr redirects to it. One
  // publisher, one family, so the entry names the domain the pages are actually on.
  'franceinfo.fr',
  'rfi.fr',
  'lepoint.fr',
  'nouvelobs.com',
  'la-croix.com',
  'ouest-france.fr',
  'sudouest.fr',
  'ladepeche.fr',
  'leparisien.fr',
  // Outside France, which is a register of its own
  'rtbf.be',
  'lesoir.be',
  'rts.ch',
  'letemps.ch',
  'ledevoir.com',
  'lapresse.ca',
]

/** Carried over from Blinkered's calibration; must be re-measured before anything ships. */
export const COMMON_CUT = 16593
