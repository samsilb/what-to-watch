import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../lib/aiClient';
import { saveFavorite, getFavorites, removeFavorite } from '../lib/favorites';

export default function RecommendationsScreen() {
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [savingId, setSavingId] = useState(null);

  // Load favorites when screen opens
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const result = await getFavorites(user.uid);
    if (result.success) {
      setFavorites(result.favorites);
    }
  };

  const handleGet = async () => {
    setLoading(true);
    try {
      const recs = await getRecommendations(query || 'something light and fun');
      setItems(recs);
      setShowFavorites(false);
    } catch (e) {
      setItems([{ title: 'Error', description: e.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item, index) => {
    setSavingId(index);
    const result = await saveFavorite(user.uid, item);
    if (result.success) {
      Alert.alert('Saved!', `"${item.title}" added to your favorites.`);
      loadFavorites(); // Refresh favorites list
    } else {
      Alert.alert('Error', 'Could not save. Please try again.');
    }
    setSavingId(null);
  };

  const handleRemove = async (favoriteId, title) => {
    Alert.alert(
      'Remove Favorite',
      `Remove "${title}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(favoriteId);
            loadFavorites();
          },
        },
      ]
    );
  };

  const isAlreadySaved = (title) => {
    return favorites.some((fav) => fav.title === title);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {user?.name}!</Text>
          <Text style={styles.title}>What to Watch</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Tab buttons */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, !showFavorites && styles.tabActive]}
          onPress={() => setShowFavorites(false)}
        >
          <Text style={[styles.tabText, !showFavorites && styles.tabTextActive]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, showFavorites && styles.tabActive]}
          onPress={() => setShowFavorites(true)}
        >
          <Text style={[styles.tabText, showFavorites && styles.tabTextActive]}>
            Favorites ({favorites.length})
          </Text>
        </TouchableOpacity>
      </View>

      {showFavorites ? (
        // Favorites view
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item.id, item.title)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No favorites yet!</Text>
              <Text style={styles.emptySubtext}>
                Get some recommendations and tap the heart to save them.
              </Text>
            </View>
          }
        />
      ) : (
        // Discover view
        <>
          <Text style={styles.prompt}>What are you in the mood for?</Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. a funny comedy, something thrilling..."
            placeholderTextColor="#666"
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGet}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Suggestions</Text>
            )}
          </TouchableOpacity>

          <FlatList
            data={items}
            keyExtractor={(item, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.item}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  ) : null}
                </View>
                {item.title !== 'Error' && item.title !== 'Oops! Something went wrong' && (
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      isAlreadySaved(item.title) && styles.savedButton,
                    ]}
                    onPress={() => handleSave(item, index)}
                    disabled={savingId === index || isAlreadySaved(item.title)}
                  >
                    {savingId === index ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {isAlreadySaved(item.title) ? 'Saved' : 'Save'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  signOutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#16213e',
    borderRadius: 8,
  },
  signOutText: {
    color: '#e94560',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#16213e',
  },
  tabActive: {
    backgroundColor: '#e94560',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  prompt: {
    color: '#ccc',
    fontSize: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#0f0f23',
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e94560',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    marginTop: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  item: {
    padding: 16,
    backgroundColor: '#16213e',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
  },
  itemDesc: {
    color: '#aaa',
    marginTop: 6,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#e94560',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 12,
  },
  savedButton: {
    backgroundColor: '#444',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 12,
  },
  removeButtonText: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
