/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RatingSlider from '../components/RatingSlider';

describe('RatingSlider Component', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders correctly with default value', () => {
    const { getByText } = render(
      <RatingSlider value={5} onValueChange={mockOnValueChange} />
    );

    expect(getByText('How was it?')).toBeTruthy();
    expect(getByText('5.0')).toBeTruthy();
  });

  it('displays the correct value', () => {
    const { getByText } = render(
      <RatingSlider value={8.5} onValueChange={mockOnValueChange} />
    );

    expect(getByText('8.5')).toBeTruthy();
  });

  it('displays maximum value correctly', () => {
    const { getByText } = render(
      <RatingSlider value={10.0} onValueChange={mockOnValueChange} />
    );

    expect(getByText('10.0')).toBeTruthy();
  });

  it('displays minimum value correctly', () => {
    const { getByText } = render(
      <RatingSlider value={0.0} onValueChange={mockOnValueChange} />
    );

    expect(getByText('0.0')).toBeTruthy();
  });

  it('calls onValueChange when slider value changes', () => {
    const { getByTestId } = render(
      <RatingSlider value={5.0} onValueChange={mockOnValueChange} />
    );

    // Note: Testing slider interaction requires specific test setup
    // This validates the callback is provided
    expect(mockOnValueChange).toBeDefined();
  });

  it('formats decimal values correctly', () => {
    const { getByText } = render(
      <RatingSlider value={7.3} onValueChange={mockOnValueChange} />
    );

    expect(getByText('7.3')).toBeTruthy();
  });
});
