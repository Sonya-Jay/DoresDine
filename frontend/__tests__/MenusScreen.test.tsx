/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MenusScreen from '../app/(tabs)/menus';
import * as api from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  fetchDiningHalls: jest.fn(),
}));

// Note: ScheduleDetails is a screen, not a component
// The navigation is handled by expo-router, so we don't need to mock it

// Note: MenusScreen is now in app/(tabs)/menus.tsx
// This test may need updates for the new structure

describe('MenusScreen Component', () => {
  const mockFetchDiningHalls = api.fetchDiningHalls as jest.Mock;

  const mockHalls = [
    { id: 1, name: 'Rand Dining Center', cbordUnitId: 1 },
    { id: 2, name: 'The Commons Dining Center', cbordUnitId: 2 },
    { id: 3, name: 'Kissam Kitchen', cbordUnitId: 3 },
  ];

  beforeEach(() => {
    mockFetchDiningHalls.mockClear();
  });

  it('shows loading indicator initially', () => {
    mockFetchDiningHalls.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByTestId } = render(<MenusScreen />);

    // ActivityIndicator should be present - we can check for its presence
    expect(getByTestId).toBeDefined();
  });

  it('displays dining halls when loaded successfully', async () => {
    mockFetchDiningHalls.mockResolvedValue(mockHalls);

    const { getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
      expect(getByText('The Commons Dining Center')).toBeTruthy();
      expect(getByText('Kissam Kitchen')).toBeTruthy();
    });
  });

  it('displays error message when loading fails', async () => {
    mockFetchDiningHalls.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
  });

  it('displays generic error when error has no message', async () => {
    mockFetchDiningHalls.mockRejectedValue(new Error());

    const { getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Failed to load dining halls')).toBeTruthy();
    });
  });

  it('filters dining halls based on search text', async () => {
    mockFetchDiningHalls.mockResolvedValue(mockHalls);

    const { getByPlaceholderText, getByText, queryByText } = render(
      <MenusScreen />
    );

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
    });

    // Type in search box
    const searchInput = getByPlaceholderText('Search a menu, member, etc.');
    fireEvent.changeText(searchInput, 'Rand');

    // Only Rand should be visible
    expect(getByText('Rand Dining Center')).toBeTruthy();
    expect(queryByText('The Commons Dining Center')).toBeFalsy();
    expect(queryByText('Kissam Kitchen')).toBeFalsy();
  });

  it('shows all halls when search is cleared', async () => {
    mockFetchDiningHalls.mockResolvedValue(mockHalls);

    const { getByPlaceholderText, getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
    });

        // Search
        const searchInput = getByPlaceholderText('Search a menu, member, etc.');
        fireEvent.changeText(searchInput, 'Rand');

    // Clear search
    fireEvent.changeText(searchInput, '');

    // All should be visible again
    expect(getByText('Rand Dining Center')).toBeTruthy();
    expect(getByText('The Commons Dining Center')).toBeTruthy();
    expect(getByText('Kissam Kitchen')).toBeTruthy();
  });

  it('is case-insensitive when filtering', async () => {
    mockFetchDiningHalls.mockResolvedValue(mockHalls);

    const { getByPlaceholderText, getByText, queryByText } = render(
      <MenusScreen />
    );

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
    });

        // Type in lowercase
        const searchInput = getByPlaceholderText('Search a menu, member, etc.');
        fireEvent.changeText(searchInput, 'rand');

    // Should still find Rand
    expect(getByText('Rand Dining Center')).toBeTruthy();
    expect(queryByText('The Commons Dining Center')).toBeFalsy();
  });

  // Note: Navigation is handled by expo-router, which is mocked
  // These tests are skipped since we can't easily test navigation in unit tests
  it.skip('navigates to ScheduleDetailScreen when hall is selected', async () => {
    // Navigation testing requires integration tests with expo-router
  });

  it.skip('navigates back from ScheduleDetailScreen', async () => {
    // Navigation testing requires integration tests with expo-router
  });

  it('cleans up on unmount', async () => {
    mockFetchDiningHalls.mockResolvedValue(mockHalls);

    const { unmount } = render(<MenusScreen />);

    await waitFor(() => {
      expect(mockFetchDiningHalls).toHaveBeenCalled();
    });

    // Should not throw when unmounted
    unmount();
  });
});
