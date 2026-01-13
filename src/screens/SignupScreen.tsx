import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import { api } from '../api/endpoints';
import { useNavigation } from '@react-navigation/native';

export const SignupScreen = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSignup = async () => {
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.auth.signup({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      Alert.alert('Success', 'Account created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Signup error:', error);
      const msg = error.response?.data?.error || error.message || 'Something went wrong';
      Alert.alert('Signup Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up for GlobalTek MRT</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(val) => handleChange('username', val)}
              placeholder="Enter username"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(val) => handleChange('email', val)}
              placeholder="Enter email"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(val) => handleChange('firstName', val)}
              placeholder="Enter first name"
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(val) => handleChange('lastName', val)}
              placeholder="Enter last name"
            />

            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(val) => handleChange('password', val)}
              placeholder="Enter password"
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(val) => handleChange('confirmPassword', val)}
              placeholder="Confirm password"
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  button: {
    height: 48,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
});
