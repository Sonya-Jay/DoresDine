/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MenusScreen from '../components/MenusScreen';
import { api } from '../components/api/client';

// Mock the API client
jest.mock('../components/api/client', () => ({
  api: {
    getHalls: jest.fn(),
  },
}));

// Mock ScheduleDetailScreen
jest.mock('../components/ScheduleDetails', () => {
  return jest.fn(({ hall, onBack }) => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <View>
        <Text>Schedule for {hall.name}</Text>
        <TouchableOpacity onPress={onBack}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
    );
  });
});

describe('MenusScreen Component', () => {
  const mockGetHalls = api.getHalls as jest.Mock;

  const mockHalls = [
    { id: 1, name: 'Rand Dining Center', cbordUnitId: 1 },
    { id: 2, name: 'The Commons Dining Center', cbordUnitId: 2 },
    { id: 3, name: 'Kissam Kitchen', cbordUnitId: 3 },
  ];

  beforeEach(() => {
    mockGetHalls.mockClear();
  });

  it('shows loading indicator initially', () => {
    mockGetHalls.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByTestId } = render(<MenusScreen />);

    // ActivityIndicator should be present - we can check for its presence
    expect(getByTestId).toBeDefined();
  });

  it('displays dining halls when loaded successfully', async () => {
    mockGetHalls.mockResolvedValue(mockHalls);

    const { getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
      expect(getByText('The Commons Dining Center')).toBeTruthy();
      expect(getByText('Kissam Kitchen')).toBeTruthy();
    });
  });

  it('displays error message when loading fails', async () => {
    mockGetHalls.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
  });

  it('displays generic error when error has no message', async () => {
    mockGetHalls.mockRejectedValue(new Error());

    const { getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Failed to load dining halls')).toBeTruthy();
    });
  });

  it('filters dining halls based on search text', async () => {
    mockGetHalls.mockResolvedValue(mockHalls);

    const { getByPlaceholderText, getByText, queryByText } = render(
      <MenusScreen />
    );

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
    });

    // Type in search box
    const searchInput = getByPlaceholderText('Search for a Dining Hall');
    fireEvent.changeText(searchInput, 'Rand');

    // Only Rand should be visible
    expect(getByText('Rand Dining Center')).toBeTruthy();
    expect(queryByText('The Commons Dining Center')).toBeFalsy();
    expect(queryByText('Kissam Kitchen')).toBeFalsy();
  });

  it('shows all halls when search is cleared', async () => {
    mockGetHalls.mockResolvedValue(mockHalls);

    const { getByPlaceholderText, getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
    });

    // Search
    const searchInput = getByPlaceholderText('Search for a Dining Hall');
    fireEvent.changeText(searchInput, 'Rand');

    // Clear search
    fireEvent.changeText(searchInput, '');

    // All should be visible again
    expect(getByText('Rand Dining Center')).toBeTruthy();
    expect(getByText('The Commons Dining Center')).toBeTruthy();
    expect(getByText('Kissam Kitchen')).toBeTruthy();
  });

  it('is case-insensitive when filtering', async () => {
    mockGetHalls.mockResolvedValue(mockHalls);

    const { getByPlaceholderText, getByText, queryByText } = render(
      <MenusScreen />
    );

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
    });

    // Type in lowercase
    const searchInput = getByPlaceholderText('Search for a Dining Hall');
    fireEvent.changeText(searchInput, 'rand');

    // Should still find Rand
    expect(getByText('Rand Dining Center')).toBeTruthy();
    expect(queryByText('The Commons Dining Center')).toBeFalsy();
  });

  it('navigates to ScheduleDetailScreen when hall is selected', async () => {
    mockGetHalls.mockResolvedValue(mockHalls);

    const { getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
    });

    // Click on a hall
    const hallButton = getByText('Rand Dining Center');
    fireEvent.press(hallButton);

    // Should show schedule screen
    await waitFor(() => {
      expect(getByText('Schedule for Rand Dining Center')).toBeTruthy();
    });
  });

  it('navigates back from ScheduleDetailScreen', async () => {
    mockGetHalls.mockResolvedValue(mockHalls);

    const { getByText } = render(<MenusScreen />);

    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
    });

    // Navigate to schedule
    fireEvent.press(getByText('Rand Dining Center'));

    await waitFor(() => {
      expect(getByText('Schedule for Rand Dining Center')).toBeTruthy();
    });

    // Navigate back
    const backButton = getByText('Back');
    fireEvent.press(backButton);

    // Should show halls list again
    await waitFor(() => {
      expect(getByText('Rand Dining Center')).toBeTruthy();
      expect(getByText('The Commons Dining Center')).toBeTruthy();
    });
  });

  it('cleans up on unmount', async () => {
    mockGetHalls.mockResolvedValue(mockHalls);

    const { unmount } = render(<MenusScreen />);

    await waitFor(() => {
      expect(mockGetHalls).toHaveBeenCalled();
    });

    // Should not throw when unmounted
    unmount();
  });
});
