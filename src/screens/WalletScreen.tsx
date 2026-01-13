import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Modal, Alert, ActivityIndicator, Linking, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/endpoints';
import { TopUpTransaction, Trip } from '../types';

export const WalletScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [topUps, setTopUps] = useState<TopUpTransaction[]>([]);
  const [showTopUps, setShowTopUps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'amount' | 'method' | 'verify'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [currentSourceId, setCurrentSourceId] = useState<string>('');

  const fetchData = async () => {
    try {
      const [tripsData, profileData, topUpData] = await Promise.all([
        api.mobile.getTrips(),
        api.mobile.getProfile(),
        api.mobile.getTopUpHistory()
      ]);

      const sortedRecentTrips = [...tripsData.trips]
        .sort((a, b) => new Date(b.tapInTime).getTime() - new Date(a.tapInTime).getTime())
        .slice(0, 3);
      setTrips(sortedRecentTrips);
      if (topUpData?.transactions) {
        setTopUps(topUpData.transactions);
      }
      if (profileData.passenger && profileData.passenger.balance !== undefined) {
          setBalance(profileData.passenger.balance);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      
      // Handle deep link return
      const handleDeepLink = (event: { url: string }) => {
        if (event.url.includes('payment-success') && currentSourceId) {
            // Trigger immediate verification
            api.mobile.verifyPayment(currentSourceId).then(result => {
                if (result.success && result.status === 'chargeable') {
                    setBalance(result.balance || balance + selectedAmount);
                    Alert.alert('Success', 'Payment verified successfully!');
                    resetModal();
                    onRefresh();
                }
            });
        }
      };

      const subscription = Linking.addEventListener('url', handleDeepLink);

      // Check if app was opened with a link
      Linking.getInitialURL().then((url) => {
        if (url && url.includes('payment-success') && currentSourceId) {
            handleDeepLink({ url });
        }
      });

      return () => {
        subscription.remove();
      };
    }, [currentSourceId, balance, selectedAmount])
  );

  const resetModal = () => {
      setModalVisible(false);
      setStep('amount');
      setSelectedAmount(0);
      setCustomAmount('');
      setCurrentSourceId('');
      setProcessing(false);
  };

  const handleAmountSelect = (amount: number) => {
      setSelectedAmount(amount);
      setStep('method');
  };

  const handleCustomAmount = () => {
      const amount = parseInt(customAmount);
      if (isNaN(amount) || amount < 10 || amount > 10000) {
          Alert.alert('Invalid Amount', 'Please enter an amount between ₱10 and ₱10,000');
          return;
      }
      setSelectedAmount(amount);
      setStep('method');
  };

  const handleCreatePayment = async (type: 'gcash' | 'grab_pay' | 'paymaya') => {
      setProcessing(true);
      try {
          const result = await api.mobile.createPayment(selectedAmount, type);
          if (result.success && result.data) {
              setCurrentSourceId(result.data.id);
              const checkoutUrl = result.data.attributes.redirect.checkout_url;
              
              // Open in browser
              const supported = await Linking.canOpenURL(checkoutUrl);
              if (supported) {
                  await Linking.openURL(checkoutUrl);
                  setStep('verify');
                  // Start polling for payment status
                  startPolling(result.data.id);
              } else {
                  Alert.alert('Error', 'Cannot open payment link');
              }
          }
      } catch (error: any) {
          Alert.alert('Error', error.response?.data?.error || 'Payment creation failed');
      } finally {
          setProcessing(false);
      }
  };

  const startPolling = async (sourceId: string) => {
      let attempts = 0;
      const maxAttempts = 60; // 60 attempts * 2 seconds = 120 seconds timeout
      
      const poll = setInterval(async () => {
          attempts++;
          try {
              const result = await api.mobile.verifyPayment(sourceId);
              
              if (result.success && result.status === 'paid') {
                  // Payment successful!
                  clearInterval(poll);
                  setBalance(result.balance || balance + selectedAmount);
                  Alert.alert('Success', 'Payment successful!');
                  resetModal();
                  onRefresh();
              } else if (result.status === 'cancelled' || result.status === 'expired' || result.status === 'failed') {
                  clearInterval(poll);
                  Alert.alert('Payment Failed', `The payment was ${result.status}.`);
                  resetModal();
              } else if (result.status === 'consumed') {
                  // Already processed
                  clearInterval(poll);
                  setBalance(result.balance || balance + selectedAmount);
                  Alert.alert('Success', 'Payment already processed!');
                  resetModal();
                  onRefresh();
              } else if (attempts >= maxAttempts) {
                  clearInterval(poll);
                  Alert.alert('Timeout', 'Payment verification timed out. Please try verifying manually.');
                  resetModal();
              }
          } catch (error) {
              console.log('Polling error:', error);
              // Continue polling on error
          }
      }, 2000); // Check every 2 seconds
  };

  const handleVerifyPayment = async () => {
      setProcessing(true);
      try {
          const result = await api.mobile.verifyPayment(currentSourceId);
          if (result.success) {
              setBalance(result.balance || balance + selectedAmount);
              Alert.alert('Success', 'Payment successful!');
              resetModal();
              onRefresh(); // Refresh history
          } else {
              if (result.status === 'pending') {
                  Alert.alert('Payment Pending', 'Please complete the payment in the browser first.');
              } else {
                  Alert.alert('Payment Failed', result.message || 'Payment was not completed.');
                  resetModal(); // Close modal on failure instead of hanging
              }
          }
      } catch (error: any) {
          Alert.alert('Error', error.response?.data?.error || 'Verification failed');
          // Optional: Don't close modal here in case it's just a network error
      } finally {
          setProcessing(false);
      }
  };

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

  const renderTopUpItem = (item: TopUpTransaction) => (
    <View key={item.id} style={styles.topUpCard}>
      <View style={styles.row}>
        <View>
          <Text style={styles.topUpTitle}>Wallet Top-up</Text>
          <Text style={styles.topUpMethod}>{item.method?.toUpperCase?.() || 'PAYMENT'}</Text>
        </View>
        <View style={styles.rightSide}>
          <Text style={styles.topUpAmount}>₱{item.amount.toFixed(2)}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        <Text style={[styles.status, { color: item.status === 'paid' ? '#34C759' : '#FF3B30' }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );



  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>₱{balance.toFixed(2)}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.depositButton} onPress={() => {
              setStep('amount');
              setModalVisible(true);
          }}>
              <Text style={styles.depositButtonText}>+ Load Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.depositButton}
            onPress={() => setShowTopUps(true)}
          >
            <Text style={styles.depositButtonText}>Top-up History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={trips}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeaderContainer}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No transactions found</Text> : null
        }
      />
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={showTopUps}
        onRequestClose={() => setShowTopUps(false)}
      >
        <View style={styles.modalOverlayCentered}>
          <View style={styles.historyContent}>
            <Text style={styles.modalTitle}>Top-up History</Text>
            {topUps.length === 0 ? (
              !loading ? <Text style={styles.emptyText}>No top-ups yet</Text> : null
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {topUps.slice(0, 20).map(renderTopUpItem)}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowTopUps(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetModal}
      >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalOverlay}
          >
              <View style={styles.modalContent}>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                      <Text style={styles.modalTitle}>
                          {step === 'amount' ? 'Load Wallet' : 
                           step === 'method' ? 'Select Payment' : 'Verify Payment'}
                      </Text>
                      <Text style={styles.modalSubtitle}>
                          {step === 'amount' ? 'Select or enter amount to deposit' : 
                           step === 'method' ? `Amount: ₱${selectedAmount}` : 'Please complete payment in browser'}
                      </Text>
                      
                      {step === 'amount' && (
                          <View>
                              <View style={styles.customAmountContainer}>
                                  <Text style={styles.currencyPrefix}>₱</Text>
                                  <TextInput
                                      style={styles.customInput}
                                      placeholder="Enter amount (10 - 10,000)"
                                      keyboardType="numeric"
                                      value={customAmount}
                                      onChangeText={setCustomAmount}
                                      onSubmitEditing={handleCustomAmount}
                                  />
                                  <TouchableOpacity 
                                      style={[styles.goButton, (!customAmount || parseInt(customAmount) < 10) && styles.disabledButton]}
                                      onPress={handleCustomAmount}
                                      disabled={!customAmount || parseInt(customAmount) < 10}
                                  >
                                      <Text style={styles.goButtonText}>Go</Text>
                                  </TouchableOpacity>
                              </View>

                              <Text style={styles.orText}>OR SELECT AMOUNT</Text>

                              <View style={styles.amountGrid}>
                                  {[20, 50, 100, 200, 500, 1000].map((amount) => (
                                      <TouchableOpacity 
                                        key={amount} 
                                        style={styles.amountButton}
                                        onPress={() => handleAmountSelect(amount)}
                                      >
                                          <Text style={styles.amountText}>₱{amount}</Text>
                                      </TouchableOpacity>
                                  ))}
                              </View>
                          </View>
                      )}

                      {step === 'method' && (
                          <View style={styles.methodContainer}>
                              <TouchableOpacity 
                                style={[styles.methodButton]}
                                onPress={() => handleCreatePayment('gcash')}
                                disabled={processing}
                              >
                                  <Image 
                                    source={require('../../assets/gcashicon.png')} 
                                    style={styles.methodIcon}
                                  />
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={[styles.methodButton]}
                                onPress={() => handleCreatePayment('paymaya')}
                                disabled={processing}
                              >
                                  <Image 
                                    source={require('../../assets/paymayaicon.png')} 
                                    style={styles.methodIcon}
                                  />
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={[styles.methodButton]}
                                onPress={() => handleCreatePayment('grab_pay')}
                                disabled={processing}
                              >
                                  <Image 
                                    source={require('../../assets/grabicon.png')} 
                                    style={styles.methodIcon}
                                  />
                              </TouchableOpacity>
                          </View>
                      )}

                      {step === 'verify' && (
                          <View style={styles.verifyContainer}>
                              <ActivityIndicator size="large" color="#007AFF" style={{ marginBottom: 20 }} />
                              <Text style={styles.verifyText}>
                                  Waiting for payment completion...
                              </Text>
                              <Text style={[styles.verifyText, { fontSize: 14, color: '#666' }]}> 
                                  The app will update automatically once your payment is confirmed.
                              </Text>
                          </View>
                      )}

                      {processing && <ActivityIndicator style={{ marginTop: 20 }} color="#007AFF" size="large" />}

                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={resetModal}
                        disabled={processing}
                      >
                          <Text style={styles.closeButtonText}>Cancel</Text>
                      </TouchableOpacity>
                  </ScrollView>
              </View>
          </KeyboardAvoidingView>
      </Modal>
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
    backgroundColor: '#000000',
    borderRadius: 16,
    alignItems: 'center', // Center content
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
    marginBottom: 16,
  },
  depositButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
  },
  depositButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
    color: '#333',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  station: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  arrow: {
    fontSize: 16,
    color: '#999',
    marginVertical: 4,
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  fare: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  historyContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  listHeaderContainer: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  topUpCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  topUpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  topUpMethod: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  topUpAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end', // Slide from bottom
  },
  modalContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      minHeight: 500, // Increased height for input
      maxHeight: '80%',
  },
  modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
  },
  modalSubtitle: {
      fontSize: 16,
      color: '#666',
      marginBottom: 24,
      textAlign: 'center',
  },
  customAmountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: '#f9f9f9',
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: '#eee',
  },
  currencyPrefix: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      paddingLeft: 16,
  },
  customInput: {
      flex: 1,
      fontSize: 20,
      padding: 12,
      color: '#333',
  },
  goButton: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      marginRight: 4,
  },
  disabledButton: {
      backgroundColor: '#ccc',
  },
  goButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
  },
  orText: {
      textAlign: 'center',
      color: '#999',
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 20,
      letterSpacing: 1,
  },
  amountGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
  },
  amountButton: {
      width: '48%', // 2 columns
      backgroundColor: '#f0f0f0',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
  },
  amountText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
  },
  methodContainer: {
      width: '100%',
      flexDirection: 'column',
  },
  methodButton: {
      width: '100%',
      backgroundColor: '#ffffff',
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      minHeight: 100,
  },
  methodIcon: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
  },
  verifyContainer: {
      alignItems: 'center',
  },
  verifyText: {
      fontSize: 16,
      color: '#333',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
  },
  verifyButton: {
      width: '100%',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
  },
  verifyButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
  },
  closeButton: {
      marginTop: 24,
      padding: 16,
      alignItems: 'center',
  },
  closeButtonText: {
      fontSize: 16,
      color: '#FF3B30',
      fontWeight: '600',
  }
});
