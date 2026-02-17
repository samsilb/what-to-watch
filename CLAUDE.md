# LA Cine - Project Notes

## Quick Context
This is an AI-powered movie/TV recommendation app for a Hack Month challenge. The user is a first-time coder who needs step-by-step guidance. All recommendations are LA-themed (set in LA, filmed in LA, about Hollywood, etc.).

## Current Status: WORKING APP
All core challenge requirements are complete:
- [x] User authentication (Firebase email/password)
- [x] AI recommendations (Gemini API)
- [x] Preference input
- [x] Save favorites (Firestore)
- [x] Code on GitHub

## Tech Stack
- React Native + Expo Go
- Firebase Auth + Firestore
- Gemini AI (model: gemini-2.0-flash)
- GitHub: https://github.com/samsilb/what-to-watch

## Current Theme: Neon Noir
- Background: #0a0a12 (deep purple-black)
- Primary accent: #ff2e97 (hot pink)
- Titles: #00f0ff (electric cyan)
- Borders: #9d4edd (purple)
- Typography: Uppercase, letter-spaced, sharp corners

## Key Files
- `src/lib/aiClient.js` - Gemini API + LA-focused prompts
- `src/lib/favorites.js` - Save/load favorites from Firestore
- `src/screens/RecommendationsScreen.js` - Main app screen
- `src/screens/SignInScreen.js` - Login/signup
- `DEVLOG.md` - Full development history (UPDATE THIS ON EACH COMMIT)

## Important Notes
- User's Gemini API key is in aiClient.js
- Firebase project: movie-rec-hack
- App only needs to work on iOS OR Android (not both)
- Keep explanations simple - user is learning

## Next Session Ideas
See DEVLOG.md for full list of stretch features
