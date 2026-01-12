import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/endpoints';
import { BASE_URL } from '../api/client';
import { useAuthStore } from '../store/authStore';

export const ScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuthStore();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;
    
    setScanned(true);
    setProcessing(true);

    try {
      // Check if we are tapping in or out based on current trip status
      // Ideally backend handles validation, we just send stationId
      // But we need to know if we should send tap_in or tap_out?
      // The API docs say: POST /api/trips { action: "tap_in" | "tap_out", ... }
      
      // Let's first check current trips to decide action
      const tripsData = await api.mobile.getTrips();
      const activeTrip = tripsData.trips.find(t => t.status === 'active');
      
      const action = activeTrip ? 'tap_out' : 'tap_in';
      const stationId = data; // Assuming QR code is just the stationId string

      if (action === 'tap_in') {
        await api.trips.tapIn(user!.username, stationId);
        Alert.alert('Success', 'Tapped In Successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const result = await api.trips.tapOut(user!.username, stationId);
        Alert.alert('Success', `Tapped Out! Fare: ₱${result.trip.fare}`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }

    } catch (error: any) {
      console.error('Scan Error:', error);
      const msg = error.response?.data?.error || error.message || 'Failed to process tap';
      Alert.alert('Error', `${msg}\n(URL: ${BASE_URL})`, [
        { text: 'Try Again', onPress: () => setScanned(false) }
      ]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.instructions}>
            Scan Station QR Code to Tap In/Out
          </Text>
          {processing && (
            <View style={styles.processing}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  instructions: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  processing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  processingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 18,
  },
});
