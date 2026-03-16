// TMDB API client for fetching movie/TV posters and metadata

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Image sizes: w92, w154, w185, w342, w500, w780, original
export const posterSizes = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
  original: 'original',
};

export const backdropSizes = {
  small: 'w300',
  medium: 'w780',
  large: 'w1280',
  original: 'original',
};

// Get full poster URL from path
export function getPosterUrl(posterPath, size = 'medium') {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}/${posterSizes[size]}${posterPath}`;
}

// Get full backdrop URL from path
export function getBackdropUrl(backdropPath, size = 'medium') {
  if (!backdropPath) return null;
  return `${TMDB_IMAGE_BASE}/${backdropSizes[size]}${backdropPath}`;
}

// Search for a movie or TV show by title
export async function searchContent(title, type = 'multi') {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not configured');
    return null;
  }

  // Clean up the title - remove "Movie: " or "TV Show: " prefix
  const cleanTitle = title
    .replace(/^(Movie|TV Show|TV):\s*/i, '')
    .trim();

  try {
    const endpoint = type === 'multi' ? 'search/multi' : `search/${type}`;
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&include_adult=false`
    );

    if (!response.ok) {
      throw new Error('TMDB API request failed');
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Return the first result that has a poster
      const withPoster = data.results.find(r => r.poster_path);
      return withPoster || data.results[0];
    }

    return null;
  } catch (error) {
    console.error('TMDB search error:', error);
    return null;
  }
}

// Fetch poster and metadata for a single title
export async function fetchContentDetails(title) {
  const result = await searchContent(title);

  if (!result) {
    return {
      poster: null,
      backdrop: null,
      year: null,
      rating: null,
      overview: null,
    };
  }

  const isTV = result.media_type === 'tv' || result.first_air_date;

  return {
    tmdbId: result.id,
    mediaType: isTV ? 'tv' : 'movie',
    poster: getPosterUrl(result.poster_path, 'medium'),
    posterLarge: getPosterUrl(result.poster_path, 'large'),
    backdrop: getBackdropUrl(result.backdrop_path, 'large'),
    year: (result.release_date || result.first_air_date || '').split('-')[0],
    rating: result.vote_average ? result.vote_average.toFixed(1) : null,
    overview: result.overview,
    popularity: result.popularity,
  };
}

// Fetch details for multiple titles in parallel
export async function fetchMultipleContentDetails(titles) {
  const results = await Promise.all(
    titles.map(async (title) => {
      const details = await fetchContentDetails(title);
      return { title, ...details };
    })
  );
  return results;
}

// Get trending content
export async function getTrending(mediaType = 'all', timeWindow = 'week') {
  if (!TMDB_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('TMDB trending request failed');
    }

    const data = await response.json();

    return data.results.map((item) => ({
      tmdbId: item.id,
      title: item.title || item.name,
      mediaType: item.media_type || mediaType,
      poster: getPosterUrl(item.poster_path, 'medium'),
      backdrop: getBackdropUrl(item.backdrop_path, 'large'),
      year: (item.release_date || item.first_air_date || '').split('-')[0],
      rating: item.vote_average ? item.vote_average.toFixed(1) : null,
      overview: item.overview,
    }));
  } catch (error) {
    console.error('TMDB trending error:', error);
    return [];
  }
}
