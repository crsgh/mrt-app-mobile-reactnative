import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
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
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Scanner') {
          iconName = focused ? 'qr-code' : 'qr-code-outline';
        } else if (route.name === 'Wallet') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else {
          iconName = 'help';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#000000',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingBottom: 5,
        paddingTop: 5,
        height: 65,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 5,
      },
      headerShown: true,
      headerStyle: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        color: '#1a1a1a',
      },
      animationEnabled: true,
    })}
  >
    <Tab.Screen 
      name="Wallet" 
      component={WalletScreen}
      options={{
        title: 'Wallet',
      }}
    />
    <Tab.Screen 
      name="Scanner" 
      component={ScannerScreen}
      options={{
        title: 'Scan QR',
        headerShown: false,
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        title: 'Profile',
      }}
    />
  </Tab.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator>
    <MainStack.Screen 
      name="MainTabs" 
      component={TabNavigator} 
      options={{ headerShown: false }} 
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
