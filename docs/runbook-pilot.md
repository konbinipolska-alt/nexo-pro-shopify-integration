# Runbook pilota

## 1. Przed uruchomieniem

1. Zweryfikuj, że istnieje plik `.env` i wszystkie wymagane wartości są ustawione.
2. Upewnij się, że Redis jest dostępny pod `REDIS_URL`.
3. Upewnij się, że endpoint webhooka jest publicznie dostępny po HTTPS.

## 2. Start usługi

```bash
npm install
npm run dev
```

W produkcji:

```bash
npm ci
npm start
```

## 3. Kontrola działania

1. Healthcheck:

```bash
curl -s http://localhost:3000/health
```

2. Oczekiwany wynik: `{"status":"ok"}`.
3. Po otrzymaniu webhooka sprawdź logi:
   - `Received orders/paid webhook`
   - `Processing order import`
   - `Order imported to NEXO`
4. Po synchronizacji stanów sprawdź log:
   - `Inventory sync complete`

## 4. Sygnały alarmowe

- Częste `Webhook signature mismatch` -> błąd sekretu webhooka.
- Powtarzające się błędy workerów -> problem API Shopify/NEXO lub mapowania.
- Brak logów `Inventory sync complete` -> problem z queue/schedulerem.

## 5. Rollback

1. Zidentyfikuj ostatni stabilny commit na `main`.
2. Wykonaj deploy poprzedniego stabilnego obrazu/wydania.
3. Zweryfikuj:
   - healthcheck
   - import pojedynczego webhooka testowego
   - pojedynczy cykl synchronizacji stocku
4. Dopiero po walidacji ponów wdrożenie nowszej wersji.

## 6. Eskalacja

- Problemy z autoryzacją Shopify: sprawdź `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_SHOP_DOMAIN`.
- Problemy z API NEXO: sprawdź `NEXO_API_URL`, `NEXO_API_TOKEN`.
- Problemy kolejki: sprawdź dostępność Redis oraz opóźnienia sieciowe.
