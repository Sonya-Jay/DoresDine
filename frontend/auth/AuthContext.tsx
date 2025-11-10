import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { Alert } from 'react-native';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;   
  login: (email: string, password: string) => Promise<boolean>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; requiresVerification: boolean }>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resendVerificationCode: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // Check for stored auth token on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsVerified(parsedUser.isVerified || false); 
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
        return false;
      }

      // Store auth token and user data
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      setUser(data.user);
      setIsVerified(data.user.isVerified || false); 
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Network Error', 'Could not connect to server');
      return false;
    }
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; requiresVerification: boolean }> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Signup Failed', data.error || 'Could not create account');
        return { success: false, requiresVerification: false };
      }

      // Return success and indicate that verification is needed
      return { success: true, requiresVerification: true };
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Network Error', 'Could not connect to server');
      return { success: false, requiresVerification: false };
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Verification Failed', data.error || 'Invalid verification code');
        return false;
      }

      // After successful verification, log the user in
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Network Error', 'Could not connect to server');
      return false;
    }
  };

  const resendVerificationCode = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'Could not resend verification code');
        return false;
      }

      Alert.alert('Success', 'Verification code sent to your email');
      return true;
    } catch (error) {
      console.error('Resend verification error:', error);
      Alert.alert('Network Error', 'Could not connect to server');
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isVerified,
        login,
        signup,
        verifyEmail,
        logout,
        resendVerificationCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};