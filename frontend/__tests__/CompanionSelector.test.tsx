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

  it('displays "No friends yet" when no friends are loaded', () => {
    const { getByText } = render(
      <CompanionSelector
        selectedCompanions={[]}
        onCompanionsChange={mockOnCompanionsChange}
      />
    );

    expect(getByText('No friends yet')).toBeTruthy();
  });

  // Note: The component currently doesn't have dummy friends
  // It fetches friends from API (which is not implemented yet)
  // These tests are skipped until the API integration is complete
  it.skip('displays friends when loaded', () => {
    // This test will be implemented when the API integration is complete
  });

  it.skip('selects a companion when clicked', () => {
    // This test will be implemented when the API integration is complete
  });

  it.skip('deselects a companion when clicked again', () => {
    // This test will be implemented when the API integration is complete
  });

  it.skip('can select multiple companions', () => {
    // This test will be implemented when the API integration is complete
  });

  it.skip('removes a companion from list when toggled off', () => {
    // This test will be implemented when the API integration is complete
  });
});
