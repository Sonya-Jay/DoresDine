/**
 * @format
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock the Alert component
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('App', () => {
  it('renders correctly', () => {
    render(<App />);
    // Just check that the app renders without crashing
    // We can add more specific tests later
    expect(true).toBe(true);
  });
});
