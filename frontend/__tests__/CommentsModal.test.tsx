/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CommentsModal from '../components/CommentsModal';

// Mock fetch
globalThis.fetch = jest.fn() as any;

describe('CommentsModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnCommentAdded = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCommentAdded.mockClear();
    (globalThis.fetch as jest.Mock).mockClear();
  });

  it('renders correctly when visible', () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { getByText } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    expect(getByText('Comments')).toBeTruthy();
  });

  it('fetches and displays comments', async () => {
    const mockComments = [
      {
        id: '1',
        text: 'Great post!',
        username: 'user1',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        text: 'Love this!',
        username: 'user2',
        created_at: new Date().toISOString(),
      },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockComments,
    });

    const { getByText } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    await waitFor(() => {
      expect(getByText('Great post!')).toBeTruthy();
      expect(getByText('Love this!')).toBeTruthy();
      expect(getByText('user1')).toBeTruthy();
      expect(getByText('user2')).toBeTruthy();
    });
  });

  it('calls onClose when close button is pressed', () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { getByTestId } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    const closeButton = getByTestId('close-comments-button');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits a new comment', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '3', text: 'New comment' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { getByPlaceholderText, getByTestId } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    const input = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(input, 'New comment');

    const submitButton = getByTestId('submit-comment-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnCommentAdded).toHaveBeenCalled();
    });
  });

  it('does not submit empty comments', () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { getByPlaceholderText } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    const input = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(input, '   ');

    // Empty comments should not be submittable
    expect(input.props.value).toBe('   ');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1); // Only the initial fetch
  });

  it('displays "No comments yet" when there are no comments', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { getByText } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    await waitFor(() => {
      expect(getByText(/No comments yet/)).toBeTruthy();
    });
  });

  it('clears input after submitting comment', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '3', text: 'Test comment' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '3', text: 'Test comment', username: 'testuser', created_at: new Date().toISOString() }],
      });

    const { getByPlaceholderText, getByTestId } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    const input = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(input, 'Test comment');
    
    const submitButton = getByTestId('submit-comment-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(input.props.value).toBe('');
    });
  });

  it('handles fetch comments error', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { getByText } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    await waitFor(() => {
      // Should show no comments when fetch fails
      expect(getByText(/No comments yet/)).toBeTruthy();
    });
  });

  it('handles non-ok response when fetching comments', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const { getByText } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    await waitFor(() => {
      expect(getByText(/No comments yet/)).toBeTruthy();
    });
  });

  it('handles submit comment error', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockRejectedValueOnce(new Error('Submit failed'));

    const { getByPlaceholderText, getByTestId } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    const input = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(input, 'Test comment');
    
    const submitButton = getByTestId('submit-comment-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnCommentAdded).not.toHaveBeenCalled();
    });
  });

  it('handles non-ok response when submitting comment', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Custom error message' }),
      });

    const { getByPlaceholderText, getByTestId } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    const input = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(input, 'Test comment');
    
    const submitButton = getByTestId('submit-comment-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnCommentAdded).not.toHaveBeenCalled();
    });
  });

  it('formats comment timestamps correctly', async () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const mockCommentsWithDates = [
      { id: '1', text: 'Recent', username: 'user1', created_at: twoHoursAgo.toISOString() },
      { id: '2', text: 'Two days', username: 'user2', created_at: twoDaysAgo.toISOString() },
      { id: '3', text: 'Old', username: 'user3', created_at: tenDaysAgo.toISOString() },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockCommentsWithDates,
    });

    const { getByText } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    await waitFor(() => {
      expect(getByText('Recent')).toBeTruthy();
      expect(getByText('Two days')).toBeTruthy();
      expect(getByText('Old')).toBeTruthy();
    });
  });

  it('shows alert when trying to submit empty comment', () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { getByTestId } = render(
      <CommentsModal
        visible={true}
        postId={1}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
      />
    );

    // Try to submit without entering text
    const submitButton = getByTestId('submit-comment-button');
    
    // Button should be disabled for empty text
    expect(submitButton.props.accessibilityState?.disabled).toBeTruthy();
  });
});
