# Suvai – React Native prototype

A single-file React Native app (`App.js`) that shows how Suvai works. It uses only React Native core components, local sample data, and a small rule set standing in for the AI service. Nothing is saved between runs and there is no backend.

## Fastest way to see it (no install)

1. Open https://snack.expo.dev in your browser.
2. Delete everything in the `App.js` shown there and paste in the contents of this `App.js`.
3. Use the **Web** preview on the right, or choose **My Device** and scan the QR code with the Expo Go app on your Android phone.

## Run it on your computer

Requires Node.js 20 or later.

```
npm install
npm run web      # opens the app in your browser
npm start        # then scan the QR code with Expo Go on your phone
npm run build    # static web export into dist/
```

## Deployment

Vercel builds the web version with `npx expo export -p web` and serves `dist/` (see `vercel.json`).

## Things to try

1. **Home** answers five questions: what am I cooking today, what do I have, what is expiring, what can I cook now, and what do I need to buy.
2. **Recipes**: search by name, ingredient or cuisine; filter by favourites, collections, cuisine and cooking time. Open a recipe to favourite it (heart), give it a thumbs up or down, add notes, and put it in a collection. **+ Import** has samples for a website, Instagram, TikTok, a photo, and a link that cannot be read.
3. **Pantry**: fresh / frozen / dry cards, running low, frequently bought, and tap any item to set quantity, unit and expiry.
4. **Assistant**: a chat. Tap the suggested questions or type your own, e.g. "I don't have coconut milk. What can I substitute?"
5. **Plan**: switch between **This week** and **Next week**; add saved recipes to breakfast, lunch and dinner; thumbs up or down each meal; reuse a previous menu. **Shopping list** consolidates the week, scales to household size, leaves out what the pantry covers, and groups by supermarket section. Tick items and add them to the pantry.
6. **Home → My Kitchen → Household**: set the number of adults and children and each adult's daily macro goals. Then open any recipe to see **Nutrition per serving** and **Plates for my household** (the shared dish plus add-ons per adult).
7. **Home → My Kitchen**: switch on an allergy (e.g. shellfish) and see recipes and substitutes change.

## What is simulated

- The assistant, substitutions and recommendations use built-in rules, not an AI model. It understands the kinds of question listed above, not free conversation.
- Nutrition figures are estimates from a small built-in table of typical food values, and the add-on suggestions are simple rules.
- Import returns canned results; no page, video or photo is actually read.
- Nothing is saved between runs. Not included: sign-in, sync, notifications, timers.
