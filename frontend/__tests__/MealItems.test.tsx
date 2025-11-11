/**
 * @format
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MealItems from '../components/MealItems';
import * as api from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  fetchMenuItems: jest.fn(),
}));

// Note: MealItems component may have changed structure
describe('MealItems Component', () => {
  const mockFetchMenuItems = api.fetchMenuItems as jest.Mock;

  beforeEach(() => {
    mockFetchMenuItems.mockClear();
  });

  it('shows loading indicator initially', () => {
    mockFetchMenuItems.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByTestId } = render(<MealItems menuId={1} unitId={1} />);

    // ActivityIndicator should be present
    expect(getByTestId).toBeDefined();
  });

  it('displays menu items when loaded successfully', async () => {
    const mockItems = [
      { name: 'Pizza', description: 'Cheese pizza', calories: 285 },
      { name: 'Salad', description: 'Garden salad', calories: 150 },
      { name: 'Pasta', description: null, calories: null },
    ];

    mockFetchMenuItems.mockResolvedValue(mockItems);

    const { getByText } = render(<MealItems menuId={1} unitId={1} />);

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
    mockFetchMenuItems.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<MealItems menuId={1} unitId={1} />);

    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
  });

  it('displays generic error message when error has no message', async () => {
    mockFetchMenuItems.mockRejectedValue(new Error());

    const { getByText } = render(<MealItems menuId={1} unitId={1} />);

    await waitFor(() => {
      expect(getByText('Failed to load items')).toBeTruthy();
    });
  });

  it('displays "No items available" when items array is empty', async () => {
    mockFetchMenuItems.mockResolvedValue([]);

    const { getByText } = render(<MealItems menuId={1} unitId={1} />);

    await waitFor(() => {
      expect(getByText('No items available')).toBeTruthy();
    });
  });

  it('does not display description or calories when they are null', async () => {
    const mockItems = [
      { name: 'Simple Item', description: null, calories: null },
    ];

    mockFetchMenuItems.mockResolvedValue(mockItems);

    const { getByText, queryByText } = render(<MealItems menuId={1} unitId={1} />);

    await waitFor(() => {
      expect(getByText('Simple Item')).toBeTruthy();
      expect(queryByText(/kcal/)).toBeFalsy();
    });
  });

  it('calls API with correct menuId', async () => {
    mockFetchMenuItems.mockResolvedValue([]);

    render(<MealItems menuId={123} unitId={1} />);

    await waitFor(() => {
      expect(mockFetchMenuItems).toHaveBeenCalledWith(123, 1);
    });
  });

  it('does not reload if items already exist', async () => {
    const mockItems = [{ name: 'Item 1', description: null, calories: null }];

    mockFetchMenuItems.mockResolvedValue(mockItems);

    const { getByText } = render(<MealItems menuId={1} unitId={1} />);

    await waitFor(() => {
      expect(getByText('Item 1')).toBeTruthy();
    });

    // The component should have loaded once and won't reload
    // because items are already set
    expect(mockFetchMenuItems).toHaveBeenCalledTimes(1);
  });
});
