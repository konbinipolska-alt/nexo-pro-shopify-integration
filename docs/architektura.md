# Architektura integracji NEXO Pro ↔ Shopify

## Przepływ: Shopify → NEXO Pro
1. Shopify wysyła webhook `orders/paid`
2. Middleware weryfikuje HMAC i dodaje job do kolejki Redis
3. orderWorker uruchamia `processOrderImport`
4. Serwis pobiera zamówienie z Shopify API i mapuje przez `orderMapper`
5. Dokument sprzedaży zostaje utworzony w NEXO Pro

## Przepływ: NEXO Pro → Shopify (stany magazynowe)
1. Cykliczny job trafia do kolejki `inventory`
2. inventoryWorker uruchamia `syncInventory`
3. Serwis buduje mapę SKU Shopify i pobiera stany z NEXO Pro
4. Aktualizuje `inventory_levels` w Shopify dla SKU istniejących w Shopify
5. Limit aktualizacji per run jest kontrolowany przez `INVENTORY_MAX_UPDATES_PER_RUN`

## Idempotency
JobId = `order-${shopifyOrderId}` — duplikat webhooka nie spowoduje podwójnego importu.

## Rate limiting
Klient Shopify automatycznie obsługuje HTTP 429 (czeka Retry-After sekund).

## Operacyjność
Szczegółowa procedura uruchomienia i rollbacku znajduje się w `docs/runbook-pilot.md`.
