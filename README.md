# 🧭 Voyager — Planer Podróży PWA

Osobisty planer podróży z interaktywnymi mapami, prognozą pogody, AI i galerią zdjęć.

## ✨ Funkcje

- 📍 Lista miejsc z priorytetami i checkboxami
- 🗺️ Interaktywna mapa Leaflet — szukaj, klikaj, dodawaj
- 🗓️ Harmonogram dnia z godziną i aktywnościami
- 💰 Budżet w 6 kategoriach z wykresami
- 📝 Notatki z uploadem zdjęć z galerii
- 🌤️ 7-dniowa prognoza pogody (Open-Meteo)
- 🤖 Asystent AI (Claude)
- 📱 PWA — offline, instalacja na telefon

## 🚀 Uruchomienie lokalne

```bash
npm install
npm run dev
# → http://localhost:5173
```

## 📦 Deploy na GitHub Pages

### 1. Utwórz repo
Na github.com → New repository → `voyager-travel-planner` (public)

### 2. Wypchnij kod
```bash
git init
git add .
git commit -m "Voyager v1.0"
git branch -M main
git remote add origin https://github.com/TWOJ-USER/voyager-travel-planner.git
git push -u origin main
```

### 3. GitHub Actions — automatyczny deploy
Utwórz plik `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: cp public/sw.js dist/
      - run: cp public/manifest.json dist/
      - run: cp -r public/icons dist/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 4. Włącz Pages
Settings → Pages → Source: **GitHub Actions**

Twoja aplikacja: `https://TWOJ-USER.github.io/voyager-travel-planner/`

## 📱 APK na Android

### PWABuilder (polecane ✅)
1. Wdróż na GitHub Pages (powyżej)
2. Otwórz **https://www.pwabuilder.com/**
3. Wklej URL swojej aplikacji
4. Kliknij **Start** → **Package for stores** → **Android**
5. Pobierz APK/AAB
6. Zainstaluj na telefonie lub wyślij do Google Play Console

### Bubblewrap (zaawansowane)
Masz już doświadczenie z Bubblewrap z poprzednich projektów.
Procedura jest taka sama jak przy Twojej aplikacji dart:
1. `bubblewrap init --manifest URL/manifest.json`
2. `bubblewrap build`
3. Podpisz APK kluczem i wrzuć na Google Play

## 🔧 Konfiguracja

### Base URL (ważne!)
W `vite.config.js` zmień base na nazwę repo:
```js
base: '/voyager-travel-planner/'
```

### AI Chat (opcjonalne)
W wersji standalone dodaj klucz API w `src/App.jsx`:
```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": "TWOJ_KLUCZ",
  "anthropic-version": "2023-06-01"
}
```

## 📂 Struktura
```
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/*.png
└── src/
    ├── main.jsx    (entry + localStorage polyfill)
    └── App.jsx     (aplikacja)
```
