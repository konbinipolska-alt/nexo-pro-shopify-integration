# Architektura integracji NEXO Pro ↔ Shopify

## Przepływ: Shopify → NEXO Pro
1. Shopify wysyła webhook `orders/paid`
2. Middleware weryfikuje HMAC i dodaje job do kolejki Redis
3. orderWorker pobiera zamówienie z Shopify API
4. orderMapper transformuje dane
5. Dokument sprzedaży zostaje utworzony w NEXO Pro

## Przepływ: NEXO Pro → Shopify (stany magazynowe)
1. Cykliczny job trafia do kolejki `inventory`
2. inventoryWorker pobiera stany z NEXO Pro
3. Aktualizuje `inventory_levels` w Shopify dla każdego SKU

## Idempotency
JobId = `order-${shopifyOrderId}` — duplikat webhooka nie spowoduje podwójnego importu.

## Rate limiting
Klient Shopify automatycznie obsługuje HTTP 429 (czeka Retry-After sekund).
