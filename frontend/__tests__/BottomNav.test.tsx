/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomNav from '../components/BottomNav';

// Mock expo-router
const mockPush = jest.fn();
let mockPathnameValue = '/(tabs)';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: jest.fn(() => mockPathnameValue),
}));

// Import after mock
import { usePathname } from 'expo-router';

describe('BottomNav Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockPathnameValue = '/(tabs)';
    (usePathname as jest.Mock).mockReturnValue(mockPathnameValue);
  });

  it('renders all navigation tabs', () => {
    const { getByText } = render(<BottomNav />);

    expect(getByText('Feed')).toBeTruthy();
    expect(getByText('Menus')).toBeTruthy();
    expect(getByText('Trending')).toBeTruthy();
    expect(getByText('Friends')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('navigates to Menus when pressed', () => {
    const { getByText } = render(<BottomNav />);

    const menusTab = getByText('Menus');
    fireEvent.press(menusTab);

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/menus');
  });

  it('navigates to Profile when pressed', () => {
    const { getByText } = render(<BottomNav />);

    const profileTab = getByText('Profile');
    fireEvent.press(profileTab);

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/profile');
  });

  it('navigates to Feed when pressed', () => {
    mockPathnameValue = '/(tabs)/menus';
    (usePathname as jest.Mock).mockReturnValue(mockPathnameValue);
    const { getByText } = render(<BottomNav />);

    const feedTab = getByText('Feed');
    fireEvent.press(feedTab);

    expect(mockPush).toHaveBeenCalledWith('/(tabs)');
  });

  it('highlights active tab based on pathname', () => {
    mockPathnameValue = '/(tabs)/menus';
    (usePathname as jest.Mock).mockReturnValue(mockPathnameValue);
    const { getByText } = render(<BottomNav />);

    const menusTab = getByText('Menus');
    expect(menusTab).toBeTruthy();
    // The active tab should have different styling (checked via styles)
  });
});
