# LA Cine - Development Log

## Project Overview
**App Name:** LA Cine
**Purpose:** AI-powered movie and TV recommendation app focused exclusively on LA-connected content
**Tech Stack:** React Native, Expo, Firebase (Auth + Firestore), Gemini AI
**GitHub:** https://github.com/samsilb/what-to-watch

---

## Session 1 - February 16, 2026

### What We Built
1. **Core App Features (Already existed)**
   - User authentication (email/password via Firebase)
   - AI-powered recommendations via Gemini API
   - Navigation between screens

2. **Fixed Gemini Integration**
   - Updated model from `gemini-1.5-flash-latest` to `gemini-2.0-flash`
   - Added user's own Gemini API key

3. **Added Save Favorites Feature**
   - Save button on each recommendation
   - Firestore database integration
   - "Discover" and "Favorites" tabs
   - Remove favorites functionality
   - Data persists across sessions

4. **LA Cine Branding**
   - Renamed app from "What to Watch" to "LA Cine"
   - Added tagline: "Movies & TV set in the City of Angels"
   - AI now only recommends LA-connected content (set in LA, filmed in LA, about Hollywood, etc.)
   - Updated prompts and placeholder text

5. **Neon Noir Theme**
   - Deep purple-black background (#0a0a12)
   - Electric cyan titles with glow effect (#00f0ff)
   - Hot pink accent buttons with neon glow (#ff2e97)
   - Purple borders and accents (#9d4edd)
   - Uppercase text with letter spacing (noir typography)
   - Sharp corners throughout

### Commits Made
1. `Add complete What to Watch app with AI recommendations and favorites`
2. `Rebrand to LA Cine - LA-focused movie recommendations`
3. `Add Neon Noir theme - neon colors with elegant typography`

### Files Modified
- `src/lib/aiClient.js` - Gemini integration and LA-focused prompts
- `src/lib/favorites.js` - New file for Firestore favorites
- `src/config/firebase.js` - Added Firestore
- `src/screens/SignInScreen.js` - LA Cine branding + Neon Noir theme
- `src/screens/RecommendationsScreen.js` - Favorites feature + Neon Noir theme
- `App.js` - Theme colors
- `CLAUDE.md` - Project notes for AI assistant
- `.gitignore` - Fixed to exclude node_modules

---

## Ideas for Future Sessions

### Stretch Features (Competition Differentiators)
- [ ] "Surprise Me" random recommendation button
- [ ] AI personality options (snarky critic, enthusiastic friend, film professor)
- [ ] Filters (genre, decade, streaming platform, mood)
- [ ] Shareable recommendation cards
- [ ] Viewing history tracker
- [ ] Rate recommendations to improve future suggestions
- [ ] Social features (see what friends are watching)

### Polish
- [ ] Add animations/transitions
- [ ] Loading skeletons
- [ ] Pull to refresh
- [ ] Better error handling UI
- [ ] App icon and splash screen

---

## How to Run the App
1. Open Terminal
2. `cd ~/claudeprojects/what-to-watch`
3. `npx expo start`
4. Scan QR code with Expo Go app on your phone

## API Keys Location
- **Gemini:** `src/lib/aiClient.js` (line 3)
- **Firebase:** `src/config/firebase.js` (lines 6-12)
