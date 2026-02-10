import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { moods } from '../data/recommendations';

export default function MoodScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const handleMoodSelect = (mood) => {
    navigation.navigate('Recommendations', { mood });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {user?.name}!</Text>
          <Text style={styles.question}>How are you feeling?</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.moodGrid}
        showsVerticalScrollIndicator={false}
      >
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[styles.moodCard, { borderColor: mood.color }]}
            onPress={() => handleMoodSelect(mood)}
            activeOpacity={0.7}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.footer}>
        Select your mood to get personalized recommendations
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 4,
  },
  question: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  signOutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  signOutText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    justifyContent: 'center',
  },
  moodCard: {
    width: '45%',
    aspectRatio: 1.2,
    backgroundColor: colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    textAlign: 'center',
    color: colors.textDark,
    fontSize: 14,
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
});
