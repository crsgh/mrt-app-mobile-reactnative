import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform, Modal, FlatList, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (!result.canceled) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfilePicture = async (imageUri: string) => {
    setUploadingImage(true);
    try {
      // Read the image file as base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);

      console.log('Uploading profile picture, size:', base64.length);

      const result = await api.mobile.uploadProfilePicture({
        profilePicture: base64
      });
      
      if (result.success && result.passenger) {
        console.log('Upload successful, updating user with:', result.passenger);
        setUser(result.passenger);
        
        // Add delay to ensure database has persisted the data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh profile to ensure picture is loaded
        const profileData = await api.mobile.getProfile();
        if (profileData.success && profileData.passenger) {
          console.log('Profile refreshed, picture:', profileData.passenger.profilePicture ? 'Present' : 'Missing');
          console.log('Picture size after refresh:', profileData.passenger.profilePicture?.length || 0);
          setUser(profileData.passenger);
        } else {
          console.log('Profile refresh failed:', profileData);
        }
        
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        Alert.alert('Error', result?.message || 'Failed to upload profile picture');
      }
    } catch (error: any) {
      console.log('Upload error details:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to upload profile picture';
      Alert.alert('Error', errorMsg);
    } finally {
      setUploadingImage(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
        <TouchableOpacity 
          onPress={handlePickImage}
          disabled={uploadingImage}
          style={styles.avatarContainer}
        >
          {user?.profilePicture ? (
            <Image 
              source={{ uri: user.profilePicture }} 
              style={[styles.avatar, { width: 100, height: 100 }]}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </Text>
            </View>
          )}
          {uploadingImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>📷</Text>
          </View>
        </TouchableOpacity>
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
    borderRadius: 12,
    margin: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editBadgeText: {
    fontSize: 16,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#000000',
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
