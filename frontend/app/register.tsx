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

  const handleEmailChange = (text: string) => {
    // Remove @vanderbilt.edu if user tries to type it
    const cleaned = text.replace('@vanderbilt.edu', '').replace('@', '');
    setEmailPrefix(cleaned);
  };

  const getFullEmail = () => {
    return emailPrefix.trim() + '@vanderbilt.edu';
  };

  const handleRegister = async () => {
    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !emailPrefix.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    // Validate email prefix (basic check)
    if (emailPrefix.trim().length === 0) {
      Alert.alert('Invalid Email', 'Please enter your Vanderbilt email username');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const fullEmail = getFullEmail();
      await api.authRegister({ 
        first_name: firstName.trim(), 
        last_name: lastName.trim(), 
        email: fullEmail.toLowerCase(), 
        password 
      });
      // Navigate to verify screen and pass email so user can enter code
      router.push(`/verify?email=${encodeURIComponent(fullEmail.toLowerCase())}`);
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.message || 'Unable to register. Please try again.';
      Alert.alert('Registration failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Vanderbilt students only</Text>
      <TextInput placeholder="First name" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Last name" value={lastName} onChangeText={setLastName} style={styles.input} />
      <View style={styles.emailContainer}>
        <TextInput 
          placeholder="username" 
          value={emailPrefix} 
          onChangeText={handleEmailChange} 
          style={styles.emailInput} 
          keyboardType="email-address" 
          autoCapitalize="none" 
        />
        <Text style={styles.emailSuffix}>@vanderbilt.edu</Text>
      </View>
      <TextInput placeholder="Password (min 6 characters)" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
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
  input: { width: '100%', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
  emailContainer: { 
    width: '100%', 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    marginBottom: 12,
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
  button: { width: '100%', backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
