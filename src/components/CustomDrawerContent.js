import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Custom Drawer Content
 * Sidebar navigation with menu items and user profile
 */
const CustomDrawerContent = (props) => {
  const { navigation, state } = props;
  const { colors } = useTheme();
  
  // Menu items configuration
  const menuItems = [
    {
      name: 'Dashboard',
      icon: 'home-outline',
      route: 'Dashboard',
      description: 'Overview & statistics',
    },
    {
      name: 'Create Flock',
      icon: 'add-circle-outline',
      route: 'FlockCreation',
      description: 'Add new flock',
    },
    {
      name: 'Growth Prediction',
      icon: 'analytics-outline',
      route: 'GrowthPrediction',
      description: 'Predict chicken weight',
    },
    {
      name: 'Feed Optimization',
      icon: 'nutrition-outline',
      route: 'FeedOptimization',
      description: 'Optimize feed plans',
    },
    {
      name: 'Flock List',
      icon: 'list-outline',
      route: 'FlockList',
      description: 'View all flocks',
    },
  ];
  
  const bottomMenuItems = [
    {
      name: 'Settings',
      icon: 'settings-outline',
      route: 'Settings',
    },
    {
      name: 'Help & Support',
      icon: 'help-circle-outline',
      route: 'Support',
    },
    {
      name: 'Logout',
      icon: 'log-out-outline',
      action: () => console.log('Logout pressed'),
    },
  ];
  
  const currentRoute = state.routeNames[state.index];
  
  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
    } else if (item.route) {
      navigation.navigate(item.route);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.sidebarBackground }]}>
      <DrawerContentScrollView 
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with User Profile */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={40} color={colors.textLight} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.sidebarText }]}>Farm Manager</Text>
              <Text style={[styles.userEmail, { color: colors.sidebarText }]}>IT22115034</Text>
            </View>
          </View>
        </View>
        
        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.sidebarText }]} />
        
        {/* Main Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => {
            const isActive = currentRoute === item.route;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  isActive && { backgroundColor: colors.sidebarActive + '26' },
                ]}
                onPress={() => handleNavigation(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={isActive ? colors.sidebarActive : colors.sidebarText} 
                  />
                  <View style={styles.menuItemText}>
                    <Text style={[
                      styles.menuItemTitle,
                      { color: colors.sidebarText },
                      isActive && { color: colors.sidebarActive, fontWeight: TYPOGRAPHY.fontWeight.bold },
                    ]}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text style={[styles.menuItemDescription, { color: colors.sidebarText }]}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                </View>
                {isActive && <View style={[styles.activeIndicator, { backgroundColor: colors.sidebarActive }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Spacer */}
        <View style={{ flex: 1 }} />
        
        {/* Bottom Menu Items */}
        <View style={[styles.divider, { backgroundColor: colors.sidebarText }]} />
        <View style={styles.bottomMenu}>
          {bottomMenuItems.map((item, index) => {
            const isActive = currentRoute === item.route;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.bottomMenuItem,
                  isActive && { backgroundColor: colors.sidebarActive + '26' },
                ]}
                onPress={() => handleNavigation(item)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={item.icon} 
                  size={22} 
                  color={isActive ? colors.sidebarActive : colors.sidebarText} 
                />
                <Text style={[
                  styles.bottomMenuText,
                  { color: colors.sidebarText },
                  isActive && { color: colors.sidebarActive, fontWeight: TYPOGRAPHY.fontWeight.bold },
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.sidebarText }]}>Version 1.0.0</Text>
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    opacity: 0.2,
    marginVertical: 12,
  },
  menuSection: {
    paddingHorizontal: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 8,
    position: 'relative',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  menuItemDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    opacity: 0.7,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -15,
    width: 4,
    height: 30,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  bottomMenu: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  bottomMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 8,
  },
  bottomMenuText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    marginLeft: 12,
  },
  versionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    opacity: 0.5,
  },
});

export default CustomDrawerContent;
