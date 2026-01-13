import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/endpoints';

type DiscountType = 'none' | 'senior' | 'pwd' | 'student';

const DISCOUNT_OPTIONS: { label: string; value: DiscountType }[] = [
  { label: 'Regular (No Discount)', value: 'none' },
  { label: 'Senior Citizen', value: 'senior' },
  { label: 'PWD (Person with Disability)', value: 'pwd' },
  { label: 'Student', value: 'student' },
];

export const ProfileScreen = () => {
  const { user, logout, setUser } = useAuthStore();
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  const handleDiscountTypeSelect = async (discountType: DiscountType) => {
    setUpdating(true);
    try {
      const result = await api.mobile.updateDiscountType(discountType);
      if (result.success && result.passenger) {
        setUser(result.passenger);
        Alert.alert('Success', `Discount type updated to ${DISCOUNT_OPTIONS.find(o => o.value === discountType)?.label}`);
        setDiscountModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to update discount type');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update discount type');
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentDiscountLabel = () => {
    return DISCOUNT_OPTIONS.find(o => o.value === (user?.discountType || 'none'))?.label || 'Regular';
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
        <TouchableOpacity 
          style={[styles.item, styles.discountItem]}
          onPress={() => setDiscountModalVisible(true)}
        >
          <Text style={styles.label}>Discount Type</Text>
          <View style={styles.discountValueContainer}>
            <Text style={styles.value}>{getCurrentDiscountLabel()}</Text>
            <Text style={styles.editIcon}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Discount Type Modal */}
      <Modal
        visible={discountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDiscountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Discount Type</Text>
              <TouchableOpacity onPress={() => setDiscountModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {updating && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            )}

            {!updating && (
              <FlatList
                data={DISCOUNT_OPTIONS}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      user?.discountType === item.value && styles.selectedOption,
                    ]}
                    onPress={() => handleDiscountTypeSelect(item.value)}
                  >
                    <View style={styles.optionContent}>
                      <Text style={[
                        styles.optionLabel,
                        user?.discountType === item.value && styles.selectedOptionLabel,
                      ]}>
                        {item.label}
                      </Text>
                      {user?.discountType === item.value && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  discountItem: {
    paddingVertical: 16,
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
  discountValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIcon: {
    fontSize: 24,
    color: '#007AFF',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#f0f7ff',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  selectedOptionLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
