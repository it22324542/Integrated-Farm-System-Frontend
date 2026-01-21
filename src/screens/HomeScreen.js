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
            <Text style={styles.heroSubtitle}>Integrated Efficient Poultry & Egg Production</Text>
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
    backgroundColor:  COLORS.neutral.white,
  },
  content: {
    paddingBottom: 60,
  },
  
  /* Hero Section */
  heroSection: {
    height: 420,
    backgroundColor: COLORS. accent,
    justifyContent:  'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroOverlay: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
    opacity: 0.95,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS. neutral.white,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
    lineHeight: 54,
  },
  heroTagline: {
    fontSize: 20,
    color: COLORS. neutral.white,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '400',
    opacity: 0.92,
    maxWidth: '85%',
    lineHeight: 28,
  },
  heroCTA: {
    backgroundColor: COLORS.primary,
    paddingHorizontal:  42,
    paddingVertical:  16,
    borderRadius:  30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height:  6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  heroCTAText: {
    color: COLORS.neutral.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  /* Cards Grid */
  featuresWrapper: {
    paddingHorizontal: 20,
    paddingVertical:  40,
    backgroundColor:  COLORS.neutral.white,
  },
  sectionHeader: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS. secondary,
    letterSpacing:  1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS. accent,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card:  {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity:  0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 160,
    justifyContent: 'center',
  },
  cardNormal: {
    backgroundColor:  COLORS.neutral.white,
    borderWidth: 1.5,
    borderColor:  COLORS.neutral.lighter,
  },
  cardFeatured:  {
    width: '100%',
    backgroundColor: COLORS.primary,
    marginTop: 8,
    minHeight: 180,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  cardIconFeatured: {
    fontSize: 48,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS. accent,
    textAlign: 'center',
    marginBottom:  8,
    letterSpacing: -0.3,
  },
  cardTitleFeatured: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS. neutral.white,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS. neutral.dark,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
  cardDescriptionFeatured: {
    fontSize: 15,
    color: COLORS. neutral.white,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
    opacity: 0.95,
  },
  cardBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cardBadgeText: {
    color: COLORS.neutral.white,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* Why Section */
  whySection:  {
    paddingHorizontal: 24,
    paddingVertical:  48,
    backgroundColor:  COLORS.neutral.light,
  },
  whySubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color:  COLORS.secondary,
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  whyTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS. accent,
    marginBottom: 18,
    letterSpacing: -0.8,
    lineHeight: 46,
  },
  whyDescription: {
    fontSize: 16,
    color: COLORS.neutral.dark,
    lineHeight: 26,
    fontWeight: '400',
  },

  /* Features List */
  featuresList: {
    marginTop: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom:  20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: COLORS. neutral.dark,
    lineHeight: 20,
    fontWeight: '400',
  },

  /* Stats Section */
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical:  40,
    backgroundColor:  COLORS.neutral.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 100,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS. primary,
    marginBottom: 6,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS. neutral.dark,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* CTA Section */
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical:  48,
    backgroundColor: COLORS. accent,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS. neutral.white,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  ctaDescription: {
    fontSize: 16,
    color: COLORS. neutral.white,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    lineHeight: 24,
    maxWidth: '85%',
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical:  16,
    borderRadius:  30,
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonText: {
    color:  COLORS.neutral.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Footer */
  footer: {
    paddingHorizontal: 24,
    paddingVertical:  32,
    backgroundColor: COLORS. neutral.lighter,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.neutral.dark,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 8,
  },
});

export default HomeScreen;