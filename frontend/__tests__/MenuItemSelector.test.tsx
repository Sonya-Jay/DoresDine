/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MenuItemSelector from '../components/MenuItemSelector';

describe('MenuItemSelector', () => {
  const mockOnItemsChange = jest.fn();

  beforeEach(() => {
    mockOnItemsChange.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <MenuItemSelector selectedItems={[]} onItemsChange={mockOnItemsChange} />,
    );

    expect(getByText('What did you eat?')).toBeTruthy();
  });

  it('expands when header is pressed', () => {
    const { getByText } = render(
      <MenuItemSelector selectedItems={[]} onItemsChange={mockOnItemsChange} />,
    );

    const header = getByText('What did you eat?');
    fireEvent.press(header);

    expect(getByText('Type dish names')).toBeTruthy();
  });

  it('displays selected items when expanded', () => {
    const selectedItems = ['Pizza', 'Salad'];
    const { getByText } = render(
      <MenuItemSelector
        selectedItems={selectedItems}
        onItemsChange={mockOnItemsChange}
      />,
    );

    // expand the component
    const header = getByText('What did you eat?');
    fireEvent.press(header);

    // check for selected items
    expect(getByText('Pizza')).toBeTruthy();
    expect(getByText('Salad')).toBeTruthy();
  });
});
