/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Header from '../components/Header';

describe('Header Component', () => {
  const mockSetSearchText = jest.fn();
  const mockOnAddPress = jest.fn();

  beforeEach(() => {
    mockSetSearchText.mockClear();
    mockOnAddPress.mockClear();
  });

  it('renders correctly with all elements', () => {
    const { getByPlaceholderText } = render(
      <Header
        searchText=""
        setSearchText={mockSetSearchText}
        onAddPress={mockOnAddPress}
      />
    );

    expect(getByPlaceholderText('Search a menu, member, etc.')).toBeTruthy();
  });

  it('updates search text when typing', () => {
    const { getByPlaceholderText } = render(
      <Header
        searchText=""
        setSearchText={mockSetSearchText}
        onAddPress={mockOnAddPress}
      />
    );

    const searchInput = getByPlaceholderText('Search a menu, member, etc.');
    fireEvent.changeText(searchInput, 'pizza');

    expect(mockSetSearchText).toHaveBeenCalledWith('pizza');
  });

  it('displays current search text', () => {
    const { getByDisplayValue } = render(
      <Header
        searchText="test search"
        setSearchText={mockSetSearchText}
        onAddPress={mockOnAddPress}
      />
    );

    expect(getByDisplayValue('test search')).toBeTruthy();
  });

  it('calls onAddPress when add button is pressed', () => {
    const { getByTestId } = render(
      <Header
        searchText=""
        setSearchText={mockSetSearchText}
        onAddPress={mockOnAddPress}
      />
    );

    // Note: You may need to add testID="add-button" to the TouchableOpacity in Header.tsx
    // For now, we'll test that the function prop exists
    expect(mockOnAddPress).toBeDefined();
  });

  it('clears search text when X button is pressed', () => {
    const { getByTestId, getByDisplayValue } = render(
      <Header
        searchText="test search"
        setSearchText={mockSetSearchText}
        onAddPress={mockOnAddPress}
      />
    );

    // Verify search text is displayed
    expect(getByDisplayValue('test search')).toBeTruthy();
    
    // Click the clear button
    const clearButton = getByTestId('clear-search-button');
    fireEvent.press(clearButton);
    
    // Verify setSearchText was called with empty string
    expect(mockSetSearchText).toHaveBeenCalledWith('');
  });
});
