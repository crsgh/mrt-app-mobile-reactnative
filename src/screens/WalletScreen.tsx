import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { api } from '../api/endpoints';
import { Trip } from '../types';

export const WalletScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = async () => {
    try {
      const data = await api.mobile.getTrips();
      setTrips(data.trips.reverse()); // Show newest first
    } catch (error) {
      console.error('Failed to fetch trips', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const renderItem = ({ item }: { item: Trip }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.station}>{item.startStation.name}</Text>
          <Text style={styles.arrow}>↓</Text>
          <Text style={styles.station}>{item.endStation?.name || 'In Progress'}</Text>
        </View>
        <View style={styles.rightSide}>
          <Text style={styles.fare}>
            {item.status === 'completed' ? `₱${item.fare}` : 'Active'}
          </Text>
          <Text style={styles.date}>
            {new Date(item.tapInTime).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.time}>
          {new Date(item.tapInTime).toLocaleTimeString()} 
          {item.tapOutTime && ` - ${new Date(item.tapOutTime).toLocaleTimeString()}`}
        </Text>
        <Text style={[styles.status, { color: item.status === 'completed' ? '#34C759' : '#007AFF' }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>₱100.00</Text>
        <Text style={styles.balanceSub}>Auto-reload enabled</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      
      <FlatList
        data={trips}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No transactions found</Text> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#007AFF',
    borderRadius: 16,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
    marginBottom: 12,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  station: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  arrow: {
    fontSize: 14,
    color: '#999',
    marginVertical: 2,
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  fare: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 24,
  },
});
