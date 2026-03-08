import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme'; // assuming you have this

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Eye-catching gradient background */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1506361797048-46a149213205?auto=format&fit=crop&q=80' }} // ← egg/farm related image or your own asset
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>SMART POULTRY SOLUTION</Text>
            <Text style={styles.heroTitle}>Professional Egg Analysis</Text>
            <Text style={styles.heroTagline}>
              Accurate • Fast • Trusted by Farmers
            </Text>

            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigateToScreen('DailySummary')}
            >
              <Text style={styles.heroButtonText}>View Today's Summary</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Features - Glassmorphism cards */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Core Features</Text>

          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={styles.glassCard}
              onPress={() => navigateToScreen('EggGrading')}
              activeOpacity={0.88}
            >
              <Text style={styles.cardIcon}>📏</Text>
              <Text style={styles.cardTitle}>Egg Grading</Text>
              <Text style={styles.cardDesc}>Weight & size based classification</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.glassCard}
              onPress={() => navigateToScreen('EggQuality')}
              activeOpacity={0.88}
            >
              <Text style={styles.cardIcon}>🔍</Text>
              <Text style={styles.cardTitle}>Quality Check</Text>
              <Text style={styles.cardDesc}>AI-powered defect detection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.glassCard}
              onPress={() => navigateToScreen('DailySummary')}
              activeOpacity={0.88}
            >
              <Text style={styles.cardIcon}>📊</Text>
              <Text style={styles.cardTitle}>Daily Summary</Text>
              <Text style={styles.cardDesc}>Trends & insights at a glance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats - eye-catching numbers */}
        <View style={styles.statsSection}>
          <View style={styles.statCircle}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCircle}>
            <Text style={styles.statNumber}>&lt;1s</Text>
            <Text style={styles.statLabel}>Analysis</Text>
          </View>
          <View style={styles.statCircle}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.whySection}>
          <Text style={styles.whyTitle}>Why Farmers Choose Us</Text>
          <Text style={styles.whyText}>
            Cutting-edge AI technology combined with years of poultry expertise delivers reliable results you can trust every day.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white || '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero
  hero: {
    height: 480,
    justifyContent: 'center',
  },
  heroImage: {
    opacity: 0.35,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffd60a',
    letterSpacing: 2.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 46,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 12,
    letterSpacing: -1,
  },
  heroTagline: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.95,
    maxWidth: '80%',
  },
  heroButton: {
    backgroundColor: COLORS.primary || '#e63946',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  // Features
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.accent || '#2a9d8f',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  glassCard: {
    width: (width - 56) / 2,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    backdropFilter: 'blur(10px)', // note: works on web/modern RN, fallback on old devices
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent || '#264653',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Stats
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: COLORS.neutral.light || '#f1f5f9',
  },
  statCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    width: 110,
    height: 110,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  statNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.primary || '#e63946',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },

  // Why section
  whySection: {
    paddingHorizontal: 28,
    paddingVertical: 48,
    alignItems: 'center',
  },
  whyTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.accent || '#2a9d8f',
    marginBottom: 16,
    textAlign: 'center',
  },
  whyText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: '85%',
  },
});

export default HomeScreen;