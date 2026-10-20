# Walmart Products & Reviews Scraper

[![CI](https://github.com/ENER90/walmart-reviews-scraper/actions/workflows/ci.yml/badge.svg)](https://github.com/ENER90/walmart-reviews-scraper/actions/workflows/ci.yml)

[![Apify Store](https://img.shields.io/badge/Apify%20Store-live-0F62FE?logo=apify&logoColor=white)](https://apify.com/ener90/walmart-products-reviews)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Crawlee](https://img.shields.io/badge/Crawlee-3-FF4785)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Scrapes Walmart customer reviews and product data (price, availability, rating breakdown, Walmart's AI review summary) reliably by targeting review pages, which are far less protected than product pages. No personal data.

▶️ **Run it on the Apify Store:** https://apify.com/ener90/walmart-products-reviews

## Tech stack
TypeScript, Node.js 22, Crawlee (BasicCrawler, got-scraping), Apify SDK, Vitest.

## Architecture
```
src/
  parsers.ts   # pure, unit-tested parsing/transform logic (no I/O)
  main.ts      # Actor entry: input validation, crawling, retries, output
.actor/        # Apify Actor config: input/output/dataset schemas, Dockerfile, Store README
tests/         # Vitest unit tests + real HTML/JSON fixtures
```
- `parsers.ts`: `__NEXT_DATA__` extraction, product + review mappers that drop nickname/author/location, block-page detection.
- `main.ts`: Crawlee `BasicCrawler` with session pool + US residential proxy; per-product de-duplication (Walmart pools reviews across variants).

Design principles: **reliability first** (session rotation, retries, block detection, clear error messages), **privacy by default** (no personal data is collected), **low cost** (small memory footprint, resource blocking, pay-per-event pricing).

## Run locally
```bash
npm install
npm test            # 5 unit tests (Vitest)
npm run build
# put an input in storage/key_value_stores/default/INPUT.json, then:
npm start           # or: apify run
```
Deploy: `apify login && apify push`.

## Input / output
See [`.actor/input_schema.json`](.actor/input_schema.json), [`.actor/dataset_schema.json`](.actor/dataset_schema.json) and the full user docs in [`.actor/STORE_README.md`](.actor/STORE_README.md) (English & Spanish).

## Legal & privacy
Collects only publicly available data and deliberately drops personal identifiers. Users are responsible for complying with the target site's terms and applicable law.

## License
MIT © René Del Valle Rodríguez
