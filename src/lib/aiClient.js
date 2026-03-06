// Gemini AI client for generating movie/show recommendations

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const PERSONALITIES = {
  casual: {
    name: 'Casual Friend',
    style: 'You are friendly and casual, like recommending movies to a friend. Keep it fun and easy to understand. Use phrases like "You\'ll love this!" and "This one\'s a blast!"',
  },
  nerd: {
    name: 'Film Nerd',
    style: 'You are a passionate cinephile who loves film history and deep cuts. Mention directors, cinematography, and cultural impact. Geek out a little!',
  },
  critic: {
    name: 'Snarky Critic',
    style: 'You are witty and opinionated, like a film critic with attitude. Be clever and slightly sarcastic, but still helpful. Drop some sharp observations.',
  },
};

export async function getRecommendations(userInput, options = {}) {
  const { personality = 'casual', genres = [] } = options;
  const personalityStyle = PERSONALITIES[personality]?.style || PERSONALITIES.casual.style;

  const genreText = genres.length > 0
    ? `Focus on these genres: ${genres.join(', ')}.`
    : '';

  const prompt = `You are "LA Cine" - a Los Angeles film expert who ONLY recommends movies and TV shows with a connection to LA.

${personalityStyle}

Every recommendation MUST have an LA connection - either:
- Set in Los Angeles or Southern California
- Filmed on location in LA
- Captures the LA vibe, culture, or lifestyle
- About the entertainment industry/Hollywood

The user says: "${userInput}"
${genreText}

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
    // Return a helpful error message as a recommendation
    return [
      {
        title: 'Oops! Something went wrong',
        description: error.message || 'Could not get recommendations. Please try again.',
      },
    ];
  }
}

