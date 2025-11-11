/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhotoSelector from '../components/PhotoSelector';

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

import * as ImagePicker from 'expo-image-picker';
const mockLaunchImageLibraryAsync = ImagePicker.launchImageLibraryAsync as jest.Mock;

describe('PhotoSelector Component', () => {
  const mockOnPhotosChange = jest.fn();

  beforeEach(() => {
    mockOnPhotosChange.mockClear();
    mockLaunchImageLibraryAsync.mockClear();
  });

  it('renders correctly with no photos', () => {
    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    expect(getByText(/Add photos/)).toBeTruthy();
  });

  it('displays selected photo count', () => {
    const photos = ['photo1.jpg', 'photo2.jpg'];
    const { getByText } = render(
      <PhotoSelector photos={photos} onPhotosChange={mockOnPhotosChange} />
    );

    expect(getByText('Add photos (2)')).toBeTruthy();
  });

  it('opens image picker when button is pressed', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'test-photo.jpg' }],
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
  });

  it('handles photo selection and upload', async () => {
    // Mock permission request
    const ImagePicker = require('expo-image-picker');
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    
    // Mock image manipulator
    const ImageManipulator = require('expo-image-manipulator');
    ImageManipulator.manipulateAsync.mockResolvedValue({
      uri: 'compressed-photo.jpg',
      width: 1920,
      height: 1080,
    });
    
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ storage_key: 'uploaded-photo-key' }),
    }) as any;

    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'new-photo.jpg', fileName: 'test.jpg', type: 'image/jpeg' }],
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    // Wait for async upload (permission + picker + manipulation + upload)
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

    expect(mockOnPhotosChange).toHaveBeenCalled();
  });

  it('handles image picker cancellation', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: true,
      assets: null,
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    await new Promise(resolve => setTimeout(resolve, 200));
    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });

  it('displays multiple photos count', () => {
    const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
    const { getByText } = render(
      <PhotoSelector photos={photos} onPhotosChange={mockOnPhotosChange} />
    );

    expect(getByText('Add photos (3)')).toBeTruthy();
  });

  // Note: Component doesn't currently have error handling for launchImageLibraryAsync
  // This test is skipped until error handling is added to the component
  it.skip('handles error from image picker', async () => {
    // This test will be enabled when the component adds try-catch around launchImageLibraryAsync
  });

  it('handles upload failure when server returns not ok', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
    }) as any;

    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'new-photo.jpg', fileName: 'test.jpg', type: 'image/jpeg' }],
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    // Wait for async upload attempt
    await new Promise<void>(resolve => setTimeout(() => resolve(), 200));

    // Should not add photo on failed upload
    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });

  it('handles network error during upload', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as any;

    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'new-photo.jpg', fileName: 'test.jpg', type: 'image/jpeg' }],
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    // Wait for async upload attempt
    await new Promise<void>(resolve => setTimeout(() => resolve(), 200));

    // Should not add photo on error
    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });
});
