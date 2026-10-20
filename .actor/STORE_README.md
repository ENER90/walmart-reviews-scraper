# Walmart Products & Reviews Scraper

**Pricing:** US$0.0004 per result row (review or product) = US$0.40 per 1,000. No start fee. / **Precio:** US$0,0004 por fila (reseña o producto) = US$0,40 por 1.000, sin cargo de inicio.

🇬🇧 [English](#english) · 🇪🇸 [Español](#español)

## English

Get **Walmart customer reviews** and the **product data** behind them from a product URL or item ID.

- **Review fields:** rating, title, text, date, verified-purchase flag, helpful and unhelpful votes, photo count, seller and fulfillment.
- **Product row:** current price, availability, category path, average rating, 1–5★ breakdown, % recommended and Walmart's own **AI review summary**, with per-aspect summaries (battery, screen and so on).

**Reliability first.** It reads Walmart's review pages, which are lighter and much less blocked than product pages. It uses US residential IPs, rotates sessions and retries automatically. Memory use is low (256 MB is enough). **Reviewer names, IDs and locations are never collected.**

Note: Walmart pools reviews across variants (colors and sizes) of one product. `itemId` is the product you asked for, and `reviewedItemId` is the exact variant the reviewer bought.

**Use cases:** product research and competitor monitoring, review mining for e-commerce brands, price and availability snapshots, and AI agents or RAG pipelines.

**Input**
```json
{ "startUrls": [{ "url": "https://www.walmart.com/ip/5113175776" }], "maxReviewsPerProduct": 100, "sort": "submission-desc" }
```
`itemIds` also takes plain numeric IDs. Sort options: newest, most relevant, most helpful, highest or lowest rating. Set `maxReviewsPerProduct: 0` to get only the product row (price and rating tracking).

**Output example**
```json
{ "type": "review", "itemId": "5113175776", "rating": 5, "title": "affordable and worth it", "text": "love it…", "date": "2026-05-17", "verifiedPurchase": true, "helpfulVotes": 0 }
{ "type": "product", "itemId": "5113175776", "name": "Acer Chromebook 315…", "price": 242.99, "availability": "IN_STOCK", "averageRating": 4.4, "totalReviews": 20621, "reviewsSummary": "Customers are pleased with…" }
```

**Integrations:** Apify API (`run-sync-get-dataset-items`), n8n, Make and Zapier through the Apify node or app, the [Apify MCP server](https://mcp.apify.com) for AI agents, and export to JSON, CSV or Excel.

**FAQ**
- *How many reviews can I get?* Walmart shows 10 per page. Large products have thousands.
- *Does it get the full product spec sheet?* No. It gets price, availability, category, ratings and the review summary. Full product pages are heavily protected by anti-bot measures, so we skip them for reliability.
- *Personal data?* None. No names, reviewer IDs or locations.
- *Is it legal?* Only public data is collected. Check Walmart's terms and the law where you are for your use case.

## Español

Obtiene **reseñas de clientes de Walmart** y **datos del producto** a partir de su URL o ID.

- **Cada reseña:** nota, título, texto, fecha, compra verificada, votos útiles, número de fotos y vendedor.
- **Fila del producto:** precio, disponibilidad, categoría, nota promedio, desglose de 1 a 5★, % de recomendación y el **resumen con IA del propio Walmart**.

Está pensado para ser confiable: usa las páginas de reseñas (bastante menos bloqueadas), IPs residenciales de EE. UU., rotación de sesiones y reintentos automáticos. Consume poca memoria. **No guarda nombres, IDs ni ubicaciones de quienes escriben las reseñas.**

**Entrada:** `startUrls` o `itemIds`, `maxReviewsPerProduct` (0 = solo el producto) y `sort`.

**Integraciones:** API de Apify, n8n, Make, Zapier y el servidor MCP de Apify. Exporta a JSON, CSV o Excel.

**Preguntas frecuentes:** no trae la ficha técnica completa, porque las páginas de producto tienen un antibot fuerte y se priorizó la confiabilidad. No guarda datos personales. Solo extrae datos públicos.

## 🤖 AI insights (optional) / Análisis con IA (opcional)

Turn on **AI insights** and paste your own **Gemini** key (free tier at [aistudio.google.com](https://aistudio.google.com/apikey)) or your **OpenAI** key. After scraping, the Actor adds one row per product with **sentiment %, top pros and cons, recurring complaints, feature requests, notable quotes and an executive summary**, so you get the main findings from 1,000 reviews in about a minute. **AI add-on price: US$0.0002 per review analyzed (US$0.20 per 1,000), event `review-analyzed`, effective from 4 Nov 2026 (Apify's 14-day notice for new paid events). Until then it's free.** The `ai-insight` row itself also counts as one normal result. The AI tokens are billed by your own provider. It's off by default.

Activa **AI insights** y pega tu key de **Gemini** o de **OpenAI**. Al terminar, el actor agrega una fila por producto con el **% de sentimiento, los pros y contras principales, las quejas que se repiten, lo que piden los clientes y un resumen ejecutivo**. Precio del add-on: US$0,0002 por reseña analizada (US$0,20 por 1.000), vigente desde el 4 nov 2026; hasta entonces es gratis. Los tokens de IA los cobra tu proveedor. Viene desactivado por defecto.

## ❓ FAQ

**How do I export Walmart reviews to Excel or CSV?**
Paste product URLs or item IDs, run the scraper, then download the dataset as CSV, Excel or JSON, or send it to Google Sheets.

**Do I need a Walmart API key?**
No. It works as an unofficial Walmart reviews API without any key.

**Is personal data collected?**
No. Reviewer names, IDs and locations are never stored.

## 🔗 More scrapers by ener90 / Más scrapers de ener90

- [Mercado Libre Reviews & Questions Scraper](https://apify.com/ener90/mercadolibre-reviews-questions) – opiniones y preguntas de Mercado Libre
- [Mercado Libre Price Tracker](https://apify.com/ener90/mercadolibre-seller-price-monitor) – monitor de precios de tiendas oficiales de Mercado Libre
- [TrustRadius Reviews Scraper](https://apify.com/ener90/software-reviews-scraper) – reseñas de software B2B de TrustRadius
- [Product Hunt Scraper](https://apify.com/ener90/product-hunt-launches) – lanzamientos diarios de Product Hunt
- Chile Real Estate Scraper (Portal Inmobiliario + TocToc) (`ener90/chile-real-estate-scraper`, coming soon / próximamente) – propiedades en venta y arriendo en Chile
- AI Review Insights (`ener90/ai-review-insights`, coming soon / próximamente) – análisis de reseñas con IA

Need a custom scraper or a different site? Open an issue in the **Issues** tab. / ¿Necesitas un scraper a medida? Escríbeme en la pestaña **Issues** (soporte en español).

## 🧩 API & integrations quick start

**cURL (sync, returns items)**
```bash
curl -X POST "https://api.apify.com/v2/acts/ener90~walmart-products-reviews/run-sync-get-dataset-items?token=YOUR_APIFY_TOKEN" \
  -H "Content-Type: application/json" -d '{"itemIds":["5113175776"],"maxReviewsPerProduct":50}'
```

**Node.js**
```js
import { ApifyClient } from 'apify-client';
const client = new ApifyClient({ token: process.env.APIFY_TOKEN });
const run = await client.actor('ener90/walmart-products-reviews').call({"itemIds":["5113175776"],"maxReviewsPerProduct":50});
const { items } = await client.dataset(run.defaultDatasetId).listItems();
```

**Python**
```python
from apify_client import ApifyClient
client = ApifyClient("YOUR_APIFY_TOKEN")
run = client.actor("ener90/walmart-products-reviews").call(run_input={"itemIds":["5113175776"],"maxReviewsPerProduct":50})
items = client.dataset(run["defaultDatasetId"]).list_items().items
```

- **Google Sheets:** add the *Google Sheets* integration to a saved Task, or use `=IMPORTDATA("https://api.apify.com/v2/datasets/<DATASET_ID>/items?format=csv&clean=1")`.
- **n8n / Make / Zapier:** use the official Apify node or app: *Run Actor* (`ener90/walmart-products-reviews`) → *Get dataset items*.
- **Webhooks:** on a Task, add an integration *Run succeeded* → your URL (gets `defaultDatasetId`).
- **AI agents (MCP):** `https://mcp.apify.com?actors=ener90/walmart-products-reviews` works in Claude, ChatGPT, Cursor or any MCP client.
- **Free plan:** works on Apify's free tier; usage is billed per result (see Pricing). Start with small limits to try it out.

## 📝 Changelog
- 0.1 (2026-10-20): first public release. Reviews + product price, availability, rating breakdown and Walmart AI summary.

Issues or ideas? Open an issue in the **Issues** tab and we usually reply within 24 h.
