import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { useAuthStore } from '../store/authStore';
import { ActivityIndicator, View } from 'react-native';
import { api } from '../api/endpoints';

const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Wallet') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else {
          iconName = 'help';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator>
    <MainStack.Screen 
      name="MainTabs" 
      component={TabNavigator} 
      options={{ headerShown: false }} 
    />
    <MainStack.Screen 
      name="Scanner" 
      component={ScannerScreen} 
      options={{ 
        presentation: 'modal',
        headerTitle: 'Scan QR Code',
        headerBackTitle: 'Close'
      }} 
    />
  </MainStack.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, checkAuth, user, token, login } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && !user && token) {
        try {
          const data = await api.mobile.getProfile();
          if (data.success && data.passenger) {
             // We use login to update the user in store, preserving the token
             await login(token, data.passenger);
          }
        } catch (error) {
          console.log('Failed to fetch profile on restore', error);
          // If 401, the client interceptor will handle logout
        }
      }
    };
    fetchUser();
  }, [isAuthenticated, user, token]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
