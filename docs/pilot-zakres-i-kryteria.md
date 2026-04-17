# Zakres pilota i kryteria odbioru

## Cel pilota

Uruchomić stabilną integrację NEXO Pro <-> Shopify dla jednego sklepu produkcyjnego,
obejmując import zamówień i synchronizację stanów magazynowych.

## Zakres pilota (zamrożony)

1. Webhook Shopify `orders/paid` przyjmowany i walidowany po HMAC.
2. Webhook trafia do kolejki i jest przetwarzany asynchronicznie.
3. Zamówienie jest mapowane do formatu NEXO i wysyłane do API NEXO.
4. Duplikat webhooka nie powoduje duplikatu dokumentu sprzedaży.
5. Synchronizacja stanów NEXO -> Shopify działa cyklicznie.
6. Logi umożliwiają analizę błędów i przebiegu procesów.

## Poza zakresem pilota

1. Obsługa wielu sklepów w jednym uruchomieniu.
2. Zaawansowane scenariusze fulfillment poza podstawową synchronizacją.
3. Rozbudowane dashboardy analityczne.

## Definition of Done (pilot)

1. `npm test` przechodzi bez błędów.
2. `npm run lint` przechodzi bez błędów.
3. Healthcheck odpowiada poprawnie.
4. Błędny webhook jest odrzucany kodem 401.
5. Błędny payload webhooka jest odrzucany kodem 400.
6. Sync stanów aktualizuje tylko SKU obecne w Shopify.
7. Dokumentacja uruchomienia i rollbacku jest aktualna.

## Go / No-Go checklist

- Go: wszystkie punkty Definition of Done są spełnione.
- Go: środowisko pilota ma kompletne i zweryfikowane zmienne `.env`.
- No-Go: brak połączenia z Redis lub API NEXO.
- No-Go: błędy mapowania danych powodujące utratę integralności dokumentów.
