import * as api from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyScreen() {
  const { email, verification_code } = useLocalSearchParams();
  const router = useRouter();
  const [code, setCode] = useState(verification_code ? String(verification_code) : '');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      const token = await api.authVerify(String(email), code);
      if (token) {
        // Update auth state immediately
        if ((global as any).setAuthState) {
          (global as any).setAuthState(true);
        }
        // Replace the entire navigation stack with tabs (prevents going back)
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Verification failed', err.message || 'Unable to verify');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const response = await api.authResend(String(email));
      // If SMTP is not configured, the backend returns the code
      if (response.verification_code) {
        // Update the code in the input field and show it
        setCode(response.verification_code);
        Alert.alert(
          'Code Generated', 
          `Verification code: ${response.verification_code}\n\n(SMTP not configured - code shown here for testing)`
        );
      } else {
        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to resend');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Verify your email</Text>
      <Text style={{ marginBottom: 8, textAlign: 'center', color: '#666' }}>{email}</Text>
      {verification_code ? (
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Verification Code:</Text>
          <Text style={styles.codeValue}>{verification_code}</Text>
          <Text style={styles.codeNote}>(SMTP not configured - code shown here)</Text>
        </View>
      ) : (
        <Text style={styles.instruction}>
          We've sent a verification code to your email. Please check your inbox and enter the code below.
        </Text>
      )}
      <TextInput 
        placeholder="Enter 6-digit code" 
        value={code} 
        onChangeText={setCode} 
        style={styles.input} 
        keyboardType="numeric"
        maxLength={6}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading || code.length !== 6}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} style={styles.resendButton} disabled={loading}>
        <Text style={styles.resendButtonText}>Resend code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#007AFF',
    marginLeft: 4,
    fontSize: 16,
  },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12, marginTop: 60 },
  instruction: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: { 
    width: '100%', 
    backgroundColor: '#007AFF', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  resendButton: {
    marginTop: 16,
    padding: 8,
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  codeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 8,
    marginBottom: 8,
  },
  codeNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
