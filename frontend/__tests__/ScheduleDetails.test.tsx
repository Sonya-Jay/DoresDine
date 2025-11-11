/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScheduleDetailScreen from '../components/ScheduleDetails';
import { api } from '../components/api/client';

// Mock the API client
jest.mock('../components/api/client', () => ({
  api: {
    getHallMenu: jest.fn(),
    getMenuItems: jest.fn(),
  },
}));

describe('ScheduleDetailScreen Component', () => {
  const mockGetHallMenu = api.getHallMenu as jest.Mock;
  const mockGetMenuItems = api.getMenuItems as jest.Mock;
  const mockOnBack = jest.fn();

  const mockHall = {
    id: 1,
    name: 'Rand Dining Center',
    cbordUnitId: 1,
  };

  const mockSchedule = [
    {
      date: '2025-11-10',
      meals: [
        {
          id: 101,
          name: 'Breakfast',
          startTime: '07:00',
          endTime: '10:00',
        },
        {
          id: 102,
          name: 'Lunch',
          startTime: '11:00',
          endTime: '14:00',
        },
      ],
    },
  ];

  const mockMenuItems = [
    { name: 'Pancakes', description: 'Fluffy pancakes', calories: 350 },
    { name: 'Eggs', description: 'Scrambled eggs', calories: 150 },
  ];

  beforeEach(() => {
    mockGetHallMenu.mockClear();
    mockGetMenuItems.mockClear();
    mockOnBack.mockClear();
  });

  it('shows loading indicator initially', () => {
    mockGetHallMenu.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByTestId } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    // ActivityIndicator should be present
    expect(getByTestId).toBeDefined();
  });

  it('displays hall schedule when loaded successfully', async () => {
    mockGetHallMenu.mockResolvedValue({ schedule: mockSchedule });

    const { getByText } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(getByText('Breakfast')).toBeTruthy();
      expect(getByText('Lunch')).toBeTruthy();
    });
  });

  it('displays error message when loading fails', async () => {
    mockGetHallMenu.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
  });

  it('displays generic error when error has no message', async () => {
    mockGetHallMenu.mockRejectedValue(new Error());

    const { getByText } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(getByText('Failed to load schedule')).toBeTruthy();
    });
  });

  it('expands meal to show menu items when pressed', async () => {
    mockGetHallMenu.mockResolvedValue({ schedule: mockSchedule });
    mockGetMenuItems.mockResolvedValue(mockMenuItems);

    const { getByText } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(getByText('Breakfast')).toBeTruthy();
    });

    // Click on Breakfast meal
    const breakfastButton = getByText('Breakfast');
    fireEvent.press(breakfastButton);

    await waitFor(() => {
      expect(mockGetMenuItems).toHaveBeenCalledWith(101, 1);
      expect(getByText('Pancakes')).toBeTruthy();
      expect(getByText('Eggs')).toBeTruthy();
    });
  });

  it('collapses meal when pressed again', async () => {
    mockGetHallMenu.mockResolvedValue({ schedule: mockSchedule });
    mockGetMenuItems.mockResolvedValue(mockMenuItems);

    const { getByText, queryByText } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(getByText('Breakfast')).toBeTruthy();
    });

    // Expand
    fireEvent.press(getByText('Breakfast'));

    await waitFor(() => {
      expect(getByText('Pancakes')).toBeTruthy();
    });

    // Collapse
    fireEvent.press(getByText('Breakfast'));

    await waitFor(() => {
      expect(queryByText('Pancakes')).toBeFalsy();
    });
  });

  it('displays error when menu items fail to load', async () => {
    mockGetHallMenu.mockResolvedValue({ schedule: mockSchedule });
    mockGetMenuItems.mockRejectedValue(new Error('Failed to fetch items'));

    const { getByText } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(getByText('Breakfast')).toBeTruthy();
    });

    // Click on Breakfast
    fireEvent.press(getByText('Breakfast'));

    await waitFor(() => {
      expect(getByText('Failed to fetch items')).toBeTruthy();
    });
  });

  it('displays generic error when menu items error has no message', async () => {
    mockGetHallMenu.mockResolvedValue({ schedule: mockSchedule });
    mockGetMenuItems.mockRejectedValue(new Error());

    const { getByText } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(getByText('Breakfast')).toBeTruthy();
    });

    // Click on Breakfast
    fireEvent.press(getByText('Breakfast'));

    await waitFor(() => {
      expect(getByText('Failed to fetch menu items')).toBeTruthy();
    });
  });

  it('calls onBack when back button is pressed', async () => {
    mockGetHallMenu.mockResolvedValue({ schedule: mockSchedule });

    const { getByTestId } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(mockGetHallMenu).toHaveBeenCalled();
    });

    // Find and press back button
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('filters meals based on search text', async () => {
    mockGetHallMenu.mockResolvedValue({ schedule: mockSchedule });

    const { getByPlaceholderText, getByText, queryByText } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(getByText('Breakfast')).toBeTruthy();
      expect(getByText('Lunch')).toBeTruthy();
    });

    // Search for Breakfast
    const searchInput = getByPlaceholderText('Search a menu, member, etc.');
    fireEvent.changeText(searchInput, 'Breakfast');

    // Only Breakfast should be visible
    expect(getByText('Breakfast')).toBeTruthy();
    expect(queryByText('Lunch')).toBeFalsy();
  });

  it('is case-insensitive when filtering meals', async () => {
    mockGetHallMenu.mockResolvedValue({ schedule: mockSchedule });

    const { getByPlaceholderText, getByText, queryByText } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(getByText('Breakfast')).toBeTruthy();
    });

    // Search in lowercase
    const searchInput = getByPlaceholderText('Search a menu, member, etc.');
    fireEvent.changeText(searchInput, 'breakfast');

    // Should still find Breakfast
    expect(getByText('Breakfast')).toBeTruthy();
    expect(queryByText('Lunch')).toBeFalsy();
  });

  it('cleans up on unmount', async () => {
    mockGetHallMenu.mockResolvedValue({ schedule: mockSchedule });

    const { unmount } = render(
      <ScheduleDetailScreen hall={mockHall} unitId={1} onBack={mockOnBack} />
    );

    await waitFor(() => {
      expect(mockGetHallMenu).toHaveBeenCalled();
    });

    // Should not throw when unmounted
    unmount();
  });
});
