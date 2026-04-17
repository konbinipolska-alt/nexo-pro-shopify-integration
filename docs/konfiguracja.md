# Konfiguracja

## Shopify Custom App
1. Shopify Admin → Settings → Apps → Develop apps → Create an app
2. Uprawnienia: read/write orders, products, inventory, fulfillments
3. Zainstaluj app i skopiuj Access Token
4. Dodaj webhook: `orders/paid` → `https://twoja-domena.com/webhooks/orders/paid`

## Zmienne środowiskowe
Skopiuj `.env.example` do `.env` i uzupełnij danymi.
