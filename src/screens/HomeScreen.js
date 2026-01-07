import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>INTEGRATED FARM SYSTEM</Text>
            <Text style={styles.heroTitle}>Professional Egg Analysis</Text>
            <Text style={styles.heroTagline}>Always Accurate And Honest</Text>

          </View>
        </View>

        {/* Feature Cards - 4 Cards Layout */}
        <View style={styles.featuresWrapper}>
          <View style={styles.cardsGrid}>
            {/* Card 1 */}
            <TouchableOpacity 
              style={[styles.card, styles.cardNormal]}
              onPress={() => navigateToScreen('EggGrading')}
              activeOpacity={0.9}
            >
              <Text style={styles.cardIcon}>📏</Text>
              <Text style={styles.cardTitle}>Egg Grading</Text>
              <Text style={styles.cardDescription}>
                Precise measurement-based classification
              </Text>
            </TouchableOpacity>

            {/* Card 2 */}
            <TouchableOpacity 
              style={[styles.card, styles.cardNormal]}
              onPress={() => navigateToScreen('EggQuality')}
              activeOpacity={0.9}
            >
              <Text style={styles.cardIcon}>📸</Text>
              <Text style={styles.cardTitle}>Quality Check</Text>
              <Text style={styles.cardDescription}>
                Image-based quality detection
              </Text>
            </TouchableOpacity>

            {/* Card 3 */}


          </View>
        </View>

        {/* Why Choose Section */}
        <View style={styles.whySection}>
          <Text style={styles.whySubtitle}>WHY CHOOSE US</Text>
          <Text style={styles.whyTitle}>Professional Grade</Text>
          <Text style={styles.whyDescription}>
            Our advanced AI models deliver industry-leading accuracy for egg grading and quality assessment. Trusted by professionals worldwide.
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{'<'}1s</Text>
            <Text style={styles.statLabel}>Speed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  content: {
    paddingBottom: 40,
  },
  
  /* Hero Section */
  heroSection: {
    height: 380,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroOverlay: {
    alignItems: 'center',
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.neutral.white,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroTagline: {
    fontSize: 18,
    color: COLORS.neutral.white,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
    fontWeight: '300',
  },
  heroCTA: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  heroCTAText: {
    color: COLORS.neutral.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Cards Grid */
  featuresWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    backgroundColor: COLORS.neutral.white,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardNormal: {
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral.lighter,
  },
  cardFeatured: {
    width: '100%',
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardIconFeatured: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 6,
  },
  cardTitleFeatured: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.neutral.dark,
    textAlign: 'center',
    lineHeight: 16,
  },
  cardDescriptionFeatured: {
    fontSize: 12,
    color: COLORS.neutral.white,
    textAlign: 'center',
    lineHeight: 16,
  },

  /* Why Section */
  whySection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: COLORS.neutral.light,
  },
  whySubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  whyTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  whyDescription: {
    fontSize: 14,
    color: COLORS.neutral.dark,
    lineHeight: 22,
    fontWeight: '400',
  },

  /* Stats Section */
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    backgroundColor: COLORS.neutral.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.neutral.dark,
    fontWeight: '600',
  },
});

export default HomeScreen;