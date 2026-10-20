export const SORTS = ['relevancy', 'submission-desc', 'helpful', 'rating-desc', 'rating-asc'] as const;
export type Sort = (typeof SORTS)[number];

/** Walmart product URL (/ip/.../123, /reviews/product/123) or numeric item id. */
export function parseItemId(input: string): string {
  const s = input.trim();
  let m = s.match(/walmart\.com\/(?:ip\/(?:[^/?#]+\/)?|reviews\/product\/)(\d{5,})/i);
  if (m) return m[1];
  m = s.match(/^(\d{5,})$/);
  if (m) return m[1];
  throw new Error(`"${s}" is not a Walmart product URL (walmart.com/ip/...) or numeric item id.`);
}
export const reviewsUrl = (id: string, page: number, sort: Sort) => `https://www.walmart.com/reviews/product/${id}?sort=${sort}&page=${page}`;

export const isBlocked = (url: string, body: string) => /\/blocked\?|px-captcha|Robot or human/i.test(url + body.slice(0, 30000));

export function nextData(html: string): any {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('No __NEXT_DATA__ on page (layout change or block page).');
  return JSON.parse(m[1]);
}

export interface ProductRecord {
  type: 'product'; itemId: string; name: string | null; url: string | null; price: number | null; priceString: string | null; availability: string | null;
  categoryPath: string[]; productType: string | null; imageUrl: string | null; averageRating: number | null; totalReviews: number | null;
  ratingCounts: Record<'1' | '2' | '3' | '4' | '5', number | null>; recommendedPercentage: number | null; reviewsSummary: string | null;
  aspectSummaries: { aspect: string; label: string | null; polarity: string | null; summary: string | null }[]; scrapedAt: string;
}
export interface ReviewRecord {
  type: 'review'; itemId: string; reviewedItemId: string | null; productName: string | null; reviewId: string; rating: number | null; title: string | null; text: string | null;
  date: string | null; verifiedPurchase: boolean; recommended: boolean | null; helpfulVotes: number | null; unhelpfulVotes: number | null;
  photoCount: number; sellerName: string | null; fulfilledBy: string | null; syndicationSource: string | null; language: string | null; scrapedAt: string;
}

const num = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
/** "5/17/2026" -> "2026-05-17" */
export const usDate = (s: any) => { const m = String(s ?? '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` : (s ?? null); };

export function parsePage(html: string, itemId: string, now: string) {
  const data = nextData(html)?.props?.pageProps?.initialData?.data;
  if (!data?.reviews) throw new Error('Unexpected reviews page shape (no initialData.data.reviews).');
  const p = data.product ?? {}, r = data.reviews;
  const product: ProductRecord = {
    type: 'product', itemId, name: p.name ?? null, url: p.canonicalUrl ? `https://www.walmart.com${p.canonicalUrl}` : `https://www.walmart.com/ip/${itemId}`,
    price: num(p.priceInfo?.currentPrice?.price), priceString: p.priceInfo?.currentPrice?.priceString ?? null, availability: p.availabilityStatus ?? null,
    categoryPath: (p.category?.path ?? []).map((c: any) => c.name).filter(Boolean), productType: p.type ?? null, imageUrl: p.imageInfo?.thumbnailUrl ?? null,
    averageRating: num(r.averageOverallRating), totalReviews: num(r.totalReviewCount),
    ratingCounts: { '1': num(r.ratingValueOneCount), '2': num(r.ratingValueTwoCount), '3': num(r.ratingValueThreeCount), '4': num(r.ratingValueFourCount), '5': num(r.ratingValueFiveCount) },
    recommendedPercentage: num(r.recommendedPercentage), reviewsSummary: r.reviewSummary?.summary ?? null,
    aspectSummaries: (r.bulletReviewSummary?.bulletSummaryAspects ?? []).map((a: any) => ({ aspect: a.aspectName, label: a.aspectPillText ?? null, polarity: a.aspectPolarity ?? null, summary: a.aspectSummary ?? null })),
    scrapedAt: now,
  };
  // Deliberately drops authorId, userNickname, userLocation and user badges (personal data).
  const reviews: ReviewRecord[] = (r.customerReviews ?? []).map((c: any) => ({
    type: 'review', itemId, reviewedItemId: c.itemId ? String(c.itemId) : null, productName: c.itemName ?? product.name, reviewId: String(c.reviewId), rating: num(c.rating),
    title: c.reviewTitle ?? null, text: c.reviewText ?? null, date: usDate(c.reviewSubmissionTime),
    verifiedPurchase: (c.badges ?? []).some((b: any) => b?.id === 'VerifiedPurchaser'), recommended: typeof c.recommended === 'boolean' ? c.recommended : null,
    helpfulVotes: num(c.positiveFeedback), unhelpfulVotes: num(c.negativeFeedback), photoCount: (c.photos ?? []).length + (c.media ?? []).length,
    sellerName: c.sellerName ?? null, fulfilledBy: c.fulfilledBy ?? null, syndicationSource: c.syndicationSource?.name ?? (typeof c.syndicationSource === 'string' ? c.syndicationSource : null),
    language: c.originalLanguage ?? null, scrapedAt: now,
  }));
  const hasNext = !!r.pagination?.next?.url;
  return { product, reviews, hasNext, totalPages: num(r.pagination?.total) };
}
