import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Import screens
import FlockCreationScreen from '../screens/FlockCreationScreen';
import InitialFeedPlanScreen from '../screens/InitialFeedPlanScreen';
import WeeklyAnalysisScreen from '../screens/WeeklyAnalysisScreen';
import GrowthPredictionScreen from '../screens/GrowthPredictionScreen';
import FeedOptimizationScreen from '../screens/FeedOptimizationScreen';
import FlockListScreen from '../screens/FlockListScreen';
import FlockDetailScreen from '../screens/FlockDetailScreen';
import DailyAnalysisScreen from '../screens/DailyAnalysisScreen';
import FlockProfileScreen from '../screens/FlockProfileScreen';
import FeedOptimizationScreenNew from '../screens/FeedOptimizationScreenNew';
import PlaceholderScreen from '../screens/PlaceholderScreen';

// Import components
import CustomDrawerContent from '../components/CustomDrawerContent';
import Header from '../components/Header';

// Import theme
import { useTheme } from '../context/ThemeContext';

const Drawer = createDrawerNavigator();

const AppNavigatorContent = () => {
  const { colors } = useTheme();
  
  return (
    <Drawer.Navigator
      initialRouteName="FlockList"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.sidebarBackground,
          width: 280,
        },
        drawerActiveTintColor: colors.sidebarActive,
        drawerInactiveTintColor: colors.sidebarText,
        headerShown: true,
        header: ({ navigation, route }) => (
          <Header 
            title={route.params?.title || 'Flock Manager'}
            navigation={navigation}
          />
        ),
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={PlaceholderScreen}
        options={{
          title: 'Dashboard',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Dashboard' }}
      />
      <Drawer.Screen
        name="FlockCreation"
        component={FlockCreationScreen}
        options={{
          title: 'Create Flock',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Create Flock' }}
      />
      <Drawer.Screen
        name="InitialFeedPlan"
        component={InitialFeedPlanScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Initial Feed Plan',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Initial Feed Plan' }}
      />
      <Drawer.Screen
        name="GrowthPrediction"
        component={GrowthPredictionScreen}
        options={{
          title: 'Growth Prediction',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Growth Prediction' }}
      />
      <Drawer.Screen
        name="FeedOptimization"
        component={FeedOptimizationScreen}
        options={{
          title: 'Feed Optimization',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Feed Optimization' }}
      />
      <Drawer.Screen
        name="FlockList"
        component={FlockListScreen}
        options={{
          title: 'Flock List',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Flock List' }}
      />
      <Drawer.Screen
        name="FlockDetail"
        component={FlockDetailScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Flock Details',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Flock Details' }}
      />
      <Drawer.Screen
        name="DailyAnalysis"
        component={DailyAnalysisScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Daily Feed Analysis',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Daily Feed Analysis' }}
      />
      <Drawer.Screen
        name="FlockProfile"
        component={FlockProfileScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Flock Profile',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Flock Profile' }}
      />
      <Drawer.Screen
        name="FeedOptimizationNew"
        component={FeedOptimizationScreenNew}
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Feed Optimization Plan',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Feed Optimization Plan' }}
      />
      <Drawer.Screen
        name="WeeklyAnalysis"
        component={WeeklyAnalysisScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Weekly Analysis',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Weekly Analysis' }}
      />
      <Drawer.Screen
        name="Settings"
        component={PlaceholderScreen}
        options={{
          title: 'Settings',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Settings' }}
      />
      <Drawer.Screen
        name="Support"
        component={PlaceholderScreen}
        options={{
          title: 'Help & Support',
          header: ({ navigation }) => (
            <Header title="Flock Manager" navigation={navigation} />
          ),
        }}
        initialParams={{ title: 'Help & Support' }}
      />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <AppNavigatorContent />
    </NavigationContainer>
  );
};

export default AppNavigator;
