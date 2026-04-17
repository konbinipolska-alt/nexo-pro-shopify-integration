# Konfiguracja

## Shopify Custom App
1. Shopify Admin → Settings → Apps → Develop apps → Create an app
2. Uprawnienia: read/write orders, products, inventory, fulfillments
3. Zainstaluj app i skopiuj Access Token
4. Dodaj webhook: `orders/paid` → `https://twoja-domena.com/webhooks/orders/paid`

## Zmienne środowiskowe
Skopiuj `.env.example` do `.env` i uzupełnij danymi.

Wymagane:
- `SHOPIFY_SHOP_DOMAIN`
- `SHOPIFY_ACCESS_TOKEN`
- `SHOPIFY_WEBHOOK_SECRET`
- `NEXO_API_URL`
- `NEXO_API_TOKEN`
- `REDIS_URL`

Opcjonalne (z bezpiecznymi domyślnymi wartościami):
- `PORT` (domyślnie `3000`)
- `INVENTORY_SYNC_EVERY_MS` (domyślnie `300000`)
- `INVENTORY_MAX_UPDATES_PER_RUN` (domyślnie `500`)
- `INVENTORY_PRODUCT_PAGE_SIZE` (domyślnie `250`)
