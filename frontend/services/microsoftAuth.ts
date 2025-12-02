import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Complete the auth session (required for Expo)
WebBrowser.maybeCompleteAuthSession();

// Azure AD configuration
const AZURE_TENANT_ID = process.env.EXPO_PUBLIC_AZURE_TENANT_ID || '';
const AZURE_CLIENT_ID = process.env.EXPO_PUBLIC_AZURE_CLIENT_ID || '';

// Microsoft OAuth endpoints
const discovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
};

// Scopes required for user info
const scopes = ['openid', 'profile', 'email', 'User.Read'];

// Get redirect URI based on platform
function getRedirectUri(): string {
  if (Platform.OS === 'web') {
    // For web, use the current origin
    return `${window.location.origin}/auth/microsoft/callback`;
  }
  
  // For mobile, use the scheme from app.json or expo config
  const scheme = Constants.expoConfig?.scheme || 'doresdine';
  return `${scheme}://auth/microsoft/callback`;
}

export interface MicrosoftAuthResult {
  accessToken: string;
  idToken?: string;
}

/**
 * Authenticate with Microsoft Azure AD
 * Returns the access token that can be sent to the backend
 */
export async function signInWithMicrosoft(): Promise<MicrosoftAuthResult> {
  if (!AZURE_CLIENT_ID || !AZURE_TENANT_ID) {
    throw new Error('Azure AD configuration is missing. Please set EXPO_PUBLIC_AZURE_CLIENT_ID and EXPO_PUBLIC_AZURE_TENANT_ID');
  }

  try {
    // Create auth request - use ID token for backend verification
    const request = new AuthSession.AuthRequest({
      clientId: AZURE_CLIENT_ID,
      scopes,
      redirectUri: getRedirectUri(),
      responseType: AuthSession.ResponseType.IdToken, // Use ID token for backend verification
      additionalParameters: {
        // Restrict to Vanderbilt tenant
        domain_hint: 'vanderbilt.edu',
      },
      extraQueryParams: {
        // Force account selection and restrict to Vanderbilt tenant
        prompt: 'select_account',
      },
    });

    // Perform authentication
    const discovery = getDiscovery();
    const result = await request.promptAsync(discovery, {
      useProxy: Platform.OS === 'web',
    });

    if (result.type === 'success') {
      // Return ID token for backend verification
      const idToken = result.params.id_token;
      if (!idToken) {
        throw new Error('No ID token received from Microsoft');
      }
      return {
        accessToken: idToken, // Actually the ID token
        idToken: idToken,
      };
    } else if (result.type === 'error') {
      throw new Error(result.error?.message || 'Microsoft authentication failed');
    } else {
      throw new Error('Authentication was cancelled');
    }
  } catch (error: any) {
    console.error('Microsoft authentication error:', error);
    throw error;
  }
}

/**
 * Get user info from Microsoft using the access token
 * This is optional - the backend will verify the token and extract user info
 */
export async function getMicrosoftUserInfo(accessToken: string): Promise<any> {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Microsoft');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Microsoft user info:', error);
    throw error;
  }
}

