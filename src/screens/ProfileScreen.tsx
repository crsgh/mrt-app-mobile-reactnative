import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

export const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Are you sure you want to logout?');
      if (confirm) {
        logout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: logout },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.item}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user?.role}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Discount Type</Text>
          <Text style={styles.value}>{user?.discountType || 'Regular'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  logoutButton: {
    margin: 24,
    padding: 16,
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
