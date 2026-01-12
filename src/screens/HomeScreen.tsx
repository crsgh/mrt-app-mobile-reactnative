import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/endpoints';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList } from '../navigation/types';

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<StackNavigationProp<MainTabParamList>>();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveTrip = async () => {
    try {
      const data = await api.mobile.getTrips();
      // Find a trip with status 'active'
      const active = data.trips.find(t => t.status === 'active');
      setActiveTrip(active || null);
    } catch (error) {
      console.error('Failed to fetch trips', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveTrip();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchActiveTrip();
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName || user?.username}!</Text>
        <Text style={styles.subtitle}>Welcome to MRT Mobile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Status</Text>
        {activeTrip ? (
          <View>
            <Text style={styles.statusText}>On Trip</Text>
            <Text style={styles.stationText}>From: {activeTrip.startStation.name}</Text>
            <Text style={styles.timeText}>Tapped in at: {new Date(activeTrip.tapInTime).toLocaleTimeString()}</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>Not currently traveling</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.actionButtonText}>Scan QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]} 
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>View Wallet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  stationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});
