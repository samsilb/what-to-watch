// Gemini AI client for generating movie/show recommendations

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function getRecommendations(userInput, options = {}) {
  const { genres = [] } = options;

  const genreText = genres.length > 0
    ? `Focus on these genres: ${genres.join(', ')}.`
    : '';

  const prompt = `You are "LA Cine" - a Los Angeles film expert who ONLY recommends movies and TV shows with a connection to LA. Be friendly and enthusiastic, like recommending movies to a friend.

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
    // Return a Cher-style error message
    const cherErrors = [
      {
        title: 'Ugh, as if!',
        description: "The recommendations are being totally buggin' right now. Try again in a sec?",
      },
      {
        title: 'Whatever!',
        description: "Okay, so like, the movie suggestions are having a major brain fart. Give it another shot!",
      },
      {
        title: "I'm totally buggin'!",
        description: "Something went way wrong. It's like, not my fault though. Try again?",
      },
      {
        title: 'Way harsh, Tai',
        description: "The system is being a full-on Monet right now - looks good from far away but up close it's a mess. Retry!",
      },
    ];
    // Pick a random Cher error
    const randomError = cherErrors[Math.floor(Math.random() * cherErrors.length)];
    return [randomError];
  }
}

