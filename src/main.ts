import { Actor, log } from 'apify';
import { aiEnabled, runAiInsights, AiInput } from './ai.js';
import { BasicCrawler } from 'crawlee';
import { parseItemId, reviewsUrl, isBlocked, parsePage, SORTS, Sort } from './parsers.js';

interface Input extends AiInput { startUrls?: ({ url: string } | string)[]; itemIds?: string[]; maxReviewsPerProduct?: number; sort?: Sort; includeProduct?: boolean; proxyConfiguration?: any }
await Actor.init();
const input = (await Actor.getInput<Input>()) ?? {};
const maxIn = Number.isFinite(Number(input.maxReviewsPerProduct)) && Number(input.maxReviewsPerProduct) >= 0 ? Math.floor(Number(input.maxReviewsPerProduct)) : 50;
const sort: Sort = SORTS.includes(input.sort as Sort) ? (input.sort as Sort) : 'submission-desc';
const now = new Date().toISOString();
const ids: string[] = [];
const toStr = (u: any): string => String(typeof u === 'object' && u ? u.url ?? '' : u ?? '').trim();
let raw = [...(Array.isArray(input.startUrls) ? input.startUrls : []).map(toStr), ...(Array.isArray(input.itemIds) ? input.itemIds : []).map(toStr)].filter(Boolean);
const demo = !raw.length;
if (demo) { log.warning('No startUrls or itemIds given. Running a short demo with https://www.walmart.com/ip/5113175776 (5 reviews). Add your own Walmart URLs or item ids.'); raw = ['https://www.walmart.com/ip/5113175776']; }
const max = demo ? Math.min(5, maxIn) : maxIn;
const inputErrors: { type: 'error'; input: string; error: string }[] = [];
for (const r of raw) {
  try { const id = parseItemId(r); if (!ids.includes(id)) ids.push(id); } catch (e) { log.error((e as Error).message); inputErrors.push({ type: 'error', input: r, error: (e as Error).message }); }
}
if (inputErrors.length) await Actor.pushData(inputErrors);
if (!ids.length) { const m = 'None of the given inputs is a Walmart product. Use a URL like https://www.walmart.com/ip/5113175776 or a numeric item id.'; log.error(m); await Actor.exit({ statusMessage: m }); }
const proxy = await Actor.createProxyConfiguration(input.proxyConfiguration ?? { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'], apifyProxyCountry: 'US' });
const count = new Map<string, number>();
const seen = new Set<string>();
let blocks = 0;

const crawler = new BasicCrawler({
  maxRequestRetries: 8, maxConcurrency: 4, requestHandlerTimeoutSecs: 60, useSessionPool: true,
  sessionPoolOptions: { maxPoolSize: 50, sessionOptions: { maxUsageCount: 15, maxErrorScore: 1 } },
  async requestHandler({ request, session, sendRequest, crawler: c }) {
    const { itemId, page } = request.userData as { itemId: string; page: number };
    const res: any = await sendRequest({ url: request.url, proxyUrl: await proxy?.newUrl(session?.id), throwHttpErrors: false, timeout: { request: 30000 },
      headerGeneratorOptions: { browsers: ['chrome'], devices: ['desktop'], locales: ['en-US'], operatingSystems: ['windows'] } } as any);
    if (res.statusCode === 404) { log.error(`${itemId}: product not found (404).`); return; }
    if (isBlocked(res.url, res.body) || res.statusCode >= 400) { blocks++; session?.retire(); throw new Error(`Blocked/HTTP ${res.statusCode} on ${request.url}; retrying with a new IP`); }
    const { product, reviews, hasNext } = parsePage(res.body, itemId, now);
    if (page === 1 && !product.name && !reviews.length) { log.error(`${itemId}: product not found on Walmart.`); return; }
    if (page === 1 && (input.includeProduct ?? true)) await Actor.pushData(product);
    const done = count.get(itemId) ?? 0;
    const take = reviews.filter((r) => !seen.has(`${itemId}:${r.reviewId}`)).slice(0, Math.max(0, max - done));
    take.forEach((r) => seen.add(`${itemId}:${r.reviewId}`)); // variants share reviews: dedupe per requested product
    if (take.length) await Actor.pushData(take); // charged via apify-default-dataset-item
    count.set(itemId, done + take.length);
    log.info(`${itemId}: page ${page}, ${done + take.length}/${max} reviews`);
    if (hasNext && reviews.length && done + take.length < max) await c.addRequests([{ url: reviewsUrl(itemId, page + 1, sort), userData: { itemId, page: page + 1 } }]);
  },
  failedRequestHandler({ request }, e) { log.error(`Gave up on ${request.url}: ${e.message}`); },
});
await crawler.run(ids.map((id) => ({ url: reviewsUrl(id, 1, sort), userData: { itemId: id, page: 1 } })));
const total = [...count.values()].reduce((a, b) => a + b, 0);
await Actor.setValue('OUTPUT', { products: ids.map((id) => ({ itemId: id, reviews: count.get(id) ?? 0 })), totalReviews: total, blockedRetries: blocks });
if (count.size && aiEnabled(input)) { try { await runAiInsights(input, 'walmart'); } catch (e) { log.error(`AI insights failed: ${(e as Error).message}`); } }
if (!count.size) await Actor.exit({ statusMessage: 'No reviews could be scraped (product not found, no reviews, or Walmart blocked the request). See the log; try again later.' }); else await Actor.exit(`${count.size} product(s), ${total} reviews, ${blocks} blocked retries.`);
