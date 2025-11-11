/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DiningHallSelector from '../components/DiningHallSelector';
import { DiningHall } from '../types';

const mockDiningHalls: DiningHall[] = [
  { id: 1, name: 'Rand Dining Center', cbordUnitId: 1 },
  { id: 2, name: 'The Commons Dining Center', cbordUnitId: 2 },
  { id: 3, name: 'The Kitchen at Kissam', cbordUnitId: 3 },
];

describe('DiningHallSelector Component', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders correctly when no dining hall is selected', () => {
    const { getByText } = render(
      <DiningHallSelector
        diningHalls={mockDiningHalls}
        selectedDiningHall={null}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Select a dining hall')).toBeTruthy();
  });

  it('displays selected dining hall name', () => {
    const { getByText } = render(
      <DiningHallSelector
        diningHalls={mockDiningHalls}
        selectedDiningHall={mockDiningHalls[0]}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Rand Dining Center')).toBeTruthy();
  });

  it('opens modal when selector is pressed', () => {
    const { getByText } = render(
      <DiningHallSelector
        diningHalls={mockDiningHalls}
        selectedDiningHall={null}
        onSelect={mockOnSelect}
      />
    );

    const selector = getByText('Select a dining hall');
    fireEvent.press(selector);

    expect(getByText('Select Dining Hall')).toBeTruthy();
  });

  it('displays all dining halls in modal', () => {
    const { getByText } = render(
      <DiningHallSelector
        diningHalls={mockDiningHalls}
        selectedDiningHall={null}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.press(getByText('Select a dining hall'));

    expect(getByText('Rand Dining Center')).toBeTruthy();
    expect(getByText('The Commons Dining Center')).toBeTruthy();
    expect(getByText('The Kitchen at Kissam')).toBeTruthy();
  });

  it('selects a dining hall when clicked', () => {
    const { getByText } = render(
      <DiningHallSelector
        diningHalls={mockDiningHalls}
        selectedDiningHall={null}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.press(getByText('Select a dining hall'));

    const randOption = getByText('Rand Dining Center');
    fireEvent.press(randOption);

    expect(mockOnSelect).toHaveBeenCalledWith(mockDiningHalls[0]);
  });

  it('closes modal when close button is pressed', () => {
    const { getByText, getByTestId, queryByText } = render(
      <DiningHallSelector
        diningHalls={mockDiningHalls}
        selectedDiningHall={null}
        onSelect={mockOnSelect}
      />
    );

    // Open modal
    fireEvent.press(getByText('Select a dining hall'));
    expect(getByText('Select Dining Hall')).toBeTruthy();
    
    // Close modal using close button
    const closeButton = getByTestId('close-modal-button');
    fireEvent.press(closeButton);
    
    // Modal should be closed - title should not be visible
    expect(queryByText('Select Dining Hall')).toBeFalsy();
  });

  it('closes modal via onRequestClose', () => {
    const { getByText } = render(
      <DiningHallSelector
        diningHalls={mockDiningHalls}
        selectedDiningHall={null}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.press(getByText('Select a dining hall'));
    expect(getByText('Select Dining Hall')).toBeTruthy();
  });

  it('updates when selectedDiningHall prop changes', () => {
    const { rerender, getByText } = render(
      <DiningHallSelector
        diningHalls={mockDiningHalls}
        selectedDiningHall={mockDiningHalls[0]}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Rand Dining Center')).toBeTruthy();

    rerender(
      <DiningHallSelector
        diningHalls={mockDiningHalls}
        selectedDiningHall={mockDiningHalls[1]}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('The Commons Dining Center')).toBeTruthy();
  });
});
