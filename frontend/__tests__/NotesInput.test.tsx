/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotesInput from '../components/NotesInput';

describe('NotesInput Component', () => {
  const mockOnNotesChange = jest.fn();

  beforeEach(() => {
    mockOnNotesChange.mockClear();
  });

  it('renders correctly with empty notes', () => {
    const { getByText } = render(
      <NotesInput notes="" onNotesChange={mockOnNotesChange} />
    );

    expect(getByText('Add notes')).toBeTruthy();
  });

  it('displays existing notes in truncated form', () => {
    const { getByText } = render(
      <NotesInput notes="Great meal!" onNotesChange={mockOnNotesChange} />
    );

    expect(getByText('Notes: Great meal!')).toBeTruthy();
  });

  it('opens modal when pressed', () => {
    const { getByText, getByPlaceholderText } = render(
      <NotesInput notes="" onNotesChange={mockOnNotesChange} />
    );

    fireEvent.press(getByText('Add notes'));

    expect(getByPlaceholderText('Write about your meal experience...')).toBeTruthy();
    expect(getByText('Add Notes')).toBeTruthy();
  });

  it('updates text in modal', () => {
    const { getByText, getByPlaceholderText } = render(
      <NotesInput notes="" onNotesChange={mockOnNotesChange} />
    );

    fireEvent.press(getByText('Add notes'));

    const input = getByPlaceholderText('Write about your meal experience...');
    fireEvent.changeText(input, 'Delicious food');

    expect(input.props.value).toBe('Delicious food');
  });

  it('calls onNotesChange when save is pressed', () => {
    const { getByText, getByPlaceholderText } = render(
      <NotesInput notes="" onNotesChange={mockOnNotesChange} />
    );

    fireEvent.press(getByText('Add notes'));

    const input = getByPlaceholderText('Write about your meal experience...');
    fireEvent.changeText(input, 'Delicious food');
    fireEvent.press(getByText('Save'));

    expect(mockOnNotesChange).toHaveBeenCalledWith('Delicious food');
  });

  it('cancels changes when cancel is pressed', () => {
    const { getByText, getByPlaceholderText } = render(
      <NotesInput notes="Original" onNotesChange={mockOnNotesChange} />
    );

    fireEvent.press(getByText('Notes: Original'));

    const input = getByPlaceholderText('Write about your meal experience...');
    fireEvent.changeText(input, 'Changed');
    fireEvent.press(getByText('Cancel'));

    expect(mockOnNotesChange).not.toHaveBeenCalled();
  });
});
