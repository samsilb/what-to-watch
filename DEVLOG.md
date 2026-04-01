# LA Cine - Development Log

## Project Overview
**App Name:** LA Cine
**Purpose:** AI-powered movie and TV recommendation app focused exclusively on LA-connected content
**Tech Stack:** React Native, Expo, Firebase (Auth + Firestore), Gemini AI
**GitHub:** https://github.com/samsilb/what-to-watch

---

## Session 1 - February 16, 2026

### The Vibe
First day of building! Started with a basic template and ended with a fully working app. Broke things, fixed things, changed the theme 5 times, and accidentally tried to upload 22,000 files to GitHub. Classic first day energy.

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

### Lessons Learned (The Fun Stuff)
- **API keys expire and models change** - The Gemini model name we started with was outdated. Tech moves fast! When you see "model not found" errors, it usually means you need a newer version.
- **Rate limits are real** - Hit the "quota exceeded" wall after testing too enthusiastically. Free tiers have limits - pace yourself!
- **node_modules is MASSIVE** - Accidentally committed 22,000+ files to git. Oops. That's why .gitignore exists. Lesson: always ignore node_modules!
- **Themes are subjective** - Tried 5 different color schemes before landing on Neon Noir. Design is about experimenting until it feels right.
- **Firebase setup has multiple steps** - Creating the project is just step one. You also need to enable Firestore AND set security rules. The app doesn't tell you what's missing - you have to figure it out.
- **Building an app is mostly problem-solving** - 80% of the work was fixing things that didn't work the first time. That's normal. That's coding.

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

## Session 2 - March 6, 2026

### The Vibe
Feature day! Added trailers, genre filters, and ratings. Iterated on design - removed things that felt unnecessary (like the "Vibe" personality picker). Learned that sometimes less is more.

### What We Built

1. **Trailer Integration**
   - "Trailer" button on every recommendation card
   - Opens YouTube search for the movie's official trailer
   - Works on both Discover and Favorites views
   - No API key needed - just uses YouTube search

2. **Genre Filters**
   - Horizontal scrolling genre chips (Action, Comedy, Drama, etc.)
   - Tap to select multiple genres
   - Selected genres glow cyan and fill in
   - AI recommendations now filter by selected genres

3. **Ratings System**
   - Thumbs up/down rating on favorites
   - Ratings save to Firestore
   - 👍 glows cyan, 👎 glows pink when selected
   - Track what you loved vs what was just okay

4. **Button Polish**
   - All card buttons now same width
   - Buttons fill in when pressed (satisfying tap feedback)
   - "Saved" button shows "✓ Saved" with white text on pink

5. **Security Improvement**
   - Moved Gemini API key to environment variable
   - No more hardcoded secrets in the codebase

### What We Tried & Removed
- **"Surprise Me" button** - Built it, but felt unnecessary. Removed.
- **AI Personality Picker** - Cool idea (Casual/Film Nerd/Snarky), but cluttered the UI. Removed.
- **"Vibe" and "Genres" labels** - The buttons are self-explanatory. Cleaner without labels.

### Lessons Learned
- **Iterate and remove** - Not every feature improves the app. It's okay to build something and then remove it.
- **Rate limits strike again** - Hit the Gemini quota while testing. The `-c` flag on `npx expo start -c` clears cache when things get stuck.
- **Press states matter** - Adding fill-on-press feedback makes buttons feel more responsive and polished.

### Commits Made
1. `Add trailer button with YouTube integration`
2. `Add genre filters, ratings, and UI polish`

### Files Modified
- `src/lib/aiClient.js` - Genre filtering, env variable for API key
- `src/lib/favorites.js` - Rating function
- `src/screens/RecommendationsScreen.js` - Trailers, genres, ratings, button polish

---

## Session 3 - March 16, 2026

### The Vibe
Major glow-up! Transformed the app from "cool side project" to "wait, is this a real streaming service?" Added real movie posters, cinematic fonts, and replaced Cher with The Dude. The app finally looks like it belongs on the App Store.

### What We Built

1. **Netflix-Style Streaming Redesign**
   - Hero banner with featured movie at the top
   - Horizontal scrolling carousels for each category
   - Movie poster cards with ratings and year badges
   - Dark theme with cinematic red accent (#e50914)
   - "My List" section for saved favorites

2. **TMDB API Integration**
   - Real movie posters from The Movie Database API
   - Actual ratings, release years, and plot summaries
   - Backdrop images for hero section and detail modal
   - Free API key from themoviedb.org

3. **Detail Modal**
   - Tap any movie to see full details (instead of going straight to trailer)
   - Large backdrop image
   - Title, year, rating, description
   - "Watch Trailer" and "Add to My List" buttons
   - Much more like a real streaming app experience

4. **Cinematic Typography**
   - Bebas Neue font for headings (big, bold, movie poster style)
   - Oswald font for UI text and buttons
   - Feels like a legit film app now

5. **Big Lebowski Theme**
   - Replaced Cher/Clueless quotes with The Dude
   - Loading phrases: "The Dude abides...", "That rug really tied the room together."
   - Save confirmation: "Far out." / "[Movie] is on your list, man."
   - Remove prompt: "This will not stand, man"
   - Error messages: "That's a bummer, man"

6. **Fixed Genre Filters**
   - Tapping a genre now triggers an immediate search
   - Can combine multiple genres
   - Deselecting all genres returns to home view

### What We Changed Our Mind On
- **Cher from Clueless** - Cute idea, but The Big Lebowski fits better for an LA movie app. More iconic, more quotable, more chill.
- **Too many Dude quotes** - Started with 16 loading phrases, trimmed to 3 classics. Less is more.

### Lessons Learned
- **Real posters make a huge difference** - The app went from "prototype" to "polished" just by adding actual movie artwork.
- **Fonts matter** - Bebas Neue gives instant "cinema" vibes. Typography is half the design.
- **Modals improve UX** - Going straight to YouTube felt jarring. The detail modal creates a better flow.
- **Theme consistency is key** - Once we committed to Lebowski, updating all the alerts/errors made the whole experience feel cohesive.

### Commits Made
1. `Redesign app as Netflix-style streaming UI with Big Lebowski theme`

### Files Modified/Created
- `App.js` - Font loading, themed loading screen
- `src/theme/colors.js` - New color palette + font definitions
- `src/lib/tmdb.js` - NEW: TMDB API client for posters
- `src/lib/aiClient.js` - Lebowski error messages
- `src/screens/RecommendationsScreen.js` - Complete redesign
- `src/screens/SignInScreen.js` - New fonts and styling
- `CLAUDE.md` - Updated theme documentation
- `package.json` - Added expo-font and Google Fonts packages

---

## Session 4 - April 1, 2026

### The Vibe
Theme switch! Swapped out The Big Lebowski for Clueless. The app now has major 90s Beverly Hills energy with hot pink and yellow accents. Cher Horowitz is officially our spirit guide.

### What We Changed

1. **Clueless Color Scheme**
   - Dark burgundy background (#1a0a14) instead of pure black
   - Hot pink primary accent (#ff69b4) - very Cher
   - Yellow secondary accent (#ffeb3b) - from her iconic plaid outfit
   - Pink-tinted secondary text (#e8b4d4) for that 90s glam vibe

2. **Cher Loading Phrases**
   - "As if!"
   - "Ugh, I was like, totally buggin'..."
   - "Whatever!"
   - "I totally paused!"
   - "Searching for a boy in high school is as useless as searching for meaning in a Pauly Shore movie."
   - "You see how picky I am about my shoes, and they only go on my feet."

3. **Clueless-Style Alerts**
   - Save success: "Totally!" / "[Movie] is on your list. As if you'd forget!"
   - Save error: "Ugh, as if!"
   - Remove prompt: "Wait, are you sure?" / "That would be way harsh."

### Why the Switch
Clueless is THE iconic LA movie - set in Beverly Hills, all about the entertainment industry lifestyle, and has some of the most quotable lines ever. Plus it's a fun contrast to have a girly 90s aesthetic for a movie app. The Dude was cool, but Cher is iconic.

### Commits Made
1. `Switch theme from Big Lebowski to Clueless - Cher vibes`

### Files Modified
- `src/theme/colors.js` - New pink/yellow color palette
- `src/screens/RecommendationsScreen.js` - Cher quotes and themed alerts
- `CLAUDE.md` - Updated theme documentation

---

## Ideas for Future Sessions

### Stretch Features (Competition Differentiators)
- [x] ~~"Surprise Me" random recommendation button~~ (tried, removed)
- [x] ~~AI personality options~~ (tried, removed - cluttered UI)
- [x] Filters (genre) ✅
- [ ] Shareable recommendation cards
- [ ] Viewing history tracker
- [x] Rate recommendations ✅
- [ ] Social features (see what friends are watching)

### Polish
- [x] Add animations/transitions ✅ (loading phrase fade, press states)
- [ ] Loading skeletons
- [ ] Pull to refresh
- [x] Better error handling UI ✅ (Lebowski-themed errors)
- [ ] App icon and splash screen
- [x] Real movie posters ✅ (TMDB integration)
- [x] Custom fonts ✅ (Bebas Neue + Oswald)
- [x] Detail modal for movies ✅

---

## How to Run the App
1. Open Terminal
2. `cd ~/claudeprojects/what-to-watch`
3. `npx expo start`
4. Scan QR code with Expo Go app on your phone

## API Keys Location
- **Gemini:** `.env` (EXPO_PUBLIC_GOOGLE_API_KEY)
- **TMDB:** `.env` (EXPO_PUBLIC_TMDB_API_KEY)
- **Firebase:** `src/config/firebase.js` (lines 6-12)
