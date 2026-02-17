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
          <Text style={styles.title}>LA Cine</Text>
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
          <Text style={styles.prompt}>What LA vibe are you feeling?</Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. beach vibes, Hollywood drama, noir..."
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
    backgroundColor: '#0a0a12',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 12,
    color: '#9d4edd',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: '#00f0ff',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadowColor: '#00f0ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  signOutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  signOutText: {
    color: '#ff2e97',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    borderRadius: 2,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  tabActive: {
    backgroundColor: '#ff2e97',
    borderColor: '#ff2e97',
    shadowColor: '#ff2e97',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  tabText: {
    color: '#9d4edd',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  prompt: {
    color: '#00f0ff',
    fontSize: 14,
    fontWeight: '400',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#9d4edd',
    padding: 14,
    borderRadius: 2,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#0a0a12',
    color: '#e5e5e5',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff2e97',
    padding: 16,
    borderRadius: 2,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#ff2e97',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  buttonDisabled: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
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
    backgroundColor: '#141428',
    borderRadius: 2,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#00f0ff',
    letterSpacing: 0.5,
  },
  itemDesc: {
    color: '#ccc',
    marginTop: 6,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#ff2e97',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 2,
    marginLeft: 12,
    shadowColor: '#ff2e97',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  savedButton: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  removeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 2,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#ff2e97',
  },
  removeButtonText: {
    color: '#ff2e97',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#00f0ff',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  emptySubtext: {
    color: '#9d4edd',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
