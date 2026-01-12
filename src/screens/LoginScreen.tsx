import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { api } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';

import { BASE_URL } from '../api/client';

export const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const [serverStatus, setServerStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  
  React.useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      setServerStatus('checking');
      await api.mobile.getStations().catch(err => {
        if (err.response) return; // If we got a response (even 404/500), server is reachable
        throw err;
      });
      setServerStatus('ok');
    } catch (error) {
      console.log('Server check failed', error);
      setServerStatus('error');
    }
  };

  const handleLogin = async () => {
    setErrorMsg('');
    if (!username || !password) {
      setErrorMsg('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.login(username, password);
      await login(data.token, data.user);
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.response?.data?.error || error.message || 'Something went wrong';
      setErrorMsg(`${msg} (URL: ${BASE_URL})`);
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MRT Mobile</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {serverStatus === 'error' && (
        <View style={styles.serverError}>
          <Text style={styles.serverErrorText}>Cannot connect to Server</Text>
          <Text style={styles.serverErrorSubText}>Check your internet or server status</Text>
          <Text style={styles.serverErrorSubText}>URL: {BASE_URL}</Text>
          <TouchableOpacity onPress={checkServer}>
            <Text style={styles.retryText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )}

        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : null}

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  serverError: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  serverErrorText: {
    color: '#c62828',
    fontWeight: 'bold',
  },
  serverErrorSubText: {
    color: '#c62828',
    fontSize: 12,
  },
  retryText: {
    color: '#c62828',
    textDecorationLine: 'underline',
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    height: 48,
    backgroundColor: '#007AFF',
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
});
