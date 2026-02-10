import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { recommendationsByMood } from '../data/recommendations';

export default function RecommendationsScreen({ route, navigation }) {
  const { mood } = route.params;
  const recommendations = recommendationsByMood[mood.id] || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.moodBadge}>
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          <Text style={styles.moodLabel}>Feeling {mood.label}</Text>
        </View>
      </View>

      <Text style={styles.title}>Perfect picks for you</Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {recommendations.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View
                style={[
                  styles.typeBadge,
                  item.type === 'TV' && styles.typeBadgeTV,
                ]}
              >
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
            </View>
            <Text style={styles.reason}>{item.reason}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.refreshText}>Try a different mood</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 16,
    color: colors.textMuted,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeTV: {
    backgroundColor: colors.secondary,
  },
  typeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  reason: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  refreshButton: {
    margin: 24,
    padding: 16,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
