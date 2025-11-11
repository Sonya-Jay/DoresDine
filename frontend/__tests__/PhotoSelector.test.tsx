/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhotoSelector from '../components/PhotoSelector';

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

import { launchImageLibrary } from 'react-native-image-picker';
const mockLaunchImageLibrary = launchImageLibrary as jest.Mock;

describe('PhotoSelector Component', () => {
  const mockOnPhotosChange = jest.fn();

  beforeEach(() => {
    mockOnPhotosChange.mockClear();
    mockLaunchImageLibrary.mockClear();
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

  it('opens image picker when button is pressed', () => {
    mockLaunchImageLibrary.mockImplementation((options, callback) => {
      callback({
        didCancel: false,
        assets: [{ uri: 'test-photo.jpg' }],
      });
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    expect(mockLaunchImageLibrary).toHaveBeenCalled();
  });

  it('handles photo selection and upload', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ storage_key: 'uploaded-photo-key' }),
    }) as any;

    mockLaunchImageLibrary.mockImplementation((options, callback) => {
      callback({
        didCancel: false,
        assets: [{ uri: 'new-photo.jpg', fileName: 'test.jpg', type: 'image/jpeg' }],
      });
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    // Wait for async upload
    await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

    expect(mockOnPhotosChange).toHaveBeenCalledWith(['uploaded-photo-key']);
  });

  it('handles image picker cancellation', () => {
    mockLaunchImageLibrary.mockImplementation((options, callback) => {
      callback({ didCancel: true });
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });

  it('displays multiple photos count', () => {
    const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
    const { getByText } = render(
      <PhotoSelector photos={photos} onPhotosChange={mockOnPhotosChange} />
    );

    expect(getByText('Add photos (3)')).toBeTruthy();
  });

  it('handles error from image picker', () => {
    mockLaunchImageLibrary.mockImplementation((options, callback) => {
      callback({ errorCode: 'camera_unavailable', errorMessage: 'Camera not available' });
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });

  it('handles upload failure when server returns not ok', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
    }) as any;

    mockLaunchImageLibrary.mockImplementation((options, callback) => {
      callback({
        didCancel: false,
        assets: [{ uri: 'new-photo.jpg', fileName: 'test.jpg', type: 'image/jpeg' }],
      });
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    // Wait for async upload attempt
    await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

    // Should not add photo on failed upload
    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });

  it('handles network error during upload', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as any;

    mockLaunchImageLibrary.mockImplementation((options, callback) => {
      callback({
        didCancel: false,
        assets: [{ uri: 'new-photo.jpg', fileName: 'test.jpg', type: 'image/jpeg' }],
      });
    });

    const { getByText } = render(
      <PhotoSelector photos={[]} onPhotosChange={mockOnPhotosChange} />
    );

    const addButton = getByText(/Add photos/);
    fireEvent.press(addButton);

    // Wait for async upload attempt
    await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

    // Should not add photo on error
    expect(mockOnPhotosChange).not.toHaveBeenCalled();
  });
});
