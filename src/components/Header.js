import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, LAYOUT, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Custom Header Component
 * Navigation bar with menu button, title, and action buttons
 */
const Header = ({ 
  title = 'Flock Manager', 
  navigation, 
  showMenu = true,
  showNotifications = true,
  rightAction = null 
}) => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.headerBackground }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={colors.headerBackground} 
      />
      
      <View style={styles.content}>
        {/* Left: Logo and Title */}
        <View style={styles.leftSection}>
          {showMenu && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation?.toggleDrawer()}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={28} color={colors.headerText} />
            </TouchableOpacity>
          )}
          <Ionicons name="leaf" size={24} color={colors.primary} style={styles.logo} />
          <Text style={[styles.title, { color: colors.headerText }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        
        {/* Right: Actions */}
        <View style={styles.rightActions}>
          {/* Theme Toggle Button */}
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={24} 
              color={colors.headerText} 
            />
          </TouchableOpacity>
          
          {showNotifications && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => console.log('Notifications pressed')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.headerText} />
              {/* Notification Badge */}
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.buttonText }]}>3</Text>
              </View>
            </TouchableOpacity>
          )}
          
          {rightAction && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={rightAction.onPress}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={rightAction.icon} 
                size={24} 
                color={colors.headerText} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    ...SHADOWS.md,
    zIndex: 10,
  },
  content: {
    height: LAYOUT.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    marginRight: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default Header;
