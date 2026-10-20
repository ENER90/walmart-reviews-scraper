# Walmart Products & Reviews Scraper

**Pricing:** US$0.0015 per result row (review or product) = US$1.50 per 1,000. No start fee. / **Precio:** US$0,0015 por fila (reseña o producto) = US$1,50 por 1.000, sin cargo de inicio.

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
