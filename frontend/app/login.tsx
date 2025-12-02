import * as api from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateInputs = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!email.trim().toLowerCase().endsWith('@vanderbilt.edu')) {
      setEmailError('Must be a Vanderbilt email (@vanderbilt.edu)');
      isValid = false;
    } else if (email.trim().split('@')[0].length === 0) {
      setEmailError('Please enter your email username');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    try {
      setLoading(true);
      const token = await api.authLogin(email.trim().toLowerCase(), password);
      if (token) {
        // Update auth state immediately
        if ((global as any).setAuthState) {
          (global as any).setAuthState(true);
        }
        // Replace the entire navigation stack with tabs (prevents going back)
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unable to login';
      
      // Provide specific error messages based on the error
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        Alert.alert(
          'Login Failed',
          'Invalid email or password. Please check your credentials and try again.',
          [{ text: 'OK' }]
        );
        setPasswordError('Invalid password');
      } else if (errorMessage.toLowerCase().includes('not verified')) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before logging in. Check your inbox for the verification code.',
          [
            { text: 'OK' },
            {
              text: 'Resend Code',
              onPress: () => {
                router.push({
                  pathname: '/verify',
                  params: { email: email.trim().toLowerCase() },
                });
              },
            },
          ]
        );
      } else if (errorMessage.toLowerCase().includes('required')) {
        if (errorMessage.toLowerCase().includes('email')) {
          setEmailError('Email is required');
        }
        if (errorMessage.toLowerCase().includes('password')) {
          setPasswordError('Password is required');
        }
      } else {
        Alert.alert('Login Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>DoresDine</Text>
        <Text style={styles.subtitle}>Welcome back</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email (@vanderbilt.edu)"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            style={[styles.input, emailError ? styles.inputError : null]}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            style={[styles.input, passwordError ? styles.inputError : null]}
            secureTextEntry
            editable={!loading}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#D4A574',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    width: '100%',
    backgroundColor: '#D4A574',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '600',
  },
});
