import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseItemId, reviewsUrl, isBlocked, parsePage, usDate } from '../src/parsers.js';
const html = readFileSync('tests/fixtures/reviews_5113175776_p2.html', 'utf8');
describe('input', () => {
  it('ids', () => {
    expect(parseItemId('https://www.walmart.com/ip/Acer-Chromebook/5113175776?x=1')).toBe('5113175776');
    expect(parseItemId('https://www.walmart.com/ip/5113175776')).toBe('5113175776');
    expect(parseItemId('https://www.walmart.com/reviews/product/5113175776')).toBe('5113175776');
    expect(parseItemId('5113175776')).toBe('5113175776');
    expect(() => parseItemId('https://amazon.com/x')).toThrow();
    expect(reviewsUrl('1', 2, 'helpful')).toBe('https://www.walmart.com/reviews/product/1?sort=helpful&page=2');
  });
});
describe('parse', () => {
  const { product, reviews, hasNext } = parsePage(html, '5113175776', 'n');
  it('product', () => {
    expect(product).toMatchObject({ itemId: '5113175776', price: 242.99, availability: 'IN_STOCK', averageRating: 4.4, totalReviews: 20621 });
    expect(product.name).toMatch(/Acer Chromebook/); expect(product.ratingCounts['5']).toBe(15076); expect(product.reviewsSummary).toBeTruthy(); expect(product.aspectSummaries.length).toBeGreaterThan(0);
  });
  it('reviews', () => {
    expect(reviews).toHaveLength(10); expect(hasNext).toBe(true);
    expect(reviews[0]).toMatchObject({ reviewId: '425884930', rating: 5, date: '2026-05-17', verifiedPurchase: true });
  });
  it('no personal data', () => expect(JSON.stringify(reviews)).not.toMatch(/userNickname|authorId|Nicole|userLocation/));
  it('block + dates', () => { expect(isBlocked('https://www.walmart.com/blocked?url=x', '')).toBe(true); expect(isBlocked('', html)).toBe(false); expect(usDate('1/2/2026')).toBe('2026-01-02'); });
});
