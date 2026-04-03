import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../lib/aiClient';
import { fetchContentDetails } from '../lib/tmdb';
import { saveFavorite, getFavorites, removeFavorite, rateFavorite } from '../lib/favorites';
import { colors, fonts } from '../theme/colors';

// Cache settings
const CACHE_KEY = 'la_cine_recommendations';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;

// Cher loading phrases - totally Clueless
const CHER_LOADING_PHRASES = [
  "As if!",
  "Ugh, I was like, totally buggin'...",
  "Whatever!",
  "I totally paused!",
  "Searching for a boy in high school is as useless as searching for meaning in a Pauly Shore movie.",
  "You see how picky I am about my shoes, and they only go on my feet.",
];

// Fallback poster image
const FALLBACK_POSTER = 'https://via.placeholder.com/342x513/181818/666666?text=No+Poster';

const CATEGORIES = [
  { id: 'foryou', title: 'For You', query: 'personalized picks based on LA vibes' },
  { id: 'trending', title: 'Trending in LA', query: 'popular movies and shows set in Los Angeles' },
  { id: 'classics', title: 'LA Classics', query: 'classic films that define Los Angeles' },
  { id: 'indie', title: 'Hidden Gems', query: 'indie films and underrated shows set in LA' },
  { id: 'hollywood', title: 'Hollywood Stories', query: 'movies about the entertainment industry' },
];

const GENRES = ['Action', 'Comedy', 'Drama', 'Thriller', 'Romance', 'Sci-Fi', 'Horror'];

export default function RecommendationsScreen() {
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categoryContent, setCategoryContent] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [featuredItem, setFeaturedItem] = useState(null);
  const [loadingPhrase, setLoadingPhrase] = useState(CHER_LOADING_PHRASES[0]);

  // Detail modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Animated value for loading phrase
  const phraseOpacity = useRef(new Animated.Value(1)).current;

  // Rotate through Cher phrases while loading
  useEffect(() => {
    let interval;
    if (loadingCategories || loading) {
      interval = setInterval(() => {
        // Fade out
        Animated.timing(phraseOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Change phrase
          setLoadingPhrase(
            CHER_LOADING_PHRASES[Math.floor(Math.random() * CHER_LOADING_PHRASES.length)]
          );
          // Fade in
          Animated.timing(phraseOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loadingCategories, loading]);

  useEffect(() => {
    loadFavorites();
    loadCategoryContent();
  }, []);

  const loadFavorites = async () => {
    const result = await getFavorites(user.uid);
    if (result.success) {
      // Fetch posters for favorites
      const favoritesWithPosters = await Promise.all(
        result.favorites.map(async (fav) => {
          const tmdbData = await fetchContentDetails(fav.title);
          return {
            ...fav,
            poster: tmdbData.poster || FALLBACK_POSTER,
            backdrop: tmdbData.backdrop,
            year: tmdbData.year,
            tmdbRating: tmdbData.rating,
            overview: tmdbData.overview,
            watchProviders: tmdbData.watchProviders,
          };
        })
      );
      setFavorites(favoritesWithPosters);
    }
  };

  const loadCategoryContent = async (forceRefresh = false) => {
    setLoadingCategories(true);
    try {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const { content, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;

          if (!isExpired && content) {
            console.log('Using cached recommendations');
            setCategoryContent(content);
            if (content[CATEGORIES[0].id]?.length > 0) {
              setFeaturedItem(content[CATEGORIES[0].id][0]);
            }
            setLoadingCategories(false);
            return;
          }
        }
      }

      // Load all categories from API
      console.log('Fetching fresh recommendations from API');
      const content = {};
      for (const cat of CATEGORIES) {
        const recs = await getRecommendations(cat.query, { genres: [] });

        // Fetch TMDB data for each recommendation
        const recsWithPosters = await Promise.all(
          recs.map(async (item) => {
            const tmdbData = await fetchContentDetails(item.title);
            return {
              ...item,
              poster: tmdbData.poster || FALLBACK_POSTER,
              backdrop: tmdbData.backdrop,
              year: tmdbData.year,
              rating: tmdbData.rating,
              overview: tmdbData.overview,
              watchProviders: tmdbData.watchProviders,
            };
          })
        );

        content[cat.id] = recsWithPosters;
      }

      // Save to cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        content,
        timestamp: Date.now(),
      }));

      // Set featured item from first category
      if (content[CATEGORIES[0].id]?.length > 0) {
        setFeaturedItem(content[CATEGORIES[0].id][0]);
      }

      setCategoryContent(content);
    } catch (e) {
      console.log('Error loading categories:', e);
      // Try to use stale cache if API fails
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { content } = JSON.parse(cached);
        if (content) {
          console.log('API failed, using stale cache');
          setCategoryContent(content);
          if (content[CATEGORIES[0].id]?.length > 0) {
            setFeaturedItem(content[CATEGORIES[0].id][0]);
          }
        }
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle genre selection - triggers search immediately
  const handleGenreSelect = async (genre) => {
    const newSelected = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];

    setSelectedGenres(newSelected);

    // If at least one genre is selected, trigger search
    if (newSelected.length > 0) {
      setLoading(true);
      setShowSearch(true);
      try {
        const searchQuery = query.trim() || `${newSelected.join(' or ')} movies and shows`;
        const recs = await getRecommendations(searchQuery, { genres: newSelected });

        // Fetch TMDB data for search results
        const recsWithPosters = await Promise.all(
          recs.map(async (item) => {
            const tmdbData = await fetchContentDetails(item.title);
            return {
              ...item,
              poster: tmdbData.poster || FALLBACK_POSTER,
              backdrop: tmdbData.backdrop,
              year: tmdbData.year,
              rating: tmdbData.rating,
              overview: tmdbData.overview,
              watchProviders: tmdbData.watchProviders,
            };
          })
        );

        setSearchResults(recsWithPosters);
      } catch (e) {
        setSearchResults([{ title: 'Error', description: e.message }]);
      } finally {
        setLoading(false);
      }
    } else {
      // No genres selected, go back to home
      setShowSearch(false);
      setSearchResults([]);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() && selectedGenres.length === 0) return;
    setLoading(true);
    setShowSearch(true);
    try {
      const searchQuery = query.trim() || `${selectedGenres.join(' or ')} movies and shows`;
      const recs = await getRecommendations(searchQuery, { genres: selectedGenres });

      // Fetch TMDB data for search results
      const recsWithPosters = await Promise.all(
        recs.map(async (item) => {
          const tmdbData = await fetchContentDetails(item.title);
          return {
            ...item,
            poster: tmdbData.poster || FALLBACK_POSTER,
            backdrop: tmdbData.backdrop,
            year: tmdbData.year,
            rating: tmdbData.rating,
            overview: tmdbData.overview,
          };
        })
      );

      setSearchResults(recsWithPosters);
    } catch (e) {
      setSearchResults([{ title: 'Error', description: e.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item) => {
    setSavingId(item.title);
    const result = await saveFavorite(user.uid, item);
    if (result.success) {
      Alert.alert('Totally!', "Added to your favorites. As if you'd forget!");
      loadFavorites();
    } else {
      Alert.alert("Ugh, as if!", 'Couldn\'t save. Try again!');
    }
    setSavingId(null);
  };

  const handleRemove = async (favoriteId, title) => {
    Alert.alert(
      'Wait, are you sure?',
      `Remove "${cleanTitle(title)}" from your list? That would be way harsh.`,
      [
        { text: 'Nevermind', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(favoriteId);
            loadFavorites();
            setShowDetailModal(false);
          },
        },
      ]
    );
  };

  const handleRate = async (favoriteId, rating) => {
    await rateFavorite(favoriteId, rating);
    loadFavorites();
  };

  const isAlreadySaved = (title) => {
    return favorites.some((fav) => fav.title === title);
  };

  const getFavoriteId = (title) => {
    const fav = favorites.find((f) => f.title === title);
    return fav?.id;
  };

  const cleanTitle = (title) => {
    return title.replace(/^(Movie|TV Show|TV):\s*/i, '').trim();
  };

  const openTrailer = (title) => {
    const searchQuery = encodeURIComponent(`${cleanTitle(title)} official trailer`);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    Linking.openURL(youtubeUrl);
  };

  const openItemDetail = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const clearSearch = () => {
    setShowSearch(false);
    setQuery('');
    setSearchResults([]);
    setSelectedGenres([]);
  };

  // Loading Component with Cher phrases
  const CherLoading = ({ size = 'large' }) => (
    <View style={styles.cherLoadingContainer}>
      <ActivityIndicator size={size} color={colors.primary} />
      <Animated.Text style={[styles.cherLoadingText, { opacity: phraseOpacity }]}>
        {loadingPhrase}
      </Animated.Text>
    </View>
  );

  // Detail Modal Component
  const DetailModal = () => {
    if (!selectedItem) return null;

    const isSaved = isAlreadySaved(selectedItem.title);
    const favoriteId = getFavoriteId(selectedItem.title);

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Backdrop/Poster Image */}
            <Image
              source={{ uri: selectedItem.backdrop || selectedItem.poster || FALLBACK_POSTER }}
              style={styles.modalImage}
              resizeMode="cover"
            />
            <View style={styles.modalImageOverlay} />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.modalCloseText}>X</Text>
            </TouchableOpacity>

            {/* Content */}
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>{cleanTitle(selectedItem.title)}</Text>

              <View style={styles.modalMeta}>
                {selectedItem.year && (
                  <Text style={styles.modalYear}>{selectedItem.year}</Text>
                )}
                {selectedItem.rating && (
                  <View style={styles.modalRatingBadge}>
                    <Text style={styles.modalRatingText}>{selectedItem.rating}</Text>
                  </View>
                )}
              </View>

              {(selectedItem.description || selectedItem.overview) && (
                <Text style={styles.modalDescription}>
                  {selectedItem.description || selectedItem.overview}
                </Text>
              )}

              {/* Where to Watch */}
              {selectedItem.watchProviders && selectedItem.watchProviders.length > 0 && (
                <View style={styles.watchProvidersSection}>
                  <Text style={styles.watchProvidersLabel}>Where to Watch</Text>
                  <View style={styles.watchProvidersList}>
                    {selectedItem.watchProviders.map((provider) => (
                      <View key={provider.id} style={styles.watchProviderItem}>
                        <Image
                          source={{ uri: provider.logo }}
                          style={styles.watchProviderLogo}
                        />
                        <Text style={styles.watchProviderName} numberOfLines={1}>
                          {provider.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalPlayButton}
                  onPress={() => {
                    openTrailer(selectedItem.title);
                    setShowDetailModal(false);
                  }}
                >
                  <Text style={styles.modalPlayButtonText}>Watch Trailer</Text>
                </TouchableOpacity>

                {isSaved ? (
                  <TouchableOpacity
                    style={styles.modalSecondaryButton}
                    onPress={() => handleRemove(favoriteId, selectedItem.title)}
                  >
                    <Text style={styles.modalSecondaryButtonText}>Remove from List</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.modalSecondaryButton}
                    onPress={() => {
                      handleSave(selectedItem);
                      setShowDetailModal(false);
                    }}
                    disabled={savingId === selectedItem.title}
                  >
                    {savingId === selectedItem.title ? (
                      <ActivityIndicator color={colors.text} size="small" />
                    ) : (
                      <Text style={styles.modalSecondaryButtonText}>+ Add to My List</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Movie/TV Card Component
  const ContentCard = ({ item, index, showActions = true }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => openItemDetail(item)}
    >
      <Image
        source={{ uri: item.poster || FALLBACK_POSTER }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      {item.rating && (
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingBadgeText}>{item.rating}</Text>
        </View>
      )}
    </Pressable>
  );

  // Category Row Component
  const CategoryRow = ({ category }) => {
    const items = categoryContent[category.id] || [];

    if (items.length === 0) return null;

    return (
      <View style={styles.categoryRow}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <FlatList
          horizontal
          data={items}
          keyExtractor={(item, idx) => `${category.id}-${idx}`}
          renderItem={({ item, index }) => (
            <ContentCard item={item} index={index} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>
    );
  };

  // Favorites view
  if (showFavorites) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <DetailModal />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowFavorites(false)}>
            <Text style={styles.backButton}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My List</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <Pressable
              style={styles.favoriteCard}
              onPress={() => openItemDetail(item)}
            >
              <Image
                source={{ uri: item.poster || FALLBACK_POSTER }}
                style={styles.favoriteImage}
                resizeMode="cover"
              />
            </Pressable>
          )}
          contentContainerStyle={styles.favoritesGrid}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Your list is empty</Text>
              <Text style={styles.emptySubtext}>
                Tap on any title to see details and add it to your list
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  // Search results view
  if (showSearch) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <DetailModal />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={clearSearch}>
            <Text style={styles.backButton}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedGenres.length > 0 ? selectedGenres.join(', ') : 'Search Results'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <CherLoading />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <Pressable
                style={styles.searchResultItem}
                onPress={() => openItemDetail(item)}
              >
                <Image
                  source={{ uri: item.poster || FALLBACK_POSTER }}
                  style={styles.searchResultImage}
                  resizeMode="cover"
                />
                <View style={styles.searchResultContent}>
                  <Text style={styles.searchResultTitle}>{cleanTitle(item.title)}</Text>
                  {item.year && (
                    <Text style={styles.searchResultYear}>{item.year}</Text>
                  )}
                  {item.description && (
                    <Text style={styles.searchResultDesc} numberOfLines={3}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </Pressable>
            )}
            contentContainerStyle={styles.searchResultsList}
          />
        )}
      </View>
    );
  }

  // Main home view
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <DetailModal />

      {loadingCategories ? (
        <View style={styles.fullScreenLoading}>
          <Text style={styles.loadingLogo}>LA CINE</Text>
          <CherLoading />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          {featuredItem && (
            <Pressable
              style={styles.hero}
              onPress={() => openItemDetail(featuredItem)}
            >
              <Image
                source={{ uri: featuredItem.backdrop || featuredItem.poster || FALLBACK_POSTER }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroGradient}>
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>
                    {cleanTitle(featuredItem.title)}
                  </Text>
                  {featuredItem.year && (
                    <Text style={styles.heroYear}>{featuredItem.year}</Text>
                  )}
                  {featuredItem.description && (
                    <Text style={styles.heroDescription} numberOfLines={2}>
                      {featuredItem.description}
                    </Text>
                  )}
                  <View style={styles.heroButtons}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => openTrailer(featuredItem.title)}
                    >
                      <Text style={styles.playButtonText}>Watch Trailer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.listButton}
                      onPress={() => handleSave(featuredItem)}
                    >
                      <Text style={styles.listButtonText}>+ My List</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Pressable>
          )}

          {/* Floating Header */}
          <View style={styles.floatingHeader}>
            <Text style={styles.logo}>LA CINE</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowFavorites(true)}
              >
                <Text style={styles.headerButtonText}>My List</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={signOut}
              >
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search LA movies & shows..."
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {loading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <TouchableOpacity onPress={handleSearch}>
                  <Text style={styles.searchIcon}>Search</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Genre Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.genreRow}
            >
              {GENRES.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genrePill,
                    selectedGenres.includes(genre) && styles.genrePillActive,
                  ]}
                  onPress={() => handleGenreSelect(genre)}
                >
                  <Text
                    style={[
                      styles.genrePillText,
                      selectedGenres.includes(genre) && styles.genrePillTextActive,
                    ]}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category Rows */}
          {CATEGORIES.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}

          {/* Favorites Row */}
          {favorites.length > 0 && (
            <View style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>My List</Text>
                <TouchableOpacity onPress={() => setShowFavorites(true)}>
                  <Text style={styles.seeAllButton}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={favorites.slice(0, 10)}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <ContentCard
                    item={item}
                    index={index}
                    showActions={false}
                  />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              />
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },

  // Full screen loading
  fullScreenLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    fontFamily: fonts.heading,
    fontSize: 48,
    color: colors.primary,
    letterSpacing: 6,
    marginBottom: 40,
  },

  // Cher Loading
  cherLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  cherLoadingText: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  logo: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.primary,
    letterSpacing: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },

  // Hero
  hero: {
    height: 500,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(12,12,12,0.7)',
  },
  heroTitle: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.text,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroYear: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    backgroundColor: colors.text,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButtonText: {
    fontFamily: fonts.medium,
    color: colors.background,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  listButtonText: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  searchIcon: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  genreRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  genrePill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  genrePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genrePillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  genrePillTextActive: {
    color: colors.text,
  },

  // Category Rows
  categoryRow: {
    marginTop: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.text,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllButton: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 10,
  },

  // Content Cards
  card: {
    width: CARD_WIDTH,
    marginRight: 10,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  ratingBadgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
  },
  yearBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  yearBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '500',
  },
  savedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  savedBadgeText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '600',
  },

  // Detail Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.85,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 250,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.text,
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalYear: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalRatingBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  modalRatingText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  modalDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  watchProvidersSection: {
    marginBottom: 20,
  },
  watchProvidersLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  watchProvidersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  watchProviderItem: {
    alignItems: 'center',
    width: 60,
  },
  watchProviderLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  watchProviderName: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  modalButtons: {
    gap: 12,
  },
  modalPlayButton: {
    backgroundColor: colors.text,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalPlayButtonText: {
    fontFamily: fonts.medium,
    color: colors.background,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalSecondaryButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Search Results
  searchResultsList: {
    padding: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  searchResultImage: {
    width: 100,
    height: 150,
  },
  searchResultContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  searchResultYear: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  searchResultDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Favorites Grid
  favoritesGrid: {
    padding: 16,
  },
  favoriteCard: {
    width: (SCREEN_WIDTH - 48) / 3,
    marginRight: 8,
    marginBottom: 16,
  },
  favoriteImage: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },

  // Header for sub-screens
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  backButton: {
    color: colors.text,
    fontSize: 16,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    color: colors.text,
    fontSize: 24,
    letterSpacing: 1,
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    color: colors.text,
    fontSize: 28,
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 40,
  },
});
