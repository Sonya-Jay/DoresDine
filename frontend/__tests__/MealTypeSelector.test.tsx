/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MealTypeSelector from '../components/MealTypeSelector';
import { MEAL_TYPES } from '../data/diningHalls';

describe('MealTypeSelector Component', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders correctly when no meal type is selected', () => {
    const { getByText } = render(
      <MealTypeSelector
        mealTypes={MEAL_TYPES}
        selectedMealType={null}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Select meal type')).toBeTruthy();
  });

  it('displays selected meal type', () => {
    const { getByText } = render(
      <MealTypeSelector
        mealTypes={MEAL_TYPES}
        selectedMealType="Breakfast"
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Breakfast')).toBeTruthy();
  });

  it('opens modal when selector is pressed', () => {
    const { getByText } = render(
      <MealTypeSelector
        mealTypes={MEAL_TYPES}
        selectedMealType={null}
        onSelect={mockOnSelect}
      />
    );

    const selector = getByText('Select meal type');
    fireEvent.press(selector);

    expect(getByText('Select Meal Type')).toBeTruthy();
  });

  it('displays all meal types in modal', () => {
    const { getByText } = render(
      <MealTypeSelector
        mealTypes={MEAL_TYPES}
        selectedMealType={null}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.press(getByText('Select meal type'));

    expect(getByText('Breakfast')).toBeTruthy();
    expect(getByText('Lunch')).toBeTruthy();
    expect(getByText('Dinner')).toBeTruthy();
    expect(getByText('Late Night')).toBeTruthy();
    expect(getByText('Brunch')).toBeTruthy();
  });

  it('selects a meal type when clicked', () => {
    const { getByText } = render(
      <MealTypeSelector
        mealTypes={MEAL_TYPES}
        selectedMealType={null}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.press(getByText('Select meal type'));

    const lunchOption = getByText('Lunch');
    fireEvent.press(lunchOption);

    expect(mockOnSelect).toHaveBeenCalledWith('Lunch');
  });

  it('closes modal when close button is pressed', () => {
    const { getByText, getByTestId, queryByText } = render(
      <MealTypeSelector
        mealTypes={MEAL_TYPES}
        selectedMealType={null}
        onSelect={mockOnSelect}
      />
    );

    // Open modal
    fireEvent.press(getByText('Select meal type'));
    expect(getByText('Select Meal Type')).toBeTruthy();
    
    // Close modal using close button
    const closeButton = getByTestId('close-modal-button');
    fireEvent.press(closeButton);
    
    // Modal should be closed
    expect(queryByText('Select Meal Type')).toBeFalsy();
  });

  it('updates when selectedMealType prop changes', () => {
    const { rerender, getByText } = render(
      <MealTypeSelector
        mealTypes={MEAL_TYPES}
        selectedMealType="Breakfast"
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Breakfast')).toBeTruthy();

    rerender(
      <MealTypeSelector
        mealTypes={MEAL_TYPES}
        selectedMealType="Dinner"
        onSelect={mockOnSelect}
      />
    );
    expect(getByText('Dinner')).toBeTruthy();
  });

  it('handles all meal type options', () => {
    MEAL_TYPES.forEach((mealType) => {
      const { getByText } = render(
        <MealTypeSelector
          mealTypes={MEAL_TYPES}
          selectedMealType={mealType}
          onSelect={mockOnSelect}
        />
      );

      expect(getByText(mealType)).toBeTruthy();
    });
  });
});
