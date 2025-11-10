import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import VerificationScreen from './VerificationScreen';

type AuthScreen = 'login' | 'signup' | 'verification';

interface AuthNavigatorProps {
  children: React.ReactNode;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A574" />
      </View>
    );
  }

  // If authenticated, show the main app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, show auth screens
  const handleSignupSuccess = (email: string) => {
    setPendingVerificationEmail(email);
    setCurrentScreen('verification');
  };

  const handleBackToSignup = () => {
    setCurrentScreen('signup');
  };

  switch (currentScreen) {
    case 'login':
      return (
        <LoginScreen onSwitchToSignup={() => setCurrentScreen('signup')} />
      );
    case 'signup':
      return (
        <SignupScreen
          onSwitchToLogin={() => setCurrentScreen('login')}
          onSignupSuccess={handleSignupSuccess}
        />
      );
    case 'verification':
      return (
        <VerificationScreen
          email={pendingVerificationEmail}
          onBack={handleBackToSignup}
        />
      );
    default:
      return (
        <LoginScreen onSwitchToSignup={() => setCurrentScreen('signup')} />
      );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AuthNavigator;