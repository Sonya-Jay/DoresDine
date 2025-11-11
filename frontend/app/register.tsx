import * as api from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleEmailChange = (text: string) => {
    // Remove @vanderbilt.edu if user tries to type it
    const cleaned = text.replace('@vanderbilt.edu', '').replace('@', '');
    setEmailPrefix(cleaned);
  };

  const getFullEmail = () => {
    return emailPrefix.trim() + '@vanderbilt.edu';
  };

  const validateInputs = (): boolean => {
    let isValid = true;
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');

    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    } else if (firstName.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters');
      isValid = false;
    } else if (firstName.trim().length > 50) {
      setFirstNameError('First name must be less than 50 characters');
      isValid = false;
    }

    // Validate last name
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    } else if (lastName.trim().length < 2) {
      setLastNameError('Last name must be at least 2 characters');
      isValid = false;
    } else if (lastName.trim().length > 50) {
      setLastNameError('Last name must be less than 50 characters');
      isValid = false;
    }

    // Validate email prefix
    if (!emailPrefix.trim()) {
      setEmailError('Email username is required');
      isValid = false;
    } else if (emailPrefix.trim().length < 2) {
      setEmailError('Email username must be at least 2 characters');
      isValid = false;
    } else if (!/^[a-zA-Z0-9._-]+$/.test(emailPrefix.trim())) {
      setEmailError('Email username can only contain letters, numbers, dots, underscores, and hyphens');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else if (password.length > 100) {
      setPasswordError('Password must be less than 100 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    // Clear previous errors
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    try {
      setLoading(true);
      const fullEmail = getFullEmail();
      const response = await api.authRegister({ 
        first_name: firstName.trim(), 
        last_name: lastName.trim(), 
        email: fullEmail.toLowerCase(), 
        password 
      });
      
      // If SMTP is not configured, show the verification code and pass it to verify screen
      if (response.verification_code) {
        // Navigate to verify screen with code pre-filled
        router.push({
          pathname: '/verify',
          params: { 
            email: fullEmail.toLowerCase(),
            verification_code: response.verification_code,
          },
        });
        // Show alert with the code
        setTimeout(() => {
          Alert.alert(
            'Verification Code',
            `Your verification code is: ${response.verification_code}\n\n(SMTP not configured - code shown here for testing)`
          );
        }, 500);
      } else {
        // Navigate to verify screen - user should check their email
        router.push({
          pathname: '/verify',
          params: { email: fullEmail.toLowerCase() },
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.message || 'Unable to register. Please try again.';
      
      // Provide specific error messages
      if (errorMessage.toLowerCase().includes('email already exists') || errorMessage.toLowerCase().includes('already exists')) {
        Alert.alert(
          'Registration Failed',
          'An account with this email already exists. Please log in instead.',
          [
            { text: 'OK' },
            {
              text: 'Go to Login',
              onPress: () => router.push('/login'),
            },
          ]
        );
        setEmailError('Email already registered');
      } else if (errorMessage.toLowerCase().includes('vanderbilt')) {
        setEmailError('Only Vanderbilt email addresses are allowed');
        Alert.alert('Invalid Email', 'Only @vanderbilt.edu email addresses are allowed');
      } else if (errorMessage.toLowerCase().includes('password')) {
        setPasswordError(errorMessage);
        Alert.alert('Invalid Password', errorMessage);
      } else if (errorMessage.toLowerCase().includes('missing') || errorMessage.toLowerCase().includes('required')) {
        Alert.alert('Missing Fields', 'Please fill in all required fields');
      } else {
        Alert.alert('Registration Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Vanderbilt students only</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          placeholder="First name" 
          value={firstName} 
          onChangeText={(text) => {
            setFirstName(text);
            setFirstNameError('');
          }} 
          style={[styles.input, firstNameError ? styles.inputError : null]}
          editable={!loading}
        />
        {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput 
          placeholder="Last name" 
          value={lastName} 
          onChangeText={(text) => {
            setLastName(text);
            setLastNameError('');
          }} 
          style={[styles.input, lastNameError ? styles.inputError : null]}
          editable={!loading}
        />
        {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}
      </View>
      
      <View style={styles.inputContainer}>
        <View style={[styles.emailContainer, emailError ? styles.inputError : null]}>
          <TextInput 
            placeholder="username" 
            value={emailPrefix} 
            onChangeText={(text) => {
              handleEmailChange(text);
              setEmailError('');
            }} 
            style={styles.emailInput} 
            keyboardType="email-address" 
            autoCapitalize="none"
            editable={!loading}
          />
          <Text style={styles.emailSuffix}>@vanderbilt.edu</Text>
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput 
          placeholder="Password (min 6 characters)" 
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
        onPress={handleRegister} 
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create account'}</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={{ color: '#007AFF' }}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    borderRadius: 8,
    fontSize: 16,
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
  emailContainer: { 
    width: '100%', 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8,
    paddingRight: 12,
  },
  emailInput: { 
    flex: 1, 
    padding: 12, 
    fontSize: 16,
  },
  emailSuffix: { 
    fontSize: 16, 
    color: '#666',
    paddingLeft: 4,
  },
  button: { 
    width: '100%', 
    backgroundColor: '#007AFF', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
