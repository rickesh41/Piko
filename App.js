// Suvai – interactive React Native prototype (v3)
// Runs with only React Native core components (no extra packages).
// Data is local sample data. The "AI" is a small rule set standing in for the
// real backend AI service, so you can see how the flows behave.

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';

// ---------- Brand ----------
const C = {
  green: '#183B32',
  cream: '#F4EEDF',
  terracotta: '#D58B57',
  sage: '#E6EBDD',
  white: '#FFFFFF',
  ink: '#1F2A26',
  muted: '#6B756F',
  line: '#DDD6C4',
  red: '#A8442F',
};
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
const TOP_PAD = Platform.select({ android: StatusBar.currentHeight || 24, ios: 50, default: 0 });

// ---------- Canonical ingredients (storage, supermarket section, allergens, search words) ----------
const AISLES = ['Fruit & vegetables', 'Meat & seafood', 'Dairy & eggs', 'Rice & dry goods', 'Sauces & condiments', 'Frozen'];
const ING = {
  chicken: { name: 'Chicken thigh', loc: 'Fridge', aisle: 'Meat & seafood', allergens: [], kw: ['chicken'] },
  prawns: { name: 'Prawns', loc: 'Freezer', aisle: 'Meat & seafood', allergens: ['shellfish'], kw: ['prawn', 'shrimp'] },
  salmon: { name: 'Salmon fillet', loc: 'Fridge', aisle: 'Meat & seafood', allergens: ['fish'], kw: ['salmon'] },
  tofu: { name: 'Firm tofu (tau kwa)', loc: 'Fridge', aisle: 'Dairy & eggs', allergens: ['soy'], kw: ['tofu', 'tau kwa'] },
  egg: { name: 'Eggs', loc: 'Fridge', aisle: 'Dairy & eggs', allergens: ['egg'], kw: ['egg'] },
  milk: { name: 'Fresh milk', loc: 'Fridge', aisle: 'Dairy & eggs', allergens: ['dairy'], kw: ['milk'] },
  yogurt: { name: 'Plain yogurt', loc: 'Fridge', aisle: 'Dairy & eggs', allergens: ['dairy'], kw: ['yogurt', 'yoghurt'] },
  butter: { name: 'Butter', loc: 'Fridge', aisle: 'Dairy & eggs', allergens: ['dairy'], kw: ['butter'] },
  spinach: { name: 'Spinach', loc: 'Fridge', aisle: 'Fruit & vegetables', allergens: [], kw: ['spinach'] },
  kangkong: { name: 'Kangkong (water spinach)', loc: 'Fridge', aisle: 'Fruit & vegetables', allergens: [], kw: ['kangkong', 'water spinach'] },
  tomato: { name: 'Tomatoes', loc: 'Fridge', aisle: 'Fruit & vegetables', allergens: [], kw: ['tomato'] },
  spring_onion: { name: 'Spring onion', loc: 'Fridge', aisle: 'Fruit & vegetables', allergens: [], kw: ['spring onion', 'scallion'] },
  chilli: { name: 'Red chilli', loc: 'Fridge', aisle: 'Fruit & vegetables', allergens: [], kw: ['chilli', 'chili'] },
  pandan: { name: 'Pandan leaves', loc: 'Fridge', aisle: 'Fruit & vegetables', allergens: [], kw: ['pandan'] },
  potatoes: { name: 'Potatoes', loc: 'Dry', aisle: 'Fruit & vegetables', allergens: [], kw: ['potato'] },
  sweet_potato: { name: 'Sweet potato', loc: 'Dry', aisle: 'Fruit & vegetables', allergens: [], kw: ['sweet potato'] },
  onion: { name: 'Onion', loc: 'Dry', aisle: 'Fruit & vegetables', allergens: [], kw: ['onion'] },
  garlic: { name: 'Garlic', loc: 'Dry', aisle: 'Fruit & vegetables', allergens: [], kw: ['garlic'] },
  rice: { name: 'Jasmine rice', loc: 'Dry', aisle: 'Rice & dry goods', allergens: [], kw: ['rice'] },
  sago: { name: 'Sago pearls', loc: 'Dry', aisle: 'Rice & dry goods', allergens: [], kw: ['sago'] },
  sugar: { name: 'Sugar', loc: 'Dry', aisle: 'Rice & dry goods', allergens: [], kw: ['sugar'] },
  gula_melaka: { name: 'Gula melaka', loc: 'Dry', aisle: 'Rice & dry goods', allergens: [], kw: ['gula melaka', 'palm sugar'] },
  oil: { name: 'Cooking oil', loc: 'Dry', aisle: 'Sauces & condiments', allergens: [], kw: ['cooking oil'] },
  soy_sauce: { name: 'Light soy sauce', loc: 'Dry', aisle: 'Sauces & condiments', allergens: ['soy', 'wheat'], kw: ['soy sauce'] },
  fish_sauce: { name: 'Fish sauce', loc: 'Dry', aisle: 'Sauces & condiments', allergens: ['fish'], kw: ['fish sauce'] },
  miso: { name: 'Miso paste', loc: 'Fridge', aisle: 'Sauces & condiments', allergens: ['soy'], kw: ['miso'] },
  belacan: { name: 'Belacan (shrimp paste)', loc: 'Dry', aisle: 'Sauces & condiments', allergens: ['shellfish'], kw: ['belacan', 'shrimp paste'] },
  sambal: { name: 'Sambal (often contains belacan)', loc: 'Fridge', aisle: 'Sauces & condiments', allergens: ['shellfish'], kw: ['sambal'] },
  curry_paste: { name: 'Curry paste', loc: 'Dry', aisle: 'Sauces & condiments', allergens: [], kw: ['curry paste'] },
  coconut_milk: { name: 'Coconut milk', loc: 'Dry', aisle: 'Sauces & condiments', allergens: [], kw: ['coconut milk', 'santan'] },
  evaporated_milk: { name: 'Evaporated milk', loc: 'Dry', aisle: 'Sauces & condiments', allergens: ['dairy'], kw: ['evaporated milk'] },
  peas: { name: 'Frozen peas', loc: 'Freezer', aisle: 'Frozen', allergens: [], kw: ['peas'] },
};

const ALLERGY_OPTIONS = ['shellfish', 'fish', 'egg', 'dairy', 'soy', 'wheat'];
const FREQUENT = ['egg', 'milk', 'rice', 'onion', 'garlic', 'chicken', 'tomato'];

// ---------- Sample recipes ----------
// verdict: 'like' | 'dislike' | null   (set with the thumbs buttons)
const START_RECIPES = [
  {
    id: 'r1', meals: ['Lunch', 'Dinner'], title: 'Chicken & Potato Curry', cuisine: 'Singaporean', time: 45, servings: 4,
    type: 'savoury', emoji: '🍛', color: '#D58B57', verdict: 'like', favourite: true, collections: ['Weeknight dinners'], notes: '',
    source: { platform: 'Website', creator: 'Sample Kitchen Blog', url: 'https://example.com/chicken-curry' },
    ingredients: [
      { id: 'chicken', qty: 500, unit: 'g' }, { id: 'potatoes', qty: 300, unit: 'g' },
      { id: 'coconut_milk', qty: 200, unit: 'ml' }, { id: 'curry_paste', qty: 3, unit: 'tbsp' },
      { id: 'onion', qty: 1, unit: '' }, { id: 'garlic', qty: 3, unit: 'cloves' },
      { id: 'oil', qty: 2, unit: 'tbsp' },
    ],
    steps: [
      'Slice the onion and garlic. Cut the potatoes into chunks.',
      'Heat the oil and fry the onion, garlic and curry paste until fragrant.',
      'Add the chicken and stir until coated and lightly browned.',
      'Add the potatoes and enough water to just cover. Simmer for 20 minutes.',
      'Stir in the coconut milk and simmer gently for 5 more minutes. Season and serve with rice.',
    ],
  },
  {
    id: 'r2', meals: ['Lunch', 'Dinner'], title: 'Sambal Kangkong', cuisine: 'Malay', time: 15, servings: 2,
    type: 'savoury', emoji: '🥬', color: '#7A9B76', verdict: null, favourite: false, collections: [], notes: '',
    source: { platform: 'Instagram', creator: '@sample.homecook', url: 'https://instagram.com/reel/sample' },
    ingredients: [
      { id: 'kangkong', qty: 300, unit: 'g' }, { id: 'garlic', qty: 4, unit: 'cloves' },
      { id: 'belacan', qty: 1, unit: 'tsp' }, { id: 'chilli', qty: 2, unit: '' },
      { id: 'oil', qty: 1, unit: 'tbsp' },
    ],
    steps: [
      'Wash the kangkong and cut into finger lengths. Keep stems and leaves apart.',
      'Pound the garlic, chilli and belacan into a rough paste.',
      'Fry the paste in hot oil until fragrant.',
      'Add the stems, stir for a minute, then add the leaves and toss until just wilted.',
    ],
  },
  {
    id: 'r3', meals: ['Lunch', 'Dinner'], title: 'Prawn Fried Rice', cuisine: 'Chinese', time: 20, servings: 2,
    type: 'savoury', emoji: '🍤', color: '#C9A66B', verdict: 'like', favourite: false, collections: ['Weeknight dinners'], notes: 'Kids prefer it without spring onion.',
    source: null,
    ingredients: [
      { id: 'rice', qty: 2, unit: 'cups cooked' }, { id: 'prawns', qty: 200, unit: 'g' },
      { id: 'egg', qty: 2, unit: '' }, { id: 'garlic', qty: 2, unit: 'cloves' },
      { id: 'soy_sauce', qty: 1, unit: 'tbsp' }, { id: 'spring_onion', qty: 2, unit: 'stalks' },
      { id: 'oil', qty: 2, unit: 'tbsp' },
    ],
    steps: [
      'Heat the oil and fry the garlic until golden.',
      'Add the prawns and cook until just pink. Push to the side.',
      'Scramble the eggs in the same pan, then add the rice and break up any clumps.',
      'Season with soy sauce, toss in the spring onion and serve.',
    ],
  },
  {
    id: 'r4', meals: ['Breakfast', 'Lunch'], title: 'Spinach & Potato Frittata', cuisine: 'Western', time: 30, servings: 3,
    type: 'savoury', emoji: '🍳', color: '#B7B47A', verdict: null, favourite: false, collections: [], notes: '',
    source: { platform: 'YouTube', creator: 'Sample Cooking Channel', url: 'https://youtube.com/watch?v=sample' },
    ingredients: [
      { id: 'egg', qty: 4, unit: '' }, { id: 'spinach', qty: 100, unit: 'g' },
      { id: 'potatoes', qty: 200, unit: 'g' }, { id: 'onion', qty: 1, unit: '' },
      { id: 'milk', qty: 50, unit: 'ml' }, { id: 'oil', qty: 1, unit: 'tbsp' },
    ],
    steps: [
      'Slice the potatoes thinly and fry with the onion until soft.',
      'Add the spinach and stir until wilted.',
      'Beat the eggs with the milk, pour over and cook on low heat for 8 minutes.',
      'Finish under a grill or flip to set the top. Rest for 2 minutes before slicing.',
    ],
  },
  {
    id: 'r5', meals: ['Breakfast', 'Lunch', 'Dinner'], title: 'Tomato Egg Stir-fry', cuisine: 'Chinese', time: 10, servings: 2,
    type: 'savoury', emoji: '🍅', color: '#C96A4A', verdict: 'dislike', favourite: false, collections: [], notes: '',
    source: null,
    ingredients: [
      { id: 'tomato', qty: 3, unit: '' }, { id: 'egg', qty: 3, unit: '' },
      { id: 'spring_onion', qty: 1, unit: 'stalks' }, { id: 'sugar', qty: 1, unit: 'tsp' },
      { id: 'oil', qty: 1, unit: 'tbsp' },
    ],
    steps: [
      'Cut the tomatoes into wedges and beat the eggs.',
      'Scramble the eggs softly in hot oil and set aside.',
      'Fry the tomatoes with the sugar until saucy, return the eggs and toss. Top with spring onion.',
    ],
  },
  {
    id: 'r6', meals: [], title: 'Sago Gula Melaka', cuisine: 'Malay', time: 25, servings: 4,
    type: 'dessert', emoji: '🥥', color: '#8C6B4F', verdict: null, favourite: true, collections: ['Desserts'], notes: '',
    source: { platform: 'TikTok', creator: '@sample.desserts', url: 'https://tiktok.com/@sample/video/1' },
    ingredients: [
      { id: 'sago', qty: 100, unit: 'g' }, { id: 'coconut_milk', qty: 200, unit: 'ml' },
      { id: 'gula_melaka', qty: 60, unit: 'g' }, { id: 'pandan', qty: 2, unit: 'leaves' },
    ],
    steps: [
      'Boil the sago until translucent, rinse under cold water and chill in small bowls.',
      'Melt the gula melaka with a splash of water and the pandan into a syrup.',
      'Warm the coconut milk with a pinch of salt. Do not boil.',
      'Unmould the sago and pour over the coconut milk and syrup.',
    ],
  },
];

// level: 'have' | 'low' | 'out'.  days = days until expiry (null = not tracked). qty/unit optional.
const START_PANTRY = {
  chicken: { level: 'have', loc: 'Fridge', days: 2, qty: 600, unit: 'g' },
  spinach: { level: 'have', loc: 'Fridge', days: 1, qty: 150, unit: 'g' },
  egg: { level: 'have', loc: 'Fridge', days: 9, qty: 8, unit: '' },
  milk: { level: 'low', loc: 'Fridge', days: 3, qty: 100, unit: 'ml' },
  yogurt: { level: 'have', loc: 'Fridge', days: 6, qty: null, unit: '' },
  tomato: { level: 'have', loc: 'Fridge', days: 4, qty: 4, unit: '' },
  peas: { level: 'have', loc: 'Freezer', days: null, qty: 500, unit: 'g' },
  potatoes: { level: 'have', loc: 'Dry', days: null, qty: 1000, unit: 'g' },
  onion: { level: 'low', loc: 'Dry', days: null, qty: 1, unit: '' },
  garlic: { level: 'have', loc: 'Dry', days: null, qty: null, unit: '' },
  rice: { level: 'have', loc: 'Dry', days: null, qty: null, unit: '' },
  oil: { level: 'have', loc: 'Dry', days: null, qty: null, unit: '' },
  sugar: { level: 'have', loc: 'Dry', days: null, qty: null, unit: '' },
  soy_sauce: { level: 'have', loc: 'Dry', days: null, qty: null, unit: '' },
  fish_sauce: { level: 'have', loc: 'Dry', days: null, qty: null, unit: '' },
  curry_paste: { level: 'have', loc: 'Dry', days: null, qty: null, unit: '' },
  evaporated_milk: { level: 'have', loc: 'Dry', days: null, qty: null, unit: '' },
  sago: { level: 'have', loc: 'Dry', days: null, qty: 250, unit: 'g' },
  gula_melaka: { level: 'have', loc: 'Dry', days: null, qty: 200, unit: 'g' },
};

// ---------- Substitution rules (stand-in for the AI substitution engine) ----------
const SUBS = {
  coconut_milk: [
    { with: 'evaporated_milk', rating: 'good', qty: 'Same amount',
      note: 'Similar fat and body, so the sauce stays rich. You lose the coconut flavour. Add it at the end and keep it below a boil.',
      dessert: { rating: 'possible', note: 'Gives the creaminess, but coconut is the main flavour of this dessert, so it will taste noticeably different.' } },
    { with: 'yogurt', rating: 'possible', qty: 'Three-quarters of the amount, plus a splash of water',
      note: 'Adds creaminess but also tang, and it can split. Stir it in off the heat.',
      dessert: { rating: 'not', note: 'The tang clashes with a sweet coconut dessert and it will not pour as a sauce.' } },
    { with: 'milk', rating: 'possible', qty: 'Same amount',
      note: 'Much thinner and lower in fat. Simmer a little longer to reduce; the result is lighter.',
      dessert: { rating: 'not', note: 'Too thin and too mild to stand in for coconut milk here.' } },
  ],
  prawns: [
    { with: 'chicken', rating: 'good', qty: 'Same weight, cut small',
      note: 'Changes the flavour but the dish works. Chicken needs longer: cook it through (6 to 8 minutes) before the next step.' },
    { with: 'tofu', rating: 'possible', qty: 'Same weight, cubed',
      note: 'Milder and softer. Pan-fry the cubes first so they hold together.' },
  ],
  chicken: [
    { with: 'tofu', rating: 'possible', qty: 'Same weight, cubed',
      note: 'Soaks up the sauce well but adds no meaty flavour. Add it in the last 10 minutes so it does not break up.' },
    { with: 'prawns', rating: 'good', qty: 'Same weight',
      note: 'Works well, but prawns cook in minutes. Add them at the very end.' },
  ],
  belacan: [
    { with: 'fish_sauce', rating: 'possible', qty: '2 tsp for each tsp of belacan',
      note: 'Gives the salty, savoury depth but not the roasted funk. Add it with the vegetables, not at the paste stage.' },
    { with: 'miso', rating: 'possible', qty: 'Same amount',
      note: 'Savoury and fermented, but sweeter and with no seafood note.' },
  ],
  kangkong: [
    { with: 'spinach', rating: 'good', qty: 'Same weight',
      note: 'No crunchy hollow stems, and it wilts faster. Add it right at the end and toss for under a minute.' },
  ],
  spinach: [
    { with: 'kangkong', rating: 'good', qty: 'Same weight',
      note: 'Stems stay crunchier. Chop them small and cook them a minute before the leaves.' },
  ],
  potatoes: [
    { with: 'sweet_potato', rating: 'good', qty: 'Same weight',
      note: 'Sweeter and softer. Cut slightly larger and check a few minutes early.' },
  ],
  milk: [
    { with: 'evaporated_milk', rating: 'good', qty: 'Half the amount, topped up with water', note: 'Close match once diluted.' },
    { with: 'yogurt', rating: 'possible', qty: 'Same amount, thinned with water', note: 'Adds a slight tang.' },
  ],
  spring_onion: [
    { with: 'onion', rating: 'possible', qty: 'A quarter of a small onion, finely sliced',
      note: 'Sharper and without the fresh green colour. Cook it briefly instead of adding it raw.' },
  ],
  gula_melaka: [
    { with: 'sugar', rating: 'possible', qty: 'Same weight',
      note: 'Sweetens, but you lose the smoky caramel flavour that defines the dish. Cook the sugar to a light caramel first to get closer.' },
  ],
  // egg, rice, sago: no entry on purpose. Not every ingredient has a substitute.
};

// "Make it healthier" tips keyed by ingredient (stand-in for the AI adaptation engine)
const HEALTH = {
  coconut_milk: 'Use half the coconut milk and make up the rest with stock or evaporated milk.',
  oil: 'Halve the oil and use a non-stick pan.',
  chicken: 'Use skinless chicken and trim any visible fat.',
  rice: 'Swap half the rice for brown rice, or bulk it out with extra vegetables.',
  gula_melaka: 'Cut the gula melaka by a third; the pandan carries much of the flavour.',
  sugar: 'Leave the sugar out, or halve it.',
  potatoes: 'Keep the potato skins on for more fibre.',
  butter: 'Halve the butter and finish with a squeeze of lime.',
  belacan: 'Belacan is salty: taste before adding any other seasoning.',
  soy_sauce: 'Use reduced-salt soy sauce, or a little less.',
};

// ---------- Nutrition (approximate values per 100 g; stand-in for a licensed nutrition database) ----------
// [kcal, protein g, carbs g, fat g, grams per piece (for ingredients counted in pieces)]
const NUTR = {
  chicken: [121, 19.7, 0, 4.1], prawns: [85, 20, 0, 0.5], salmon: [208, 20, 0, 13], tofu: [144, 15, 3, 9],
  egg: [143, 12.6, 0.7, 9.5, 50], milk: [62, 3.2, 4.8, 3.3], yogurt: [61, 3.5, 4.7, 3.3], butter: [717, 0.9, 0.1, 81],
  spinach: [23, 2.9, 3.6, 0.4], kangkong: [19, 2.6, 3.1, 0.2], tomato: [18, 0.9, 3.9, 0.2, 120],
  spring_onion: [32, 1.8, 7.3, 0.2], chilli: [40, 1.9, 8.8, 0.4, 15], pandan: [0, 0, 0, 0],
  potatoes: [77, 2, 17, 0.1], sweet_potato: [86, 1.6, 20, 0.1], onion: [40, 1.1, 9.3, 0.1, 110], garlic: [149, 6.4, 33, 0.5],
  rice: [130, 2.7, 28, 0.3], sago: [350, 0.2, 86, 0.2], sugar: [387, 0, 100, 0], gula_melaka: [380, 0, 95, 0],
  oil: [884, 0, 0, 100], soy_sauce: [53, 8, 5, 0.6], fish_sauce: [35, 5, 3.6, 0], miso: [199, 12, 26, 6],
  belacan: [150, 25, 5, 3], sambal: [100, 2, 12, 5], curry_paste: [150, 3, 12, 10], coconut_milk: [197, 2, 2.8, 21],
  evaporated_milk: [134, 6.8, 10, 7.6], peas: [77, 5, 14, 0.4],
};
const UNIT_G = { g: 1, ml: 1, tbsp: 15, tsp: 5, cloves: 4, 'cups cooked': 160, stalks: 15, leaves: 2, fillets: 150 };

function lineGrams(l) {
  if (l.qty === null || l.qty === undefined) return null;
  if (l.unit === '') { const n = NUTR[l.id]; return n && n[4] ? l.qty * n[4] : null; }
  return UNIT_G[l.unit] ? l.qty * UNIT_G[l.unit] : null;
}

// Estimated nutrition for one serving of a recipe.
function nutrition(recipe) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  let skipped = 0;
  recipe.ingredients.forEach((l) => {
    const n = NUTR[l.id];
    const g = lineGrams(l);
    if (!n || g === null) { skipped += 1; return; }
    t.kcal += (n[0] * g) / 100; t.p += (n[1] * g) / 100; t.c += (n[2] * g) / 100; t.f += (n[3] * g) / 100;
  });
  const sv = recipe.servings || 1;
  return { kcal: t.kcal / sv, p: t.p / sv, c: t.c / sv, f: t.f / sv, skipped };
}

const householdSize = (profile) => profile.adults.length + profile.kids;
const GOALS = ['Maintain', 'Lose fat', 'Build muscle', 'Custom'];
const MAIN_PROTEINS = ['chicken', 'prawns', 'salmon', 'tofu'];
const HALF_CUPS = { 1: '½ cup', 2: '1 cup', 3: '1½ cups', 4: '2 cups' };

// Shared base + add-ons: everyone eats one serving of the recipe; each adult gets
// add-ons that move the plate toward a third of their daily macro goal.
function buildPlates(recipe, profile) {
  const base = nutrition(recipe);
  const main = MAIN_PROTEINS.filter((id) => recipe.ingredients.some((l) => l.id === id))[0];
  const starchy = recipe.ingredients.some((l) => l.id === 'rice' || l.id === 'potatoes');
  return profile.adults.map((a) => {
    const target = { p: a.p / 3, c: a.c / 3, f: a.f / 3 };
    const plate = { kcal: base.kcal, p: base.p, c: base.c, f: base.f };
    const adds = [];
    const add = (label, n) => { adds.push(label); plate.kcal += n[0]; plate.p += n[1]; plate.c += n[2]; plate.f += n[3]; };
    if (recipe.type === 'dessert') return { adult: a, target, plate, adds, dessert: true };
    const pGap = target.p - plate.p;
    if (pGap >= 8) {
      if (main && pGap >= 12) {
        const g = pGap >= 30 ? 150 : 100;
        const n = NUTR[main];
        add('Extra ' + g + ' g ' + ING[main].name.toLowerCase() + ', cooked in the same pan', [n[0] * g / 100, n[1] * g / 100, n[2] * g / 100, n[3] * g / 100]);
      } else if (pGap >= 18) {
        add('100 g grilled chicken on the side', [121, 19.7, 0, 4.1]);
      } else if (profile.allergies.indexOf('egg') === -1) {
        const k = Math.min(2, Math.max(1, Math.round(pGap / 6)));
        add(k + ' boiled egg' + (k > 1 ? 's' : '') + ' on the side', [72 * k, 6.3 * k, 0.4 * k, 4.8 * k]);
      } else if (profile.allergies.indexOf('soy') === -1) {
        add('100 g pan-fried firm tofu on the side', [144, 15, 3, 9]);
      }
    }
    const cGap = target.c - plate.c;
    if (cGap >= 15) {
      if (recipe.cuisine === 'Western') {
        const k = Math.min(4, Math.max(1, Math.round(cGap / 12)));
        add(k + ' slice' + (k > 1 ? 's' : '') + ' wholemeal toast', [70 * k, 3 * k, 12 * k, 1 * k]);
      } else {
        const h = Math.min(4, Math.max(1, Math.round(cGap / 22)));
        add(HALF_CUPS[h] + ' steamed rice', [104 * h, 2.2 * h, 22.4 * h, 0.2 * h]);
      }
    } else if (cGap <= -15 && starchy) {
      adds.push('Go light on the rice or potatoes and fill the plate with extra vegetables');
    }
    return { adult: a, target, plate, adds, dessert: false };
  });
}

// ---------- Meal plan ----------
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];
const slotKey = (day, meal) => day + '-' + meal;
const todayDay = () => DAYS[(new Date().getDay() + 6) % 7];
const START_PLAN = { 'Mon-Dinner': 'r1', 'Tue-Breakfast': 'r5', 'Wed-Dinner': 'r3', 'Fri-Dinner': 'r2', 'Sun-Dinner': 'r4' };
const START_NEXT_PLAN = { 'Mon-Dinner': 'r4', 'Thu-Dinner': 'r1' };
const WEEK_NAMES = ['This week', 'Next week'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Date of a day in this week (week 0) or next week (week 1); weeks start on Monday.
function dayDate(week, dayIndex) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + week * 7 + dayIndex);
  return d.getDate() + ' ' + MONTHS[d.getMonth()];
}
const weekRange = (week) => dayDate(week, 0) + ' – ' + dayDate(week, 6);
const START_MENUS = [{ name: 'Last week', plan: { 'Mon-Dinner': 'r3', 'Wed-Dinner': 'r1', 'Thu-Lunch': 'r4', 'Sat-Dinner': 'r6' } }];

// ---------- Helpers ----------
const nameOf = (line) => (ING[line.id] && ING[line.id].name) || line.name || line.id;
const levelOf = (pantry, id) => (pantry[id] ? pantry[id].level : 'out');
const allergensOf = (id) => (ING[id] ? ING[id].allergens : []);
const hits = (id, allergies) => allergensOf(id).filter((a) => allergies.indexOf(a) !== -1);
const byId = (recipes, id) => recipes.filter((r) => r.id === id)[0];
const verdictText = (v) => (v === 'like' ? '👍 Good' : v === 'dislike' ? '👎 Not great' : '');

const matchPct = (recipe, pantry) =>
  Math.round((recipe.ingredients.filter((l) => levelOf(pantry, l.id) !== 'out').length / recipe.ingredients.length) * 100);

function recipeAllergens(recipe, allergies) {
  const found = [];
  recipe.ingredients.forEach((l) => {
    hits(l.id, allergies).forEach((a) => { if (found.indexOf(a) === -1) found.push(a); });
  });
  return found;
}

function fmtQty(q) {
  if (q === null || q === undefined) return '';
  return String(Math.round(q * 100) / 100);
}

function expiryText(days) {
  if (days === null || days === undefined) return '';
  if (days <= 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return 'Expires in ' + days + ' days';
}

// Recipe finder: ranks SAVED recipes by pantry coverage, expiring items and your thumbs.
// Allergies are a hard filter, applied before ranking.
function rankRecipes(recipes, pantry, allergies) {
  const safe = recipes.filter((r) => recipeAllergens(r, allergies).length === 0);
  const ranked = safe.map((r) => {
    const haveLines = r.ingredients.filter((l) => levelOf(pantry, l.id) !== 'out');
    const missing = r.ingredients.filter((l) => levelOf(pantry, l.id) === 'out');
    const expiring = haveLines.filter((l) => pantry[l.id] && pantry[l.id].days !== null && pantry[l.id].days <= 3);
    const taste = r.verdict === 'like' ? 0.1 : r.verdict === 'dislike' ? -0.5 : 0;
    const score = haveLines.length / r.ingredients.length + expiring.length * 0.05 + taste;
    return { recipe: r, have: haveLines.length, total: r.ingredients.length, missing, expiring, score };
  });
  ranked.sort((a, b) => b.score - a.score);
  return { ranked, hidden: recipes.length - safe.length };
}

function rankedSub(x) {
  return (x.missing.length === 0 ? 'You have everything' : 'Have ' + x.have + ' of ' + x.total + ' · missing ' + x.missing.map(nameOf).join(', ')) +
    (x.expiring.length ? '\nUses soon-to-expire: ' + x.expiring.map(nameOf).join(', ') : '');
}

// Substitution engine: rule lookup, recipe-type override, pantry check, allergen check.
function findSubs(recipe, ingId, pantry, allergies) {
  const rules = SUBS[ingId] || [];
  const order = { good: 0, possible: 1, not: 2 };
  const options = [];
  const blocked = [];
  rules.forEach((rule) => {
    const o = recipe.type === 'dessert' && rule.dessert ? Object.assign({}, rule, rule.dessert) : rule;
    const bad = hits(o.with, allergies);
    if (bad.length > 0) {
      blocked.push({ with: o.with, allergens: bad });
    } else {
      options.push({ with: o.with, rating: o.rating, note: o.note, qty: o.qty, inPantry: levelOf(pantry, o.with) !== 'out' });
    }
  });
  options.sort((a, b) => (order[a.rating] - order[b.rating]) || ((b.inPantry ? 1 : 0) - (a.inPantry ? 1 : 0)));
  return { options, blocked };
}

// Shopping list: consolidates the week's plan, scales to the household, subtracts the pantry.
function buildShopping(plan, recipes, pantry, household) {
  const need = {};
  Object.keys(plan).forEach((k) => {
    const r = byId(recipes, plan[k]);
    if (!r) return;
    const f = household / r.servings;
    r.ingredients.forEach((l) => {
      if (!ING[l.id]) return;
      const key = l.id + '|' + l.unit;
      if (!need[key]) need[key] = { key, id: l.id, unit: l.unit, qty: 0, unknown: false, uses: [] };
      if (l.qty === null || l.qty === undefined) need[key].unknown = true; else need[key].qty += l.qty * f;
      if (need[key].uses.indexOf(r.title) === -1) need[key].uses.push(r.title);
    });
  });
  const items = [];
  let covered = 0;
  Object.keys(need).forEach((key) => {
    const n = need[key];
    const p = pantry[n.id];
    const lv = levelOf(pantry, n.id);
    let buy = null;
    let reason = '';
    if (lv === 'out') { buy = n.qty; reason = 'Not in your pantry'; }
    else if (p.qty !== null && p.qty !== undefined && p.unit === n.unit && !n.unknown) {
      if (n.qty > p.qty) { buy = n.qty - p.qty; reason = 'You have ' + fmtQty(p.qty) + (n.unit ? ' ' + n.unit : '') + ', need ' + (n.unit === '' ? String(Math.ceil(n.qty)) : fmtQty(n.qty)); }
    } else if (lv === 'low') { buy = n.qty; reason = 'Running low at home'; }
    if (buy === null) { covered += 1; return; }
    const amount = n.unknown ? '' : (n.unit === '' ? String(Math.ceil(buy)) : fmtQty(buy) + ' ' + n.unit);
    items.push({ key, id: n.id, name: ING[n.id].name, amount, reason, uses: n.uses, aisle: ING[n.id].aisle, buyQty: buy, unit: n.unit });
  });
  // pantry items running low that the plan does not already cover
  Object.keys(pantry).forEach((id) => {
    if (pantry[id].level === 'low' && !items.some((i) => i.id === id)) {
      items.push({ key: id + '|low', id, name: ING[id].name, amount: '', reason: 'Running low at home', uses: [], aisle: ING[id].aisle, buyQty: null, unit: '' });
    }
  });
  return { items, covered };
}

// ---------- Conversational assistant (rule-based stand-in for the AI Kitchen Agent) ----------
function detectIngredients(text) {
  let t = text.toLowerCase();
  const pairs = [];
  Object.keys(ING).forEach((id) => ING[id].kw.forEach((kw) => pairs.push([id, kw])));
  pairs.sort((a, b) => b[1].length - a[1].length);
  const found = [];
  pairs.forEach((p) => {
    const at = t.indexOf(p[1]);
    if (at !== -1 && !found.some((f) => f.id === p[0])) {
      found.push({ id: p[0], at });
      t = t.replace(p[1], ' '.repeat(p[1].length));
    }
  });
  found.sort((a, b) => a.at - b.at);
  return found.map((f) => f.id);
}

function detectRecipe(text, recipes) {
  const t = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  recipes.forEach((r) => {
    if (t.indexOf(r.title.toLowerCase()) !== -1) { best = r; bestScore = 99; return; }
    const words = r.title.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
    const score = words.filter((w) => t.indexOf(w) !== -1).length;
    if (score > bestScore) { best = r; bestScore = score; }
  });
  return best;
}

const NUM_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, ten: 10 };

function answer(text, recipes, pantry, profile) {
  const t = text.toLowerCase();
  const ings = detectIngredients(text);
  const rec = detectRecipe(text, recipes);
  const has = (words) => words.some((w) => t.indexOf(w) !== -1);
  const askWhich = (prefix, suffix) => ({
    text: 'Which recipe do you mean?',
    chips: recipes.map((r) => prefix + r.title + suffix),
  });

  // 1. Adjust servings
  let n = null;
  const m = t.match(/(\d+)\s*(people|persons|pax|servings|of us)/);
  if (m) n = parseInt(m[1], 10);
  if (n === null && has(['people', 'persons', 'servings', 'adjust'])) {
    Object.keys(NUM_WORDS).forEach((w) => { if (t.indexOf(w + ' ') !== -1 || t.indexOf(w + '?') !== -1) n = NUM_WORDS[w]; });
  }
  if (n) {
    if (!rec) return askWhich('Adjust ', ' for ' + n + ' people');
    const f = n / rec.servings;
    const lines = rec.ingredients.map((l) => '•  ' + (l.qty === null || l.qty === undefined ? 'amount not given' : fmtQty(l.qty * f) + (l.unit ? ' ' + l.unit : '')) + '  ' + nameOf(l));
    return {
      text: rec.title + ' for ' + n + ' (the recipe is written for ' + rec.servings + '):\n\n' + lines.join('\n') +
        '\n\nCooking times stay about the same, but a fuller pan takes longer to come to a simmer.',
      recipes: [{ id: rec.id }],
    };
  }

  // 2. Healthier
  if (has(['health', 'lighter', 'less fat', 'less oil'])) {
    if (!rec) return askWhich('Make ', ' healthier');
    const tips = [];
    rec.ingredients.forEach((l) => { if (HEALTH[l.id]) tips.push('•  ' + HEALTH[l.id]); });
    return {
      text: tips.length
        ? 'To make ' + rec.title + ' lighter:\n\n' + tips.join('\n') + '\n\nIn the full app you could save this as your own version and keep the original.'
        : rec.title + ' is already fairly light. I have no changes to suggest.',
      recipes: [{ id: rec.id }],
    };
  }

  // 3. Substitutions
  if (has(['substitut', 'replace', "don't have", 'dont have', 'do not have', 'out of', 'instead of', 'swap', 'ran out'])) {
    if (ings.length === 0) return { text: 'Which ingredient are you missing? For example: "I don\'t have coconut milk."' };
    let a = ings[0];
    let b = ings.length > 1 ? ings[1] : null;
    if (b && t.indexOf('instead of') !== -1) { const tmp = a; a = b; b = tmp; }
    const safe = recipes.filter((r) => recipeAllergens(r, profile.allergies).length === 0);
    const uses = (r) => r.ingredients.some((l) => l.id === a);
    const recipe = rec && uses(rec) ? rec : safe.filter(uses)[0] || recipes.filter(uses)[0];
    const aName = ING[a].name.toLowerCase();
    if (!recipe) return { text: 'None of your saved recipes use ' + aName + ', so I have no recipe to judge a substitute against. Tell me the dish and I can try.' };
    const res = findSubs(recipe, a, pantry, profile.allergies);
    if (b) {
      const bName = ING[b].name.toLowerCase();
      const blocked = res.blocked.filter((x) => x.with === b)[0] || (hits(b, profile.allergies).length ? { allergens: hits(b, profile.allergies) } : null);
      if (blocked) return { text: 'I would not use ' + bName + ': it contains ' + blocked.allergens.join(', ') + ', which is on your household\'s allergy list.' };
      const opt = res.options.filter((o) => o.with === b)[0];
      if (!opt) return { text: 'I do not have a tested answer for swapping ' + aName + ' with ' + bName + ' in ' + recipe.title + ', so I will not guess. Here is what I can vouch for:', subs: { recipeId: recipe.id, ingId: a } };
      const lead = opt.rating === 'good' ? 'Yes, that works' : opt.rating === 'possible' ? 'You can, with some changes' : 'I would not';
      return { text: lead + ' in ' + recipe.title + '.', subs: { recipeId: recipe.id, ingId: a, only: b } };
    }
    if (res.options.length === 0 && res.blocked.length === 0) {
      return { text: 'There is no good substitute for ' + aName + ' in ' + recipe.title + '. It does a job nothing else in your kitchen can do, so it is better to buy it or cook something else.' };
    }
    return { text: 'For ' + aName + ' in ' + recipe.title + ', here is what would work:', subs: { recipeId: recipe.id, ingId: a } };
  }

  // 4. Leftovers / expiring
  const all = rankRecipes(recipes, pantry, profile.allergies);
  if (has(['leftover', 'expir', 'use up', 'going off'])) {
    const list = all.ranked.filter((x) => x.expiring.length > 0).sort((x, y) => y.expiring.length - x.expiring.length).slice(0, 3);
    if (list.length === 0) return { text: 'Nothing in your pantry is close to expiry, and none of your saved recipes would use it up.' };
    return { text: 'These use up what is expiring soonest in your kitchen:', recipes: list.map((x) => ({ id: x.recipe.id, sub: rankedSub(x) })) };
  }

  // 5. What can I cook
  if (has(['cook', 'make', 'dinner', 'lunch', 'breakfast', 'eat', 'tonight', 'meal', 'idea'])) {
    if (ings.length > 0) {
      const list = all.ranked
        .map((x) => ({ x, used: ings.filter((id) => x.recipe.ingredients.some((l) => l.id === id)) }))
        .filter((y) => y.used.length > 0)
        .sort((p, q) => q.used.length - p.used.length || q.x.score - p.x.score)
        .slice(0, 3);
      const names = ings.map((id) => ING[id].name.toLowerCase()).join(', ');
      if (list.length === 0) return { text: 'None of your saved recipes use ' + names + '. Import one that does and I can help from there.' };
      return {
        text: 'From your saved recipes, with ' + names + ':',
        recipes: list.map((y) => ({ id: y.x.recipe.id, sub: 'Uses ' + y.used.map((id) => ING[id].name.toLowerCase()).join(', ') + ' · ' + rankedSub(y.x) })),
      };
    }
    const top = all.ranked.slice(0, 3);
    return {
      text: 'Based on what is in your kitchen, these are your best options' + (all.hidden ? ' (' + all.hidden + ' hidden for allergies)' : '') + ':',
      recipes: top.map((x) => ({ id: x.recipe.id, sub: rankedSub(x) })),
    };
  }

  return {
    text: 'In this prototype I can help with what to cook, substitutions, using up leftovers, making a recipe healthier, and adjusting servings. Try one of the suggestions below.',
  };
}

const SUGGESTIONS = [
  'What can I cook with chicken, potatoes and spinach?',
  "I don't have coconut milk. What can I substitute?",
  'Can I replace prawns with chicken?',
  'I have leftover vegetables. What should I make?',
  'How can I make this recipe healthier?',
  'Can you adjust this recipe for four people?',
];
const FIRST_MESSAGE = { from: 'ai', text: 'Hi, I am your kitchen assistant. Ask me what to cook, how to swap an ingredient, or how to adapt a recipe. I answer from your own recipes, pantry and allergies.' };

// ---------- Small UI pieces ----------
function Btn({ label, onPress, kind, small }) {
  const dark = kind !== 'ghost' && kind !== 'light';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.btn, small && s.btnSmall, kind === 'ghost' && s.btnGhost, kind === 'light' && s.btnLight, kind === 'accent' && s.btnAccent]}
    >
      <Text style={[s.btnText, small && s.btnTextSmall, !dark && { color: C.green }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && { color: C.white }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function LevelPills({ value, onChange }) {
  const opts = [['have', 'Have'], ['low', 'Low'], ['out', 'Out']];
  return (
    <View style={s.pills}>
      {opts.map((o) => (
        <TouchableOpacity
          key={o[0]}
          onPress={() => onChange(o[0])}
          style={[s.pill, value === o[0] && (o[0] === 'have' ? s.pillHave : o[0] === 'low' ? s.pillLow : s.pillOut)]}
        >
          <Text style={[s.pillText, value === o[0] && { color: C.white }]}>{o[1]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Like / dislike. Tapping the active thumb again clears it.
function Thumbs({ value, onChange, compact }) {
  const set = (v) => onChange(value === v ? null : v);
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => set('like')} style={[s.thumb, value === 'like' && { backgroundColor: C.green }]}>
        <Text style={[s.thumbText, value === 'like' && { color: C.white }]}>👍{compact ? '' : ' Good'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => set('dislike')} style={[s.thumb, value === 'dislike' && { backgroundColor: C.red }]}>
        <Text style={[s.thumbText, value === 'dislike' && { color: C.white }]}>👎{compact ? '' : ' Not great'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Source attribution. Opens the original page when there is a link.
function SourceLink({ source }) {
  if (!source) return <Text style={s.meta}>Source: my own recipe</Text>;
  const label = source.creator + ' on ' + source.platform;
  if (!source.url) return <Text style={s.meta}>Source: {label}</Text>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
      <Text style={s.meta}>Source: </Text>
      <TouchableOpacity href={source.url} accessibilityRole="link" onPress={() => Linking.openURL(source.url)}>
        <Text style={s.sourceLink}>{label} ↗</Text>
      </TouchableOpacity>
    </View>
  );
}

function NutritionSummary({ recipe }) {
  const n = nutrition(recipe);
  const cells = [['Calories', Math.round(n.kcal) + ' kcal'], ['Protein', Math.round(n.p) + ' g'], ['Carbs', Math.round(n.c) + ' g'], ['Fat', Math.round(n.f) + ' g']];
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        {cells.map((c, i) => (
          <View key={c[0]} style={[s.tile, i === 3 && { marginRight: 0 }]}><Text style={s.meta}>{c[0]}</Text><Text style={s.tileVal}>{c[1]}</Text></View>
        ))}
      </View>
      <Text style={s.note}>
        Estimate for one of {recipe.servings} servings, calculated from the ingredients.{n.skipped ? ' ' + n.skipped + ' ingredient' + (n.skipped > 1 ? 's' : '') + ' without a usable amount left out.' : ''} Rice or sides are not included unless listed.
      </Text>
    </View>
  );
}

function HouseholdPlates({ recipe, profile }) {
  const plates = buildPlates(recipe, profile);
  const spicy = recipe.ingredients.some((l) => ['chilli', 'sambal', 'belacan', 'curry_paste'].indexOf(l.id) !== -1);
  const r = (x) => Math.round(x);
  return (
    <View>
      <Text style={s.meta}>Everyone shares the same dish. Add-ons bring each adult's plate closer to a third of their daily goal.</Text>
      {plates.map((pl, i) => (
        <View key={i} style={s.panel}>
          <View style={s.titleRow}>
            <Text style={s.cardTitle}>{pl.adult.name || 'Adult ' + (i + 1)}</Text>
            <View style={[s.badge, { backgroundColor: C.sage, marginBottom: 0 }]}><Text style={[s.badgeText, { color: C.green }]}>{pl.adult.goal}</Text></View>
          </View>
          <Text style={s.body}>•  1 serving of {recipe.title}</Text>
          {pl.adds.map((a) => <Text key={a} style={[s.body, { color: C.green, fontWeight: '600' }]}>+  {a}</Text>)}
          {pl.dessert ? <Text style={s.meta}>Desserts are not adjusted.</Text> : null}
          {!pl.dessert && pl.adds.length === 0 ? <Text style={s.meta}>No add-ons needed for this plate.</Text> : null}
          <View style={s.plateRow}>
            <View style={{ flex: 1 }}><Text style={s.meta}>This plate</Text><Text style={s.plateVal}>{r(pl.plate.kcal)} kcal · {r(pl.plate.p)} g protein · {r(pl.plate.c)} g carbs · {r(pl.plate.f)} g fat</Text></View>
          </View>
          <Text style={s.meta}>Meal goal: {r(pl.target.p)} g protein · {r(pl.target.c)} g carbs · {r(pl.target.f)} g fat</Text>
        </View>
      ))}
      {profile.kids > 0 ? (
        <View style={s.panel}>
          <Text style={s.cardTitle}>{profile.kids} {profile.kids === 1 ? 'child' : 'children'}</Text>
          <Text style={s.body}>•  About half to three-quarters of an adult serving each, by age and appetite</Text>
          {spicy ? <Text style={[s.body, { color: C.green, fontWeight: '600' }]}>+  Take out the kids' portions before the spicy ingredients go in</Text> : null}
          <Text style={s.meta}>No macro targets are set for children.</Text>
        </View>
      ) : null}
    </View>
  );
}

function WeekSwitch({ week, setWeek }) {
  return (
    <View style={s.segment}>
      {WEEK_NAMES.map((w, i) => (
        <TouchableOpacity key={w} style={[s.segBtn, week === i && s.segOn]} onPress={() => setWeek(i)}>
          <Text style={[s.segText, week === i && { color: C.white }]}>{w}</Text>
          <Text style={[s.weekDates, week === i && { color: C.sage }]}>{weekRange(i)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Breakfast / Lunch / Dinner tags
function MealChips({ value, onChange }) {
  return (
    <View style={s.wrap}>
      {MEALS.map((m) => {
        const on = value.indexOf(m) !== -1;
        return <Chip key={m} label={m} active={on} onPress={() => onChange(on ? value.filter((x) => x !== m) : value.concat([m]))} />;
      })}
    </View>
  );
}

function Header({ title, onBack, right }) {
  return (
    <View style={s.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={s.back}><Text style={s.backText}>‹ Back</Text></TouchableOpacity>
      ) : null}
      <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={{ minWidth: 60, alignItems: 'flex-end' }}>{right || null}</View>
    </View>
  );
}

function RecipeCard({ recipe, onPress, sub, match }) {
  const v = verdictText(recipe.verdict);
  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={[s.cardImg, { backgroundColor: recipe.color }]}>
        <Text style={s.cardEmoji}>{recipe.emoji}</Text>
        {match !== undefined ? <View style={s.matchPill}><Text style={s.matchText}>{match}% match</Text></View> : null}
      </View>
      <View style={{ flex: 1, padding: 12 }}>
        <Text style={s.cardTitle}>{recipe.favourite ? '♥ ' : ''}{recipe.title}</Text>
        <Text style={s.meta}>{recipe.cuisine} · {recipe.time} min{v ? ' · ' + v : ''}</Text>
        {sub ? <Text style={[s.meta, { color: C.green, marginTop: 4 }]}>{sub}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

// Large card for the recipe library
function FeatureCard({ recipe, match, onPress }) {
  const v = verdictText(recipe.verdict);
  return (
    <TouchableOpacity style={s.feature} onPress={onPress}>
      <View style={[s.featureImg, { backgroundColor: recipe.color }]}>
        <Text style={{ fontSize: 60 }}>{recipe.emoji}</Text>
        <View style={[s.floatPill, { left: 10 }]}><Text style={s.floatText}>{recipe.favourite ? '♥' : '♡'}{v ? '  ' + v : ''}</Text></View>
        <View style={[s.floatPill, { right: 10, backgroundColor: C.terracotta }]}><Text style={[s.floatText, { color: C.white }]}>{recipe.time} min</Text></View>
      </View>
      <View style={{ padding: 14 }}>
        <Text style={s.cardTitle}>{recipe.title}</Text>
        <Text style={s.meta}>{recipe.cuisine} · {match}% of ingredients at home{recipe.source ? ' · from ' + recipe.source.platform : ''}</Text>
        <Text style={s.meta}>About {Math.round(nutrition(recipe).kcal)} kcal · {Math.round(nutrition(recipe).p)} g protein per serving</Text>
      </View>
    </TouchableOpacity>
  );
}

// Small card used inside assistant replies
function MiniCard({ recipe, sub, onPress }) {
  return (
    <TouchableOpacity style={s.mini} onPress={onPress}>
      <View style={[s.miniImg, { backgroundColor: recipe.color }]}><Text style={{ fontSize: 40 }}>{recipe.emoji}</Text></View>
      <View style={{ padding: 10 }}>
        <Text style={[s.cardTitle, { fontSize: 16 }]} numberOfLines={1}>{recipe.title}</Text>
        <Text style={s.meta}>{recipe.cuisine} · {recipe.time} min</Text>
        {sub ? <Text style={[s.meta, { color: C.green, marginTop: 4 }]}>{sub}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function SubOptions({ recipe, ingId, only, pantry, profile }) {
  const res = findSubs(recipe, ingId, pantry, profile.allergies);
  const options = only ? res.options.filter((o) => o.with === only) : res.options;
  const blocked = only ? [] : res.blocked;
  const badge = {
    good: { text: 'Good substitution', bg: C.green },
    possible: { text: 'Possible, with changes', bg: C.terracotta },
    not: { text: 'Not recommended', bg: C.red },
  };
  return (
    <View>
      {options.map((o) => (
        <View key={o.with} style={s.panel}>
          <View style={[s.badge, { backgroundColor: badge[o.rating].bg }]}><Text style={s.badgeText}>{badge[o.rating].text}</Text></View>
          <Text style={s.cardTitle}>{ING[o.with].name}</Text>
          <Text style={[s.meta, { color: o.inPantry ? C.green : C.muted, marginBottom: 6 }]}>
            {o.inPantry ? '● In your pantry' : '○ Not in your pantry'}
          </Text>
          <Text style={s.body}>{o.note}</Text>
          {o.qty && o.rating !== 'not' ? <Text style={[s.body, { marginTop: 6, fontWeight: '600' }]}>How much: {o.qty}</Text> : null}
        </View>
      ))}
      {blocked.map((b) => (
        <View key={b.with} style={[s.panel, { backgroundColor: '#F3E1DA' }]}>
          <Text style={s.alertText}>
            {ING[b.with].name} was left out because it contains {b.allergens.join(', ')}, which is on your allergy list.
          </Text>
        </View>
      ))}
      <Text style={s.note}>Based on: {recipe.title} ({recipe.type} dish), your pantry and your household's allergies.</Text>
    </View>
  );
}

// ---------- Home ----------
function HomeScreen({ profile, recipes, pantry, plan, go, askAI, setTab, openShopping }) {
  const { ranked } = rankRecipes(recipes, pantry, profile.allergies);
  const ids = Object.keys(pantry);
  const inStock = ids.filter((id) => pantry[id].level !== 'out');
  const low = ids.filter((id) => pantry[id].level === 'low');
  const expiring = inStock.filter((id) => pantry[id].days !== null && pantry[id].days <= 3).sort((a, b) => pantry[a].days - pantry[b].days);
  const shop = buildShopping(plan, recipes, pantry, householdSize(profile));
  const today = todayDay();
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.titleRow}>
        <Text style={s.brand}>SUVAI</Text>
        <TouchableOpacity onPress={() => go({ name: 'profile' })}><Text style={s.link}>My Kitchen ›</Text></TouchableOpacity>
      </View>
      <Text style={s.h1}>Good evening, {profile.name}</Text>

      <Text style={s.h2}>Cooking today · {DAY_NAMES[today]}</Text>
      {MEALS.map((meal) => {
        const r = byId(recipes, plan[slotKey(today, meal)]);
        return (
          <TouchableOpacity key={meal} style={s.row} onPress={() => (r ? go({ name: 'recipe', id: r.id }) : go({ name: 'pick', day: today, meal }))}>
            <Text style={[s.meta, { width: 80 }]}>{meal}</Text>
            <Text style={[s.rowText, { flex: 1 }, !r && { color: C.terracotta, fontWeight: '700' }]}>{r ? r.emoji + ' ' + r.title : '+ Add recipe'}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={s.hero}>
        <View style={s.titleRow}>
          <Text style={s.heroTitle}>Pantry status</Text>
          <View style={s.heroPill}><Text style={s.heroPillText}>{expiring.length ? 'Use ' + expiring.length + ' soon' : 'All good'}</Text></View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity style={s.heroTile} onPress={() => setTab('Pantry')}><Text style={s.heroNum}>{inStock.length}</Text><Text style={s.heroLabel}>in stock</Text></TouchableOpacity>
          <TouchableOpacity style={s.heroTile} onPress={() => setTab('Pantry')}><Text style={s.heroNum}>{low.length}</Text><Text style={s.heroLabel}>running low</Text></TouchableOpacity>
          <TouchableOpacity style={[s.heroTile, { marginRight: 0 }]} onPress={() => setTab('Pantry')}><Text style={s.heroNum}>{expiring.length}</Text><Text style={s.heroLabel}>expiring</Text></TouchableOpacity>
        </View>
      </View>

      <Text style={s.h2}>What I can cook now</Text>
      {ranked.slice(0, 3).map((x) => (
        <RecipeCard key={x.recipe.id} recipe={x.recipe} match={matchPct(x.recipe, pantry)} onPress={() => go({ name: 'recipe', id: x.recipe.id })}
          sub={x.missing.length ? 'Missing ' + x.missing.map(nameOf).join(', ') : 'You have everything'} />
      ))}
      <Btn label="Ask the kitchen assistant" kind="accent" onPress={() => askAI('What can I cook tonight?')} />

      <Text style={s.h2}>Expiring soon</Text>
      {expiring.length === 0 ? <Text style={s.body}>Nothing is close to expiry.</Text> : null}
      {expiring.map((id) => (
        <View key={id} style={s.row}>
          <Text style={s.rowText}>{ING[id].name}</Text>
          <Text style={[s.meta, { color: C.red }]}>{expiryText(pantry[id].days)}</Text>
        </View>
      ))}
      {expiring.length > 0 ? (
        <View style={{ marginTop: 8 }}><Btn small kind="light" label="What can I make with these?" onPress={() => askAI('What should I make with what is expiring?')} /></View>
      ) : null}

      <Text style={s.h2}>To buy this week</Text>
      <TouchableOpacity style={s.panel} onPress={openShopping}>
        <Text style={s.cardTitle}>{shop.items.length} item{shop.items.length === 1 ? '' : 's'} on your shopping list</Text>
        <Text style={s.meta} numberOfLines={2}>
          {shop.items.length ? shop.items.slice(0, 5).map((i) => i.name).join(', ') + (shop.items.length > 5 ? ' and more' : '') : 'Your pantry covers this week\'s plan.'}
        </Text>
        <Text style={s.link}>Open shopping list ›</Text>
      </TouchableOpacity>

      <Text style={s.h2}>Recently saved</Text>
      {recipes.slice(-2).reverse().map((r) => (
        <RecipeCard key={r.id} recipe={r} onPress={() => go({ name: 'recipe', id: r.id })} />
      ))}
      <View style={{ marginTop: 4 }}><Btn small kind="light" label="+ Import a recipe" onPress={() => go({ name: 'import' })} /></View>
    </ScrollView>
  );
}

// ---------- Recipes ----------
function RecipesScreen({ recipes, pantry, collections, go }) {
  const [q, setQ] = useState('');
  const [meal, setMeal] = useState('All');
  const [group, setGroup] = useState('All');
  const [cuisine, setCuisine] = useState('Any cuisine');
  const [maxTime, setMaxTime] = useState(0);
  const cuisines = ['Any cuisine'];
  recipes.forEach((r) => { if (cuisines.indexOf(r.cuisine) === -1) cuisines.push(r.cuisine); });
  const needle = q.trim().toLowerCase();
  const list = recipes.filter((r) => {
    if (meal !== 'All' && r.meals.indexOf(meal) === -1) return false;
    if (group === 'Favourites' && !r.favourite) return false;
    if (group !== 'All' && group !== 'Favourites' && r.collections.indexOf(group) === -1) return false;
    if (cuisine !== 'Any cuisine' && r.cuisine !== cuisine) return false;
    if (maxTime && r.time > maxTime) return false;
    if (!needle) return true;
    if (r.title.toLowerCase().indexOf(needle) !== -1 || r.cuisine.toLowerCase().indexOf(needle) !== -1) return true;
    return r.ingredients.some((l) => nameOf(l).toLowerCase().indexOf(needle) !== -1);
  });
  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <View style={s.titleRow}>
        <Text style={s.h1}>Recipes</Text>
        <Btn small label="+ Import" onPress={() => go({ name: 'import' })} />
      </View>
      <View style={s.segment}>
        {['All'].concat(MEALS).map((m) => (
          <TouchableOpacity key={m} style={[s.segBtn, meal === m && s.segOn]} onPress={() => setMeal(m)}>
            <Text style={[s.segText, meal === m && { color: C.white }]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={s.input} placeholder="Search by name, ingredient or cuisine" placeholderTextColor={C.muted} value={q} onChangeText={setQ} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
        {['All', 'Favourites'].concat(collections).map((c) => (
          <Chip key={c} label={c === 'Favourites' ? '♥ Favourites' : c} active={c === group} onPress={() => setGroup(c)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {cuisines.map((c) => <Chip key={c} label={c} active={c === cuisine} onPress={() => setCuisine(c)} />)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
        {[[0, 'Any time'], [15, '15 min or less'], [30, '30 min or less']].map((o) => (
          <Chip key={o[0]} label={o[1]} active={maxTime === o[0]} onPress={() => setMaxTime(o[0])} />
        ))}
      </ScrollView>
      {list.length === 0 ? <Text style={s.body}>No recipes match. Open a recipe and use "Good for" to tag it as breakfast, lunch or dinner.</Text> : null}
      {list.map((r) => <FeatureCard key={r.id} recipe={r} match={matchPct(r, pantry)} onPress={() => go({ name: 'recipe', id: r.id })} />)}
    </ScrollView>
  );
}

function RecipeScreen({ recipe, pantry, profile, collections, addCollection, update, go, back }) {
  const [servings, setServings] = useState(recipe.servings);
  const [newCol, setNewCol] = useState('');
  const factor = servings / recipe.servings;
  const warn = recipeAllergens(recipe, profile.allergies);
  const label = { have: 'In pantry', low: 'Running low', out: 'Missing' };
  const dot = { have: C.green, low: C.terracotta, out: C.red };
  const toggleCol = (c) => {
    const has = recipe.collections.indexOf(c) !== -1;
    update({ collections: has ? recipe.collections.filter((x) => x !== c) : recipe.collections.concat([c]) });
  };
  const createCol = () => {
    const name = newCol.trim();
    if (!name) return;
    addCollection(name);
    if (recipe.collections.indexOf(name) === -1) update({ collections: recipe.collections.concat([name]) });
    setNewCol('');
  };
  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Recipe" onBack={back}
        right={<TouchableOpacity onPress={() => update({ favourite: !recipe.favourite })}><Text style={{ fontSize: 24, color: C.terracotta }}>{recipe.favourite ? '♥' : '♡'}</Text></TouchableOpacity>}
      />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={[s.cover, { backgroundColor: recipe.color }]}><Text style={{ fontSize: 64 }}>{recipe.emoji}</Text></View>
        <Text style={s.h1}>{recipe.title}</Text>
        <Text style={s.meta}>{recipe.cuisine} · {recipe.time} min{recipe.meals.length ? ' · ' + recipe.meals.join(', ') : ''}</Text>
        <SourceLink source={recipe.source} />

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <View style={s.tile}><Text style={s.meta}>Time</Text><Text style={s.tileVal}>{recipe.time} min</Text></View>
          <View style={s.tile}><Text style={s.meta}>Serves</Text><Text style={s.tileVal}>{recipe.servings}</Text></View>
          <View style={[s.tile, { marginRight: 0, backgroundColor: C.sage }]}><Text style={s.meta}>At home</Text><Text style={s.tileVal}>{matchPct(recipe, pantry)}%</Text></View>
        </View>

        <View style={[s.titleRow, { marginTop: 12 }]}>
          <Thumbs value={recipe.verdict} onChange={(v) => update({ verdict: v })} />
          <TouchableOpacity onPress={() => go({ name: 'slot', recipeId: recipe.id })}><Text style={[s.link, { marginTop: 0 }]}>+ Meal plan</Text></TouchableOpacity>
        </View>

        {warn.length > 0 ? (
          <View style={s.alert}><Text style={s.alertText}>Contains {warn.join(', ')}, which is on your household's allergy list.</Text></View>
        ) : null}

        <View style={s.titleRow}>
          <Text style={s.h2}>Ingredients</Text>
          <View style={s.stepper}>
            <TouchableOpacity onPress={() => setServings(Math.max(1, servings - 1))} style={s.stepBtn}><Text style={s.stepTxt}>−</Text></TouchableOpacity>
            <Text style={s.stepVal}>Serves {servings}</Text>
            <TouchableOpacity onPress={() => setServings(servings + 1)} style={s.stepBtn}><Text style={s.stepTxt}>+</Text></TouchableOpacity>
          </View>
        </View>

        {recipe.ingredients.map((l, i) => {
          const lv = levelOf(pantry, l.id);
          const amount = l.qty === null || l.qty === undefined ? 'amount not given in source' : fmtQty(l.qty * factor) + (l.unit ? ' ' + l.unit : '');
          return (
            <View key={i} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowText}>{nameOf(l)}</Text>
                <Text style={s.meta}>{amount}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[s.dot, { backgroundColor: dot[lv] }]} />
                  <Text style={s.meta}>{label[lv]}</Text>
                </View>
                {lv === 'out' ? (
                  <TouchableOpacity onPress={() => go({ name: 'sub', recipeId: recipe.id, ingId: l.id })}>
                    <Text style={s.link}>Find a substitute</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}

        <Text style={s.h2}>Nutrition per serving</Text>
        <NutritionSummary recipe={recipe} />

        <Text style={s.h2}>Plates for my household</Text>
        <HouseholdPlates recipe={recipe} profile={profile} />

        <Text style={s.h2}>Method</Text>
        {recipe.steps.map((st, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={s.stepNum}>{i + 1}</Text>
            <Text style={[s.body, { flex: 1 }]}>{st}</Text>
          </View>
        ))}

        <Text style={s.h2}>My notes and changes</Text>
        <TextInput
          style={[s.input, { minHeight: 70, textAlignVertical: 'top' }]} multiline
          placeholder="E.g. used less chilli, kids liked it with extra potatoes" placeholderTextColor={C.muted}
          value={recipe.notes} onChangeText={(t) => update({ notes: t })}
        />

        <Text style={s.h2}>Good for</Text>
        <MealChips value={recipe.meals} onChange={(m) => update({ meals: m })} />

        <Text style={s.h2}>Collections</Text>
        <View style={s.wrap}>
          {collections.map((c) => <Chip key={c} label={c} active={recipe.collections.indexOf(c) !== -1} onPress={() => toggleCol(c)} />)}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} placeholder="New collection name" placeholderTextColor={C.muted} value={newCol} onChangeText={setNewCol} />
          <Btn small kind="light" label="Create" onPress={createCol} />
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={s.footer}><Btn label="Cook this recipe" onPress={() => go({ name: 'cook', id: recipe.id })} /></View>
    </View>
  );
}

function CookScreen({ recipe, pantry, onFinish, back }) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [verdict, setVerdict] = useState(recipe.verdict);
  const used = recipe.ingredients.filter((l) => ING[l.id] && levelOf(pantry, l.id) !== 'out');
  const start = {};
  used.forEach((l) => { start[l.id] = levelOf(pantry, l.id); });
  const [levels, setLevels] = useState(start);

  if (done) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Nicely done" onBack={() => setDone(false)} />
        <ScrollView contentContainerStyle={s.page}>
          <Text style={s.h1}>How was it?</Text>
          <View style={{ marginVertical: 8 }}><Thumbs value={verdict} onChange={setVerdict} /></View>
          <Text style={s.meta}>Suvai suggests liked meals more often and not-great ones less.</Text>
          <Text style={s.h2}>Update your pantry</Text>
          <Text style={s.body}>You used these. Tap to tell Suvai what is left. Nothing changes until you confirm.</Text>
          {used.map((l) => (
            <View key={l.id} style={s.row}>
              <Text style={[s.rowText, { flex: 1 }]}>{nameOf(l)}</Text>
              <LevelPills value={levels[l.id]} onChange={(v) => setLevels(Object.assign({}, levels, { [l.id]: v }))} />
            </View>
          ))}
          <View style={{ marginTop: 20 }}><Btn label="Confirm and save" onPress={() => onFinish(levels, verdict)} /></View>
        </ScrollView>
      </View>
    );
  }

  const last = i === recipe.steps.length - 1;
  return (
    <View style={{ flex: 1, backgroundColor: C.green }}>
      <View style={[s.header, { backgroundColor: C.green, borderBottomWidth: 0 }]}>
        <TouchableOpacity onPress={back} style={s.back}><Text style={[s.backText, { color: C.cream }]}>✕ Exit</Text></TouchableOpacity>
        <Text style={[s.headerTitle, { color: C.cream }]} numberOfLines={1}>{recipe.title}</Text>
        <View style={{ minWidth: 60 }} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: C.terracotta, fontWeight: '700', letterSpacing: 1, marginBottom: 12 }}>
          STEP {i + 1} OF {recipe.steps.length}
        </Text>
        <Text style={{ color: C.cream, fontSize: 26, lineHeight: 36, fontFamily: SERIF }}>{recipe.steps[i]}</Text>
      </View>
      <View style={{ flexDirection: 'row', padding: 16 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          {i > 0 ? <Btn kind="light" label="Back" onPress={() => setI(i - 1)} /> : null}
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Btn kind="accent" label={last ? 'Finish' : 'Next step'} onPress={() => (last ? setDone(true) : setI(i + 1))} />
        </View>
      </View>
    </View>
  );
}

function SubScreen({ recipe, ingId, pantry, profile, back }) {
  const res = findSubs(recipe, ingId, pantry, profile.allergies);
  const ingName = nameOf({ id: ingId });
  return (
    <View style={{ flex: 1 }}>
      <Header title="Substitution" onBack={back} />
      <ScrollView contentContainerStyle={s.page}>
        <Text style={s.meta}>In {recipe.title}</Text>
        <Text style={s.h1}>Replacing {ingName}</Text>
        {res.options.length === 0 ? (
          <View style={s.panel}>
            <Text style={s.cardTitle}>No good substitute</Text>
            <Text style={s.body}>
              In this recipe, {ingName.toLowerCase()} does a job that nothing suitable can stand in for. It is better to buy it or pick another recipe.
            </Text>
          </View>
        ) : null}
        <SubOptions recipe={recipe} ingId={ingId} pantry={pantry} profile={profile} />
      </ScrollView>
    </View>
  );
}

// ---------- Pantry ----------
function PantryScreen({ pantry, setItem, addItem }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [only, setOnly] = useState(null);
  const needle = q.trim().toLowerCase();
  const matches = needle
    ? Object.keys(ING).filter((id) => !pantry[id] && ING[id].name.toLowerCase().indexOf(needle) !== -1).slice(0, 5)
    : [];
  const locs = ['Fridge', 'Freezer', 'Dry'];
  const title = { Fridge: 'Fresh · refrigerator', Freezer: 'Frozen · freezer', Dry: 'Dry storage' };
  const low = Object.keys(pantry).filter((id) => pantry[id].level === 'low');
  const num = (t) => { const n = parseFloat(t); return isNaN(n) ? null : n; };
  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Pantry</Text>
      <TextInput style={s.input} placeholder="Add an ingredient (try kangkong or prawns)" placeholderTextColor={C.muted} value={q} onChangeText={setQ} />
      {matches.map((id) => (
        <TouchableOpacity key={id} style={s.suggest} onPress={() => { addItem(id); setQ(''); }}>
          <Text style={s.rowText}>+ {ING[id].name}</Text>
          <Text style={s.meta}>{title[ING[id].loc]}</Text>
        </TouchableOpacity>
      ))}
      {needle && matches.length === 0 ? <Text style={s.meta}>No match in the sample ingredient list.</Text> : null}

      <View style={{ flexDirection: 'row', marginTop: 14 }}>
        {locs.map((loc, li) => {
          const ids = Object.keys(pantry).filter((id) => pantry[id].loc === loc && pantry[id].level !== 'out');
          const exp = ids.filter((id) => pantry[id].days !== null && pantry[id].days <= 3).length;
          const tint = { Fridge: C.sage, Freezer: '#DDE7EA', Dry: '#EFE6CF' };
          const short = { Fridge: 'Fresh', Freezer: 'Frozen', Dry: 'Dry' };
          return (
            <TouchableOpacity key={loc} onPress={() => setOnly(only === loc ? null : loc)}
              style={[s.locCard, { backgroundColor: tint[loc] }, li === 2 && { marginRight: 0 }, only === loc && { borderColor: C.green }]}>
              <Text style={s.locTitle}>{short[loc]}</Text>
              <Text style={s.locNum}>{ids.length}</Text>
              <Text style={s.meta}>items</Text>
              {exp ? <View style={s.expPill}><Text style={s.expText}>{exp} exp soon</Text></View> : null}
            </TouchableOpacity>
          );
        })}
      </View>
      {only ? <Text style={s.meta}>Showing {title[only].toLowerCase()} only. Tap the card again to show everything.</Text> : null}

      <Text style={s.h2}>Running low</Text>
      {low.length === 0 ? <Text style={s.body}>Nothing is running low.</Text> : (
        <Text style={s.body}>{low.map((id) => ING[id].name).join(', ')}. These are added to your shopping list.</Text>
      )}

      <Text style={s.h2}>Frequently bought</Text>
      <Text style={s.meta}>Tap to mark as restocked.</Text>
      <View style={[s.wrap, { marginTop: 8 }]}>
        {FREQUENT.map((id) => {
          const lv = levelOf(pantry, id);
          return (
            <Chip key={id} active={lv === 'have'} label={ING[id].name + (lv === 'have' ? ' ✓' : lv === 'low' ? ' · low' : ' · out')}
              onPress={() => (pantry[id] ? setItem(id, { level: 'have' }) : addItem(id))} />
          );
        })}
      </View>

      {locs.map((loc) => {
        const ids = Object.keys(pantry).filter((id) => pantry[id].loc === loc);
        if (ids.length === 0 || (only && only !== loc)) return null;
        return (
          <View key={loc}>
            <Text style={s.h2}>{title[loc]}</Text>
            {ids.map((id) => {
              const p = pantry[id];
              const bits = [];
              if (p.qty !== null && p.qty !== undefined) bits.push(fmtQty(p.qty) + (p.unit ? ' ' + p.unit : ''));
              if (p.days !== null && p.level !== 'out') bits.push(expiryText(p.days));
              return (
                <View key={id} style={{ borderBottomWidth: 1, borderBottomColor: C.line }}>
                  <View style={[s.row, { borderBottomWidth: 0 }]}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setOpen(open === id ? null : id)}>
                      <Text style={[s.rowText, p.level === 'out' && { color: C.muted }]}>{ING[id].name}</Text>
                      <Text style={[s.meta, p.days !== null && p.days <= 3 && p.level !== 'out' && { color: C.red }]}>
                        {bits.length ? bits.join(' · ') : 'Tap to add quantity or expiry'}
                      </Text>
                    </TouchableOpacity>
                    <LevelPills value={p.level} onChange={(v) => setItem(id, { level: v })} />
                  </View>
                  {open === id ? (
                    <View style={s.editor}>
                      <View style={s.fieldWide}>
                        <Text style={s.label}>Quantity</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity style={s.stepBtn} onPress={() => setItem(id, { qty: Math.max(0, (p.qty || 0) - (p.unit ? 50 : 1)) })}><Text style={s.stepTxt}>−</Text></TouchableOpacity>
                          <TextInput style={[s.input, { flex: 1, marginHorizontal: 4, paddingHorizontal: 6, textAlign: 'center' }]} keyboardType="numeric" value={p.qty === null || p.qty === undefined ? '' : String(p.qty)}
                            onChangeText={(t) => setItem(id, { qty: num(t) })} placeholder="–" placeholderTextColor={C.muted} />
                          <TouchableOpacity style={s.stepBtn} onPress={() => setItem(id, { qty: (p.qty || 0) + (p.unit ? 50 : 1) })}><Text style={s.stepTxt}>+</Text></TouchableOpacity>
                        </View>
                      </View>
                      <View style={s.field}>
                        <Text style={s.label}>Unit</Text>
                        <TextInput style={s.input} value={p.unit || ''} onChangeText={(t) => setItem(id, { unit: t })} placeholder="g, ml, pcs" placeholderTextColor={C.muted} autoCapitalize="none" />
                      </View>
                      <View style={s.field}>
                        <Text style={s.label}>Expiry (days)</Text>
                        <TextInput style={s.input} keyboardType="numeric" value={p.days === null ? '' : String(p.days)}
                          onChangeText={(t) => setItem(id, { days: num(t) })} placeholder="not set" placeholderTextColor={C.muted} />
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ---------- AI Kitchen Assistant (chat) ----------
function AIScreen({ messages, send, recipes, pantry, profile, go }) {
  const [draft, setDraft] = useState('');
  const scroller = useRef(null);
  const submit = (text) => {
    const t = (text || draft).trim();
    if (!t) return;
    send(t);
    setDraft('');
  };
  const last = messages[messages.length - 1];
  const chips = last && last.from === 'ai' && last.chips ? last.chips : SUGGESTIONS;
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.chatHead}>
        <Text style={s.chatTitle}>Kitchen Assistant</Text>
        <Text style={s.meta}>Knows your {recipes.length} recipes, your pantry and your allergies</Text>
      </View>
      <ScrollView
        ref={scroller} contentContainerStyle={{ padding: 14 }} keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => { if (scroller.current) scroller.current.scrollToEnd({ animated: true }); }}
      >
        {messages.map((m, i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <View style={[s.bubble, m.from === 'me' ? s.bubbleMe : s.bubbleAI]}>
              <Text style={[s.body, m.from === 'me' && { color: C.white }]}>{m.text}</Text>
            </View>
            {m.recipes ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {m.recipes.map((x) => {
                  const r = byId(recipes, x.id);
                  return r ? <MiniCard key={x.id} recipe={r} sub={x.sub} onPress={() => go({ name: 'recipe', id: r.id })} /> : null;
                })}
              </ScrollView>
            ) : null}
            {m.subs && byId(recipes, m.subs.recipeId) ? (
              <SubOptions recipe={byId(recipes, m.subs.recipeId)} ingId={m.subs.ingId} only={m.subs.only} pantry={pantry} profile={profile} />
            ) : null}
          </View>
        ))}
      </ScrollView>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10, paddingTop: 6 }}>
          {chips.map((c) => <Chip key={c} label={c} onPress={() => submit(c)} />)}
        </ScrollView>
        <View style={s.composer}>
          <TextInput
            style={[s.input, { flex: 1, marginRight: 8 }]} placeholder="Ask about cooking, swaps or servings" placeholderTextColor={C.muted}
            value={draft} onChangeText={setDraft} onSubmitEditing={() => submit()} returnKeyType="send"
          />
          <Btn small label="Send" onPress={() => submit()} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------- Import (simulated extraction; a backend job in the real app) ----------
const IMPORT_SAMPLES = {
  website: {
    status: 'ok', title: 'Miso Butter Salmon', meals: ['Dinner'], cuisine: 'Japanese', time: 20, servings: 2, emoji: '🐟', color: '#D9997A',
    source: { platform: 'Website', creator: 'Sample Recipe Site', url: 'https://example.com/miso-butter-salmon' },
    ingredients: [
      { id: 'salmon', qty: 2, unit: 'fillets' }, { id: 'miso', qty: 1, unit: 'tbsp' },
      { id: 'butter', qty: 20, unit: 'g' }, { id: 'garlic', qty: 1, unit: 'cloves' },
    ],
    steps: ['Mix the miso, soft butter and grated garlic.', 'Pan-fry the salmon skin-side down for 4 minutes, then flip.', 'Spoon over the miso butter and baste for 2 minutes.'],
  },
  instagram: {
    status: 'partial', title: 'Sambal Eggs', meals: ['Breakfast', 'Lunch'], cuisine: 'Malay', time: null, servings: null, emoji: '🌶️', color: '#B8553A',
    source: { platform: 'Instagram', creator: '@sample.homecook', url: 'https://instagram.com/reel/sample2' },
    ingredients: [
      { id: 'egg', qty: 4, unit: '' }, { id: 'sambal', qty: null, unit: 'tbsp' },
      { id: 'onion', qty: 1, unit: '' }, { id: 'oil', qty: null, unit: 'tbsp' },
    ],
    steps: ['Fry the eggs until the edges are crisp and set aside.', 'Soften the sliced onion, add the sambal and cook until the oil separates.', 'Return the eggs and coat with the sambal.'],
  },
  tiktok: {
    status: 'ok', title: 'Crispy Tofu with Soy Glaze', meals: ['Lunch', 'Dinner'], cuisine: 'Chinese', time: 20, servings: 2, emoji: '🧈', color: '#C9B07A',
    source: { platform: 'TikTok', creator: '@sample.quickmeals', url: 'https://tiktok.com/@sample/video/2' },
    ingredients: [
      { id: 'tofu', qty: 300, unit: 'g' }, { id: 'soy_sauce', qty: 2, unit: 'tbsp' },
      { id: 'garlic', qty: 2, unit: 'cloves' }, { id: 'sugar', qty: 1, unit: 'tsp' }, { id: 'oil', qty: 2, unit: 'tbsp' },
    ],
    steps: ['Press the tofu dry and cut into cubes.', 'Fry in hot oil until golden on all sides.', 'Add the garlic, soy sauce and sugar and toss until glossy.'],
  },
  photo: {
    status: 'ok', title: 'Steamed Egg', meals: ['Breakfast', 'Dinner'], cuisine: 'Chinese', time: 15, servings: 2, emoji: '🥚', color: '#E3C97A',
    source: { platform: 'Photo', creator: 'Handwritten family recipe card', url: null },
    ingredients: [
      { id: 'egg', qty: 3, unit: '' }, { id: 'soy_sauce', qty: 1, unit: 'tsp' }, { id: 'spring_onion', qty: 1, unit: 'stalks' },
    ],
    steps: ['Beat the eggs with one and a half times their volume of warm water.', 'Strain into a bowl, cover and steam on low heat for 10 minutes.', 'Top with soy sauce and spring onion.'],
  },
};

function ImportScreen({ onSave, back }) {
  const [url, setUrl] = useState('');
  const [draft, setDraft] = useState(null);
  const [failed, setFailed] = useState(false);
  const [qtyText, setQtyText] = useState({});

  const load = (kind) => {
    setQtyText({});
    if (kind === 'youtube') { setDraft(null); setFailed(true); return; }
    setFailed(false);
    setDraft(JSON.parse(JSON.stringify(IMPORT_SAMPLES[kind])));
  };
  const run = () => {
    const link = url.toLowerCase();
    load(link.indexOf('youtube') !== -1 ? 'youtube' : link.indexOf('tiktok') !== -1 ? 'tiktok' : link.indexOf('instagram') !== -1 ? 'instagram' : 'website');
  };

  const save = () => {
    const ingredients = draft.ingredients.map((l, i) => {
      if (l.qty !== null) return l;
      const n = parseFloat(qtyText[i]);
      return Object.assign({}, l, { qty: isNaN(n) ? null : n });
    });
    onSave({
      id: 'r' + Date.now(), meals: draft.meals, title: draft.title, cuisine: draft.cuisine, time: draft.time || 20, servings: draft.servings || 2,
      type: 'savoury', emoji: draft.emoji, color: draft.color, verdict: null, favourite: false, collections: [], notes: '',
      source: draft.source, ingredients, steps: draft.steps,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Import a recipe" onBack={back} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        {!draft ? (
          <View>
            <Text style={s.body}>Paste a link, or share to Suvai from Instagram, TikTok or your browser.</Text>
            <TextInput style={[s.input, { marginTop: 12 }]} placeholder="https://..." placeholderTextColor={C.muted} value={url} onChangeText={setUrl} autoCapitalize="none" />
            <View style={{ marginTop: 10 }}><Btn label="Import from link" onPress={run} /></View>
            <View style={{ marginTop: 8 }}><Btn kind="light" label="Import from a photo or screenshot" onPress={() => load('photo')} /></View>
            <Text style={s.h2}>Try a sample</Text>
            <View style={s.wrap}>
              <Chip label="Recipe website" onPress={() => load('website')} />
              <Chip label="Instagram Reel" onPress={() => load('instagram')} />
              <Chip label="TikTok video" onPress={() => load('tiktok')} />
              <Chip label="Photo of a recipe card" onPress={() => load('photo')} />
              <Chip label="Link that cannot be read" onPress={() => load('youtube')} />
            </View>
            {failed ? (
              <View style={s.alert}>
                <Text style={[s.alertText, { fontWeight: '700' }]}>We couldn't read the recipe from this link.</Text>
                <Text style={s.alertText}>The recipe is spoken in the video, which Suvai cannot access from a link. The creator and link have been kept. Add a photo or screenshot instead.</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View>
            <Text style={s.meta}>Review before saving. Nothing is added to your library until you confirm.</Text>
            {draft.status === 'partial' ? (
              <View style={s.alert}><Text style={s.alertText}>Only the caption could be read. Two amounts and the cooking time were not given, so they are left blank instead of guessed.</Text></View>
            ) : null}
            <Text style={s.label}>Title</Text>
            <TextInput style={s.input} value={draft.title} onChangeText={(t) => setDraft(Object.assign({}, draft, { title: t }))} />
            <SourceLink source={draft.source} />
            <Text style={s.meta}>Time: {draft.time ? draft.time + ' min' : 'not given'} · Serves: {draft.servings || 'not given'}</Text>

            <Text style={s.h2}>Good for</Text>
            <MealChips value={draft.meals} onChange={(m) => setDraft(Object.assign({}, draft, { meals: m }))} />

            <Text style={s.h2}>Ingredients</Text>
            {draft.ingredients.map((l, i) => (
              <View key={i} style={s.row}>
                <Text style={[s.rowText, { flex: 1 }]}>{nameOf(l)}</Text>
                {l.qty !== null ? (
                  <Text style={s.meta}>{fmtQty(l.qty)} {l.unit}</Text>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={s.qtyInput} placeholder="?" placeholderTextColor={C.red} keyboardType="numeric"
                      value={qtyText[i] || ''} onChangeText={(t) => setQtyText(Object.assign({}, qtyText, { [i]: t }))}
                    />
                    <Text style={[s.meta, { color: C.red }]}> {l.unit} · missing</Text>
                  </View>
                )}
              </View>
            ))}

            <Text style={s.h2}>Method</Text>
            {draft.steps.map((st, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Text style={s.stepNum}>{i + 1}</Text>
                <Text style={[s.body, { flex: 1 }]}>{st}</Text>
              </View>
            ))}
            <View style={{ marginTop: 12 }}><Btn label="Save to my recipes" onPress={save} /></View>
            <View style={{ marginTop: 8 }}><Btn kind="ghost" label="Discard" onPress={() => setDraft(null)} /></View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ---------- Meal Planner & Shopping ----------
function PlannerScreen({ week, setWeek, copyToNext, view, setView, plan, setPlan, menus, saveMenu, recipes, pantry, profile, go, clearSlot, setVerdict, bought, toggleBought, extras, addExtra, stockUp }) {
  const [extraText, setExtraText] = useState('');
  const today = todayDay();
  const planned = Object.keys(plan).filter((k) => plan[k]).length;
  const shop = buildShopping(plan, recipes, pantry, householdSize(profile));
  const ticked = shop.items.filter((i) => bought[i.key]).length + extras.filter((e) => bought[e.key]).length;

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Plan & Shop</Text>
      <View style={s.segment}>
        <TouchableOpacity style={[s.segBtn, view === 'plan' && s.segOn]} onPress={() => setView('plan')}>
          <Text style={[s.segText, view === 'plan' && { color: C.white }]}>Weekly plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.segBtn, view === 'shop' && s.segOn]} onPress={() => setView('shop')}>
          <Text style={[s.segText, view === 'shop' && { color: C.white }]}>Shopping list ({shop.items.length + extras.length})</Text>
        </TouchableOpacity>
      </View>

      <WeekSwitch week={week} setWeek={setWeek} />

      {view === 'plan' ? (
        <View>
          <Text style={s.meta}>{planned} of 21 meals planned {week === 0 ? 'this week' : 'next week'}. Tap a slot to choose a saved recipe, and use the thumbs to note how each meal went.</Text>
          {DAYS.map((day, di) => (
            <View key={day} style={s.panel}>
              <View style={[s.titleRow, { marginBottom: 4 }]}>
                <Text style={s.cardTitle}>{DAY_NAMES[day]} <Text style={s.dayDate}>{dayDate(week, di)}</Text></Text>
                {day === today && week === 0 ? <View style={[s.badge, { backgroundColor: C.terracotta, marginBottom: 0 }]}><Text style={s.badgeText}>Today</Text></View> : null}
              </View>
              {MEALS.map((meal, mi) => {
                const r = byId(recipes, plan[slotKey(day, meal)]);
                return (
                  <View key={meal} style={[s.row, { alignItems: 'flex-start' }, mi === MEALS.length - 1 && { borderBottomWidth: 0 }]}>
                    <Text style={[s.meta, { width: 76, marginTop: 2 }]}>{meal}</Text>
                    {r ? (
                      <View style={{ flex: 1 }}>
                        <TouchableOpacity onPress={() => go({ name: 'recipe', id: r.id })}>
                          <Text style={s.rowText}>{r.emoji} {r.title}</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                          <Thumbs compact value={r.verdict} onChange={(v) => setVerdict(r.id, v)} />
                          <TouchableOpacity onPress={() => go({ name: 'pick', day, meal })}><Text style={[s.link, { marginTop: 0, marginLeft: 6 }]}>Change</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => clearSlot(day, meal)}><Text style={[s.meta, { marginLeft: 14 }]}>Remove</Text></TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => go({ name: 'pick', day, meal })}>
                        <Text style={[s.link, { marginTop: 2 }]}>+ Add recipe</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          <Text style={s.h2}>Reuse a previous menu</Text>
          {menus.map((m, i) => (
            <View key={i} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowText}>{m.name}</Text>
                <Text style={s.meta}>{Object.keys(m.plan).filter((k) => m.plan[k]).length} meals</Text>
              </View>
              <Btn small kind="light" label="Use this menu" onPress={() => setPlan(Object.assign({}, m.plan))} />
            </View>
          ))}
          <View style={[s.wrap, { marginTop: 12 }]}>
            <View style={{ marginRight: 8, marginBottom: 8 }}><Btn small label="Save as a menu" onPress={saveMenu} /></View>
            {week === 0 ? <View style={{ marginRight: 8, marginBottom: 8 }}><Btn small kind="light" label="Copy to next week" onPress={copyToNext} /></View> : null}
            <Btn small kind="ghost" label="Clear week" onPress={() => setPlan({})} />
          </View>
        </View>
      ) : (
        <View>
          <Text style={s.meta}>
            Built from {planned} planned meal{planned === 1 ? '' : 's'} {week === 0 ? 'this week' : 'next week'}, with quantities for your household of {householdSize(profile)}. {shop.covered} ingredient{shop.covered === 1 ? ' is' : 's are'} left off because you already have enough.
          </Text>
          {shop.items.length === 0 && extras.length === 0 ? <View style={s.panel}><Text style={s.body}>Nothing to buy. Your pantry covers the plan.</Text></View> : null}
          {AISLES.map((aisle) => {
            const items = shop.items.filter((i) => i.aisle === aisle);
            if (items.length === 0) return null;
            return (
              <View key={aisle}>
                <Text style={s.h2}>{aisle}</Text>
                {items.map((i) => (
                  <TouchableOpacity key={i.key} style={s.row} onPress={() => toggleBought(i.key)}>
                    <View style={[s.check, bought[i.key] && s.checkOn]}><Text style={{ color: C.white, fontWeight: '700' }}>{bought[i.key] ? '✓' : ''}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.rowText, bought[i.key] && { textDecorationLine: 'line-through', color: C.muted }]}>{i.name}{i.amount ? ' · ' + i.amount : ''}</Text>
                      <Text style={s.meta}>{i.reason}{i.uses.length ? ' · for ' + i.uses.join(', ') : ''}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}

          <Text style={s.h2}>Other items</Text>
          {extras.map((e) => (
            <TouchableOpacity key={e.key} style={s.row} onPress={() => toggleBought(e.key)}>
              <View style={[s.check, bought[e.key] && s.checkOn]}><Text style={{ color: C.white, fontWeight: '700' }}>{bought[e.key] ? '✓' : ''}</Text></View>
              <Text style={[s.rowText, { flex: 1 }, bought[e.key] && { textDecorationLine: 'line-through', color: C.muted }]}>{e.name}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} placeholder="Add anything else (e.g. kitchen towels)" placeholderTextColor={C.muted} value={extraText} onChangeText={setExtraText} />
            <Btn small kind="light" label="Add" onPress={() => { if (extraText.trim()) { addExtra(extraText.trim()); setExtraText(''); } }} />
          </View>

          <View style={{ marginTop: 20 }}>
            <Btn label={ticked ? 'Add ' + ticked + ' bought item' + (ticked === 1 ? '' : 's') + ' to pantry' : 'Tick items as you shop'} kind={ticked ? undefined : 'light'} onPress={() => { if (ticked) stockUp(shop.items); }} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function PickRecipeScreen({ week, day, meal, recipes, profile, onPick, back }) {
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const rank = { like: 0, dislike: 2 };
  const list = recipes
    .filter((r) => !needle || r.title.toLowerCase().indexOf(needle) !== -1 || r.ingredients.some((l) => nameOf(l).toLowerCase().indexOf(needle) !== -1))
    .slice()
    .sort((a, b) => (a.meals.indexOf(meal) === -1 ? 1 : 0) - (b.meals.indexOf(meal) === -1 ? 1 : 0) ||
      (rank[a.verdict] === undefined ? 1 : rank[a.verdict]) - (rank[b.verdict] === undefined ? 1 : rank[b.verdict]));
  return (
    <View style={{ flex: 1 }}>
      <Header title="Choose a recipe" onBack={back} />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Text style={s.h1}>{DAY_NAMES[day]} · {meal}</Text>
        <Text style={[s.meta, { marginBottom: 8 }]}>{WEEK_NAMES[week]} · {dayDate(week, DAYS.indexOf(day))}</Text>
        <TextInput style={[s.input, { marginBottom: 12 }]} placeholder="Search your recipes" placeholderTextColor={C.muted} value={q} onChangeText={setQ} />
        {list.length === 0 ? <Text style={s.body}>No recipes match.</Text> : null}
        {list.map((r) => {
          const warn = recipeAllergens(r, profile.allergies);
          return <RecipeCard key={r.id} recipe={r} onPress={() => onPick(r.id)} sub={warn.length ? 'Contains ' + warn.join(', ') + ' (on your allergy list)' : r.meals.indexOf(meal) !== -1 ? 'Tagged for ' + meal.toLowerCase() : null} />;
        })}
      </ScrollView>
    </View>
  );
}

function PickSlotScreen({ week, setWeek, recipe, plan, recipes, onPick, back }) {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Add to meal plan" onBack={back} />
      <ScrollView contentContainerStyle={s.page}>
        <Text style={s.h1}>{recipe.title}</Text>
        <Text style={s.body}>Pick a week, a day and a meal.</Text>
        <WeekSwitch week={week} setWeek={setWeek} />
        {DAYS.map((day, di) => (
          <View key={day} style={{ marginTop: 14 }}>
            <Text style={s.label}>{DAY_NAMES[day]} {dayDate(week, di)}{day === todayDay() && week === 0 ? ' · today' : ''}</Text>
            <View style={s.wrap}>
              {MEALS.map((meal) => {
                const cur = plan[slotKey(day, meal)];
                const other = cur && cur !== recipe.id ? byId(recipes, cur) : null;
                return (
                  <Chip key={meal} active={cur === recipe.id} onPress={() => onPick(day, meal)}
                    label={meal + (other ? ' (replaces ' + other.title + ')' : '')} />
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------- Profile ----------
function ProfileScreen({ profile, setProfile, recipes, cookedCount }) {
  const toggle = (a) => {
    const has = profile.allergies.indexOf(a) !== -1;
    const allergies = has ? profile.allergies.filter((x) => x !== a) : profile.allergies.concat([a]);
    setProfile(Object.assign({}, profile, { allergies }));
  };
  const setAdult = (i, patch) => setProfile(Object.assign({}, profile, { adults: profile.adults.map((a, ai) => (ai === i ? Object.assign({}, a, patch) : a)) }));
  const setAdults = (n) => {
    const count = Math.max(1, Math.min(6, n));
    const adults = profile.adults.slice(0, count);
    while (adults.length < count) adults.push({ name: 'Adult ' + (adults.length + 1), goal: 'Maintain', p: 100, c: 250, f: 70 });
    setProfile(Object.assign({}, profile, { adults }));
  };
  const liked = recipes.filter((r) => r.verdict === 'like');
  const disliked = recipes.filter((r) => r.verdict === 'dislike');
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.label}>Name</Text>
      <TextInput style={s.input} value={profile.name} onChangeText={(t) => setProfile(Object.assign({}, profile, { name: t }))} />

      <Text style={s.h2}>Household</Text>
      <View style={s.row}>
        <Text style={[s.rowText, { flex: 1 }]}>Adults</Text>
        <View style={s.stepper}>
          <TouchableOpacity onPress={() => setAdults(profile.adults.length - 1)} style={s.stepBtn}><Text style={s.stepTxt}>−</Text></TouchableOpacity>
          <Text style={s.stepVal}>{profile.adults.length}</Text>
          <TouchableOpacity onPress={() => setAdults(profile.adults.length + 1)} style={s.stepBtn}><Text style={s.stepTxt}>+</Text></TouchableOpacity>
        </View>
      </View>
      <View style={s.row}>
        <Text style={[s.rowText, { flex: 1 }]}>Children</Text>
        <View style={s.stepper}>
          <TouchableOpacity onPress={() => setProfile(Object.assign({}, profile, { kids: Math.max(0, profile.kids - 1) }))} style={s.stepBtn}><Text style={s.stepTxt}>−</Text></TouchableOpacity>
          <Text style={s.stepVal}>{profile.kids}</Text>
          <TouchableOpacity onPress={() => setProfile(Object.assign({}, profile, { kids: Math.min(8, profile.kids + 1) }))} style={s.stepBtn}><Text style={s.stepTxt}>+</Text></TouchableOpacity>
        </View>
      </View>
      <Text style={s.meta}>Household of {householdSize(profile)}. Shopping list quantities are scaled to this number.</Text>

      <Text style={s.h2}>Adults' daily macro goals</Text>
      <Text style={s.meta}>The numbers below are sample values. Replace them with each adult's own goals. Children get portion guidance only, not macro targets.</Text>
      {profile.adults.map((a, i) => (
        <View key={i} style={s.panel}>
          <Text style={s.label}>Name</Text>
          <TextInput style={s.input} value={a.name} placeholder={'Adult ' + (i + 1)} placeholderTextColor={C.muted} onChangeText={(t) => setAdult(i, { name: t })} />
          <Text style={s.label}>Goal</Text>
          <View style={s.wrap}>
            {GOALS.map((g) => <Chip key={g} label={g} active={a.goal === g} onPress={() => setAdult(i, { goal: g })} />)}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {[['p', 'Protein (g)'], ['c', 'Carbs (g)'], ['f', 'Fat (g)']].map((m, mi) => (
              <View key={m[0]} style={[s.field, mi === 2 && { marginRight: 0 }]}>
                <Text style={s.label}>{m[1]}</Text>
                <TextInput style={s.input} keyboardType="numeric" value={String(a[m[0]])}
                  onChangeText={(t) => { const n = parseInt(t, 10); setAdult(i, { [m[0]]: isNaN(n) ? 0 : n }); }} />
              </View>
            ))}
          </View>
          <Text style={[s.meta, { marginTop: 8 }]}>About {a.p * 4 + a.c * 4 + a.f * 9} kcal a day · per meal: {Math.round(a.p / 3)} g protein, {Math.round(a.c / 3)} g carbs, {Math.round(a.f / 3)} g fat</Text>
        </View>
      ))}

      <Text style={s.h2}>Allergies</Text>
      <Text style={s.body}>These are strict. Suvai hides any recipe or substitute that contains them, including hidden sources such as belacan.</Text>
      <View style={[s.wrap, { marginTop: 10 }]}>
        {ALLERGY_OPTIONS.map((a) => <Chip key={a} label={a} active={profile.allergies.indexOf(a) !== -1} onPress={() => toggle(a)} />)}
      </View>

      <Text style={s.h2}>Meals we liked</Text>
      <Text style={s.body}>{liked.length ? liked.map((r) => r.title).join(', ') : 'None marked yet.'}</Text>
      <Text style={s.h2}>Meals that were not great</Text>
      <Text style={s.body}>{disliked.length ? disliked.map((r) => r.title).join(', ') : 'None marked yet.'}</Text>

      <Text style={s.h2}>Cooking history</Text>
      <Text style={s.body}>{cookedCount} recipe{cookedCount === 1 ? '' : 's'} cooked in this session.</Text>
    </ScrollView>
  );
}

// ---------- App ----------
const TABS = [['Home', '⌂'], ['Recipes', '▤'], ['Pantry', '◫'], ['Assistant', '✦'], ['Plan', '▦']];

export default function App() {
  const [tab, setTab] = useState('Home');
  const [route, setRoute] = useState(null); // screen shown above the tabs
  const [history, setHistory] = useState([]);
  const [recipes, setRecipes] = useState(START_RECIPES);
  const [collections, setCollections] = useState(['Weeknight dinners', 'Desserts']);
  const [pantry, setPantry] = useState(START_PANTRY);
  const [profile, setProfile] = useState({
    name: 'Rickesh', kids: 2, allergies: [],
    adults: [
      { name: 'Adult 1', goal: 'Lose fat', p: 130, c: 150, f: 60 },
      { name: 'Adult 2', goal: 'Build muscle', p: 160, c: 300, f: 80 },
    ],
  });
  const [messages, setMessages] = useState([FIRST_MESSAGE]);
  const [cookedCount, setCookedCount] = useState(0);
  const [plans, setPlans] = useState([START_PLAN, START_NEXT_PLAN]);
  const [week, setWeek] = useState(0);
  const plan = plans[week];
  const setPlan = (p) => setPlans((ps) => ps.map((x, i) => (i === week ? (typeof p === 'function' ? p(x) : p) : x)));
  const [menus, setMenus] = useState(START_MENUS);
  const [planView, setPlanView] = useState('plan');
  const [bought, setBought] = useState({});
  const [extras, setExtras] = useState([]);

  const go = (r) => { setHistory(history.concat([route])); setRoute(r); };
  const back = () => {
    const prev = history.length ? history[history.length - 1] : null;
    setHistory(history.slice(0, -1));
    setRoute(prev);
  };
  const home = () => { setHistory([]); setRoute(null); };

  const updateRecipe = (id, patch) => setRecipes((rs) => rs.map((r) => (r.id === id ? Object.assign({}, r, patch) : r)));
  const setItem = (id, patch) => setPantry((p) => Object.assign({}, p, { [id]: Object.assign({}, p[id], patch) }));
  const addItem = (id) => setPantry((p) => Object.assign({}, p, { [id]: { level: 'have', loc: ING[id].loc, days: null, qty: null, unit: '' } }));
  const setSlot = (day, meal, id) => setPlan((p) => Object.assign({}, p, { [slotKey(day, meal)]: id }));

  const send = (text) => {
    const reply = answer(text, recipes, pantry, profile);
    setMessages((ms) => ms.concat([{ from: 'me', text }, Object.assign({ from: 'ai' }, reply)]));
  };
  const askAI = (text) => { send(text); setTab('Assistant'); home(); };

  const stockUp = (items) => {
    setPantry((p) => {
      const next = Object.assign({}, p);
      items.forEach((i) => {
        if (!bought[i.key]) return;
        const cur = next[i.id] || { level: 'have', loc: ING[i.id].loc, days: null, qty: null, unit: i.unit };
        const sameUnit = cur.qty !== null && cur.qty !== undefined && cur.unit === i.unit && i.buyQty !== null;
        next[i.id] = Object.assign({}, cur, { level: 'have', qty: sameUnit ? Math.round((cur.qty + i.buyQty) * 100) / 100 : cur.qty });
      });
      return next;
    });
    setExtras(extras.filter((e) => !bought[e.key]));
    setBought({});
  };

  let screen = null;
  const current = route && (route.id || route.recipeId) ? byId(recipes, route.id || route.recipeId) : null;
  if (route && route.name === 'recipe' && current) {
    screen = (
      <RecipeScreen
        key={route.id} recipe={current} pantry={pantry} profile={profile} collections={collections}
        addCollection={(c) => { if (collections.indexOf(c) === -1) setCollections(collections.concat([c])); }}
        update={(patch) => updateRecipe(route.id, patch)} go={go} back={back}
      />
    );
  } else if (route && route.name === 'cook' && current) {
    screen = (
      <CookScreen
        recipe={current} pantry={pantry} back={back}
        onFinish={(levels, verdict) => {
          setPantry((p) => {
            const next = Object.assign({}, p);
            Object.keys(levels).forEach((id) => { next[id] = Object.assign({}, next[id], { level: levels[id] }); });
            return next;
          });
          updateRecipe(route.id, { verdict });
          setCookedCount(cookedCount + 1);
          setTab('Pantry');
          home();
        }}
      />
    );
  } else if (route && route.name === 'sub' && current) {
    screen = <SubScreen recipe={current} ingId={route.ingId} pantry={pantry} profile={profile} back={back} />;
  } else if (route && route.name === 'pick') {
    screen = (
      <PickRecipeScreen week={week} day={route.day} meal={route.meal} recipes={recipes} profile={profile} back={back}
        onPick={(id) => { setSlot(route.day, route.meal, id); back(); }} />
    );
  } else if (route && route.name === 'slot' && current) {
    screen = (
      <PickSlotScreen week={week} setWeek={setWeek} recipe={current} plan={plan} recipes={recipes} back={back}
        onPick={(day, meal) => { setSlot(day, meal, route.recipeId); back(); }} />
    );
  } else if (route && route.name === 'profile') {
    screen = (
      <View style={{ flex: 1 }}>
        <Header title="My Kitchen" onBack={back} />
        <ProfileScreen profile={profile} setProfile={setProfile} recipes={recipes} cookedCount={cookedCount} />
      </View>
    );
  } else if (route && route.name === 'import') {
    screen = (
      <ImportScreen
        back={back}
        onSave={(r) => { setRecipes(recipes.concat([r])); setHistory([]); setTab('Recipes'); setRoute({ name: 'recipe', id: r.id }); }}
      />
    );
  }

  return (
    <View style={s.app}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />
      {screen ? screen : (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {tab === 'Home' ? (
              <HomeScreen profile={profile} recipes={recipes} pantry={pantry} plan={plans[0]} askAI={askAI} setTab={setTab}
                go={(r) => { if (r.name === 'pick') setWeek(0); go(r); }}
                openShopping={() => { setWeek(0); setPlanView('shop'); setTab('Plan'); }} />
            ) : null}
            {tab === 'Recipes' ? <RecipesScreen recipes={recipes} pantry={pantry} collections={collections} go={go} /> : null}
            {tab === 'Pantry' ? <PantryScreen pantry={pantry} setItem={setItem} addItem={addItem} /> : null}
            {tab === 'Assistant' ? <AIScreen messages={messages} send={send} recipes={recipes} pantry={pantry} profile={profile} go={go} /> : null}
            {tab === 'Plan' ? (
              <PlannerScreen
                week={week} setWeek={setWeek} copyToNext={() => setPlans([plans[0], Object.assign({}, plans[0])])}
                view={planView} setView={setPlanView} plan={plan} setPlan={setPlan} menus={menus}
                saveMenu={() => setMenus(menus.concat([{ name: 'Saved menu ' + menus.length, plan: Object.assign({}, plan) }]))}
                recipes={recipes} pantry={pantry} profile={profile} go={go}
                clearSlot={(d, m) => setSlot(d, m, null)} setVerdict={(id, v) => updateRecipe(id, { verdict: v })}
                bought={bought} toggleBought={(k) => setBought(Object.assign({}, bought, { [k]: !bought[k] }))}
                extras={extras} addExtra={(name) => setExtras(extras.concat([{ key: 'x' + Date.now(), name }]))}
                stockUp={stockUp}
              />
            ) : null}
          </View>
          <View style={s.tabbar}>
            {TABS.map((t) => (
              <TouchableOpacity key={t[0]} style={s.tab} onPress={() => setTab(t[0])}>
                <Text style={[s.tabIcon, tab === t[0] && { color: C.green }]}>{t[1]}</Text>
                <Text style={[s.tabText, tab === t[0] && { color: C.green, fontWeight: '700' }]}>{t[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ---------- Styles ----------
const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.cream, paddingTop: TOP_PAD },
  page: { padding: 18, paddingBottom: 40 },
  brand: { color: C.terracotta, fontWeight: '800', letterSpacing: 3, fontSize: 12, marginBottom: 6 },
  h1: { fontFamily: SERIF, fontSize: 28, color: C.green, marginBottom: 6 },
  h2: { fontSize: 13, fontWeight: '700', color: C.green, letterSpacing: 1, textTransform: 'uppercase', marginTop: 22, marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22, color: C.ink },
  meta: { fontSize: 13, color: C.muted, lineHeight: 18 },
  note: { fontSize: 12, color: C.muted, lineHeight: 17, marginTop: 10, fontStyle: 'italic' },
  label: { fontSize: 12, color: C.muted, marginTop: 12, marginBottom: 4 },
  sourceLink: { fontSize: 13, lineHeight: 18, color: C.terracotta, fontWeight: '700', textDecorationLine: 'underline' },
  link: { color: C.terracotta, fontWeight: '700', fontSize: 13, marginTop: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },

  hero: { backgroundColor: C.green, borderRadius: 22, padding: 18, marginTop: 20 },
  heroTitle: { fontFamily: SERIF, color: C.cream, fontSize: 22 },
  heroPill: { borderWidth: 1, borderColor: 'rgba(244,238,223,0.4)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 3 },
  heroPillText: { color: C.cream, fontSize: 12, fontWeight: '600' },
  heroTile: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 12, marginRight: 8 },
  heroNum: { fontFamily: SERIF, color: C.cream, fontSize: 28 },
  heroLabel: { color: C.sage, fontSize: 12 },
  matchPill: { position: 'absolute', top: 6, left: 6, backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  matchText: { color: C.white, fontSize: 10, fontWeight: '700' },
  feature: { backgroundColor: C.white, borderRadius: 22, marginBottom: 14, overflow: 'hidden' },
  featureImg: { height: 150, alignItems: 'center', justifyContent: 'center' },
  floatPill: { position: 'absolute', top: 10, backgroundColor: C.white, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  floatText: { fontSize: 12, fontWeight: '700', color: C.green },
  mini: { width: 210, backgroundColor: C.white, borderRadius: 16, marginRight: 10, overflow: 'hidden' },
  miniImg: { height: 86, alignItems: 'center', justifyContent: 'center' },
  tile: { flex: 1, backgroundColor: C.white, borderRadius: 14, padding: 12, marginRight: 8, alignItems: 'center' },
  plateRow: { flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  plateVal: { fontSize: 14, fontWeight: '700', color: C.green, lineHeight: 20 },
  tileVal: { fontSize: 16, fontWeight: '700', color: C.green, marginTop: 2 },
  locCard: { flex: 1, borderRadius: 18, padding: 12, marginRight: 8, borderWidth: 2, borderColor: 'transparent', minHeight: 118 },
  locTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: C.green },
  locNum: { fontFamily: SERIF, fontSize: 30, color: C.green },
  expPill: { alignSelf: 'flex-start', backgroundColor: '#F0C9BC', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4 },
  expText: { fontSize: 11, fontWeight: '700', color: C.red },
  heroSub: { color: C.sage, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  statRow: { flexDirection: 'row', backgroundColor: C.white, borderRadius: 16, paddingVertical: 14 },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  statNum: { fontFamily: SERIF, fontSize: 28, color: C.green },

  card: { flexDirection: 'row', backgroundColor: C.white, borderRadius: 16, marginBottom: 10, overflow: 'hidden' },
  cardImg: { width: 84, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 34 },
  cardTitle: { fontFamily: SERIF, fontSize: 18, color: C.green, marginBottom: 2 },
  cover: { height: 170, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  rowText: { fontSize: 15, color: C.ink },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  suggest: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.sage, padding: 12, borderRadius: 10, marginTop: 6 },
  editor: { flexDirection: 'row', paddingBottom: 12 },
  field: { flex: 1, marginRight: 6 },
  fieldWide: { flex: 2, marginRight: 6 },

  panel: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginTop: 12 },
  badge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  badgeText: { color: C.white, fontSize: 12, fontWeight: '700' },
  alert: { backgroundColor: '#F3E1DA', borderRadius: 12, padding: 12, marginTop: 12 },
  alertText: { color: C.red, fontSize: 14, lineHeight: 20 },

  input: { backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.ink, borderWidth: 1, borderColor: C.line },
  qtyInput: { backgroundColor: C.white, borderWidth: 1, borderColor: C.red, borderRadius: 8, width: 48, paddingVertical: 4, textAlign: 'center', color: C.ink },

  btn: { backgroundColor: C.green, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, alignSelf: 'flex-start' },
  btnGhost: { backgroundColor: 'transparent' },
  btnLight: { backgroundColor: C.sage },
  btnAccent: { backgroundColor: C.terracotta },
  btnText: { color: C.white, fontWeight: '700', fontSize: 16 },
  btnTextSmall: { fontSize: 14 },

  chip: { backgroundColor: C.sage, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: C.green },
  chipText: { color: C.green, fontSize: 14, fontWeight: '600' },

  pills: { flexDirection: 'row', backgroundColor: C.sage, borderRadius: 10, padding: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  pillHave: { backgroundColor: C.green },
  pillLow: { backgroundColor: C.terracotta },
  pillOut: { backgroundColor: C.muted },
  pillText: { fontSize: 12, fontWeight: '700', color: C.green },

  thumb: { backgroundColor: C.sage, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  thumbText: { fontSize: 13, fontWeight: '700', color: C.green },

  segment: { flexDirection: 'row', backgroundColor: C.sage, borderRadius: 12, padding: 3, marginVertical: 10 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segOn: { backgroundColor: C.green },
  weekDates: { fontSize: 11, color: C.muted, marginTop: 1 },
  dayDate: { fontFamily: undefined, fontSize: 13, color: C.muted },
  segText: { fontSize: 14, fontWeight: '700', color: C.green },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: C.green, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.green },

  chatHead: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  chatTitle: { fontFamily: SERIF, fontSize: 22, color: C.green },
  bubble: { maxWidth: '88%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: C.green, borderBottomRightRadius: 4 },
  bubbleAI: { alignSelf: 'flex-start', backgroundColor: C.white, borderBottomLeftRadius: 4 },
  composer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, paddingTop: 2 },

  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontSize: 20, color: C.green, fontWeight: '700' },
  stepVal: { marginHorizontal: 12, fontSize: 15, color: C.ink, fontWeight: '600' },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.sage, color: C.green, textAlign: 'center', lineHeight: 26, fontWeight: '700', marginRight: 10, overflow: 'hidden' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: C.cream, borderBottomWidth: 1, borderBottomColor: C.line },
  back: { minWidth: 60 },
  backText: { color: C.green, fontSize: 16, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.green },
  footer: { padding: 14, backgroundColor: C.cream, borderTopWidth: 1, borderTopColor: C.line },

  tabbar: { flexDirection: 'row', backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line, paddingBottom: Platform.OS === 'ios' ? 22 : 6, paddingTop: 6 },
  tab: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 20, color: C.muted },
  tabText: { fontSize: 11, color: C.muted, marginTop: 2 },
});
