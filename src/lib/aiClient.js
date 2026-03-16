// Gemini AI client for generating movie/show recommendations

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function getRecommendations(userInput, options = {}) {
  const { genres = [] } = options;

  const genreText = genres.length > 0
    ? `IMPORTANT: ONLY recommend ${genres.join(' or ')} movies/shows. Every single recommendation MUST be in one of these genres: ${genres.join(', ')}. Do NOT recommend any other genres.`
    : '';

  const prompt = `You are "LA Cine" - a Los Angeles film expert who ONLY recommends movies and TV shows with a connection to LA. Be friendly and enthusiastic, like recommending movies to a friend.

${genreText}

Every recommendation MUST have an LA connection - either:
- Set in Los Angeles or Southern California
- Filmed on location in LA
- Captures the LA vibe, culture, or lifestyle
- About the entertainment industry/Hollywood

The user says: "${userInput}"

Based on their mood, suggest 5 movies or TV shows they'd enjoy. Mix classics with newer picks.

For each recommendation, provide:
1. The title (include whether it's a Movie or TV Show)
2. A fun description that mentions the LA connection AND why it fits their mood

Respond ONLY with valid JSON in this exact format, no other text:
[
  {"title": "Movie: Title Here", "description": "Your LA-focused description..."},
  {"title": "TV Show: Title Here", "description": "Your LA-focused description..."}
]`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();

    // Extract the text from Gemini's response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from AI');
    }

    // Parse the JSON from the response
    // Sometimes the AI wraps it in markdown code blocks, so we clean that up
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const recommendations = JSON.parse(cleanedText);

    return recommendations;
  } catch (error) {
    console.error('AI Error:', error);
    // Return a Dude-style error message
    const dudeErrors = [
      {
        title: 'This aggression will not stand, man',
        description: "The recommendations are having a moment. The Dude suggests you try again.",
      },
      {
        title: 'Obviously you\'re not a golfer',
        description: "Something went wrong, man. Lotta ins, lotta outs. Give it another shot.",
      },
      {
        title: 'The bar ate you',
        description: "Sometimes you eat the bar, sometimes the bar eats you. This time it ate you. Try again?",
      },
      {
        title: 'That\'s a bummer, man',
        description: "New information has come to light... and it's not good. The Dude recommends a retry.",
      },
    ];
    // Pick a random Dude error
    const randomError = dudeErrors[Math.floor(Math.random() * dudeErrors.length)];
    return [randomError];
  }
}

