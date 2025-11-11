import * as api from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyScreen() {
  const { email, code: initialCode } = useLocalSearchParams();
  const router = useRouter();
  const [code, setCode] = useState(initialCode ? String(initialCode) : '');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      const token = await api.authVerify(String(email), code);
      if (token) {
        router.replace('/');
      }
    } catch (err: any) {
      Alert.alert('Verification failed', err.message || 'Unable to verify');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await api.authResend(String(email));
      if (response.verification_code) {
        // Development mode - show code in alert
        Alert.alert(
          'Code Resent (Dev Mode)', 
          `Your verification code: ${response.verification_code}`,
          [{ text: 'OK', onPress: () => setCode(response.verification_code) }]
        );
      } else {
        Alert.alert('Sent', 'Verification code resent to your email.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to resend');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={{ marginBottom: 8 }}>{email}</Text>
      {initialCode && (
        <View style={styles.devCodeContainer}>
          <Text style={styles.devCodeLabel}>Development Mode - Your code:</Text>
          <Text style={styles.devCode}>{initialCode}</Text>
        </View>
      )}
      <TextInput placeholder="Enter code" value={code} onChangeText={setCode} style={styles.input} keyboardType="numeric" />
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} style={{ marginTop: 12 }}>
        <Text style={{ color: '#007AFF' }}>Resend code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
  devCodeContainer: { 
    width: '100%', 
    backgroundColor: '#f0f0f0', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12,
    alignItems: 'center',
  },
  devCodeLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  devCode: { fontSize: 24, fontWeight: '700', color: '#007AFF', letterSpacing: 4 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { width: '100%', backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
