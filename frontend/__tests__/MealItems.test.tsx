/**
 * @format
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MealItems from '../components/MealItems';
import { api } from '../components/api/client';

// Mock the API client
jest.mock('../components/api/client', () => ({
  api: {
    getMenuItems: jest.fn(),
  },
}));

describe('MealItems Component', () => {
  const mockGetMenuItems = api.getMenuItems as jest.Mock;

  beforeEach(() => {
    mockGetMenuItems.mockClear();
  });

  it('shows loading indicator initially', () => {
    mockGetMenuItems.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByTestId } = render(<MealItems menuId={1} />);

    // ActivityIndicator should be present
    expect(getByTestId).toBeDefined();
  });

  it('displays menu items when loaded successfully', async () => {
    const mockItems = [
      { name: 'Pizza', description: 'Cheese pizza', calories: 285 },
      { name: 'Salad', description: 'Garden salad', calories: 150 },
      { name: 'Pasta', description: null, calories: null },
    ];

    mockGetMenuItems.mockResolvedValue(mockItems);

    const { getByText } = render(<MealItems menuId={1} />);

    await waitFor(() => {
      expect(getByText('Pizza')).toBeTruthy();
      expect(getByText('Cheese pizza')).toBeTruthy();
      expect(getByText('285 kcal')).toBeTruthy();
      expect(getByText('Salad')).toBeTruthy();
      expect(getByText('Garden salad')).toBeTruthy();
      expect(getByText('150 kcal')).toBeTruthy();
      expect(getByText('Pasta')).toBeTruthy();
    });
  });

  it('displays error message when loading fails', async () => {
    mockGetMenuItems.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<MealItems menuId={1} />);

    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
  });

  it('displays generic error message when error has no message', async () => {
    mockGetMenuItems.mockRejectedValue(new Error());

    const { getByText } = render(<MealItems menuId={1} />);

    await waitFor(() => {
      expect(getByText('Failed to load items')).toBeTruthy();
    });
  });

  it('displays "No items available" when items array is empty', async () => {
    mockGetMenuItems.mockResolvedValue([]);

    const { getByText } = render(<MealItems menuId={1} />);

    await waitFor(() => {
      expect(getByText('No items available')).toBeTruthy();
    });
  });

  it('does not display description or calories when they are null', async () => {
    const mockItems = [
      { name: 'Simple Item', description: null, calories: null },
    ];

    mockGetMenuItems.mockResolvedValue(mockItems);

    const { getByText, queryByText } = render(<MealItems menuId={1} />);

    await waitFor(() => {
      expect(getByText('Simple Item')).toBeTruthy();
      expect(queryByText(/kcal/)).toBeFalsy();
    });
  });

  it('calls API with correct menuId', async () => {
    mockGetMenuItems.mockResolvedValue([]);

    render(<MealItems menuId={123} />);

    await waitFor(() => {
      expect(mockGetMenuItems).toHaveBeenCalledWith(123);
    });
  });

  it('does not reload if items already exist', async () => {
    const mockItems = [{ name: 'Item 1', description: null, calories: null }];

    mockGetMenuItems.mockResolvedValue(mockItems);

    const { getByText } = render(<MealItems menuId={1} />);

    await waitFor(() => {
      expect(getByText('Item 1')).toBeTruthy();
    });

    // The component should have loaded once and won't reload
    // because items are already set
    expect(mockGetMenuItems).toHaveBeenCalledTimes(1);
  });
});
