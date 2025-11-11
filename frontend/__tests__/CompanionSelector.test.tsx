/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CompanionSelector from '../components/CompanionSelector';

describe('CompanionSelector Component', () => {
  const mockOnCompanionsChange = jest.fn();

  beforeEach(() => {
    mockOnCompanionsChange.mockClear();
  });

  it('renders correctly with header text', () => {
    const { getByText } = render(
      <CompanionSelector
        selectedCompanions={[]}
        onCompanionsChange={mockOnCompanionsChange}
      />
    );

    expect(getByText('Who did you go with?')).toBeTruthy();
  });

  it('displays dummy friends', () => {
    const { getByText } = render(
      <CompanionSelector
        selectedCompanions={[]}
        onCompanionsChange={mockOnCompanionsChange}
      />
    );

    expect(getByText('VandyDiner123')).toBeTruthy();
    expect(getByText('DiningHater01')).toBeTruthy();
    expect(getByText('RandLuvr2')).toBeTruthy();
  });

  it('selects a companion when clicked', () => {
    const { getByText } = render(
      <CompanionSelector
        selectedCompanions={[]}
        onCompanionsChange={mockOnCompanionsChange}
      />
    );

    const companion = getByText('VandyDiner123');
    fireEvent.press(companion);

    expect(mockOnCompanionsChange).toHaveBeenCalledWith(['VandyDiner123']);
  });

  it('deselects a companion when clicked again', () => {
    const { getByText } = render(
      <CompanionSelector
        selectedCompanions={['VandyDiner123']}
        onCompanionsChange={mockOnCompanionsChange}
      />
    );

    const companion = getByText('VandyDiner123');
    fireEvent.press(companion);

    expect(mockOnCompanionsChange).toHaveBeenCalledWith([]);
  });

  it('can select multiple companions', () => {
    const { getByText } = render(
      <CompanionSelector
        selectedCompanions={['VandyDiner123']}
        onCompanionsChange={mockOnCompanionsChange}
      />
    );

    const companion = getByText('DiningHater01');
    fireEvent.press(companion);

    expect(mockOnCompanionsChange).toHaveBeenCalledWith(['VandyDiner123', 'DiningHater01']);
  });

  it('removes a companion from list when toggled off', () => {
    const { getByText } = render(
      <CompanionSelector
        selectedCompanions={['VandyDiner123', 'DiningHater01']}
        onCompanionsChange={mockOnCompanionsChange}
      />
    );

    const companion = getByText('VandyDiner123');
    fireEvent.press(companion);

    expect(mockOnCompanionsChange).toHaveBeenCalledWith(['DiningHater01']);
  });
});
