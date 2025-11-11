/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomNav from '../components/BottomNav';

describe('BottomNav Component', () => {
  const mockSetActiveTab = jest.fn();

  beforeEach(() => {
    mockSetActiveTab.mockClear();
  });

  it('renders all navigation tabs', () => {
    const { getByText } = render(
      <BottomNav activeTab="Feed" setActiveTab={mockSetActiveTab} />
    );

    expect(getByText('Feed')).toBeTruthy();
    expect(getByText('Menus')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('highlights the active tab', () => {
    const { getByText } = render(
      <BottomNav activeTab="Feed" setActiveTab={mockSetActiveTab} />
    );

    const feedTab = getByText('Feed');
    expect(feedTab).toBeTruthy();
  });

  it('switches to Menus tab when pressed', () => {
    const { getByText } = render(
      <BottomNav activeTab="Feed" setActiveTab={mockSetActiveTab} />
    );

    const menusTab = getByText('Menus');
    fireEvent.press(menusTab);

    expect(mockSetActiveTab).toHaveBeenCalledWith('Menus');
  });

  it('switches to Profile tab when pressed', () => {
    const { getByText } = render(
      <BottomNav activeTab="Feed" setActiveTab={mockSetActiveTab} />
    );

    const profileTab = getByText('Profile');
    fireEvent.press(profileTab);

    expect(mockSetActiveTab).toHaveBeenCalledWith('Profile');
  });

  it('switches to Feed tab when pressed', () => {
    const { getByText } = render(
      <BottomNav activeTab="Menus" setActiveTab={mockSetActiveTab} />
    );

    const feedTab = getByText('Feed');
    fireEvent.press(feedTab);

    expect(mockSetActiveTab).toHaveBeenCalledWith('Feed');
  });

  it('maintains active tab state correctly', () => {
    const { rerender, getByText } = render(
      <BottomNav activeTab="Feed" setActiveTab={mockSetActiveTab} />
    );

    expect(getByText('Feed')).toBeTruthy();

    rerender(<BottomNav activeTab="Menus" setActiveTab={mockSetActiveTab} />);
    expect(getByText('Menus')).toBeTruthy();
  });
});
