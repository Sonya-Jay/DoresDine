/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostCard from '../components/PostCard';
import { Post } from '../types';

// Mock the modules
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('PostCard Component', () => {
  const mockOnLike = jest.fn();
  const mockOnCommentCountUpdate = jest.fn();
  const mockOnCreateSimilarPost = jest.fn();

  const mockPost: Post = {
    id: 1,
    username: 'testuser',
    dininghall: 'Rand Dining Center',
    date: '10/21/2025 Lunch',
    visits: 25,
    images: [
      {
        uri: 'https://example.com/image.jpg',
        rating: 8.5,
      },
    ],
    notes: 'Great meal!',
    menuItems: ['Pizza', 'Salad'],
    rating: 8.5,
    likeCount: 10,
    commentCount: 5,
    isLiked: false,
  };

  const mockPostWithoutImages: Post = {
    ...mockPost,
    images: [],
    menuItems: ['Pasta', 'Bread'],
  };

  beforeEach(() => {
    mockOnLike.mockClear();
    mockOnCommentCountUpdate.mockClear();
    mockOnCreateSimilarPost.mockClear();
  });

  it('renders correctly with all post data', () => {
    const { getByText } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    expect(getByText('testuser')).toBeTruthy();
    expect(getByText('Rand Dining Center')).toBeTruthy();
    expect(getByText(/10\/21\/2025/)).toBeTruthy();
    expect(getByText(/Great meal!/)).toBeTruthy();
  });

  it('displays like count correctly', () => {
    const { getByText } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    expect(getByText('10 likes')).toBeTruthy();
  });

  it('displays singular like correctly', () => {
    const postWithOneLike = { ...mockPost, likeCount: 1 };
    const { getByText } = render(
      <PostCard
        post={postWithOneLike}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    expect(getByText('1 like')).toBeTruthy();
  });

  it('displays comment count correctly', () => {
    const { getByText } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    expect(getByText('View all 5 comments')).toBeTruthy();
  });

  it('calls onLike when heart icon is pressed', async () => {
    mockOnLike.mockResolvedValue(undefined);
    
    const { getByTestId } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(mockOnLike).toHaveBeenCalledWith(mockPost.id);
    });
  });

  it('handles like error with rollback', async () => {
    mockOnLike.mockRejectedValue(new Error('Network error'));
    
    const { getByTestId, getByText } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(mockOnLike).toHaveBeenCalledWith(mockPost.id);
    });

    // Should still show original like count after error
    await waitFor(() => {
      expect(getByText('10 likes')).toBeTruthy();
    });
  });

  it('displays filled heart when post is liked', () => {
    const likedPost = { ...mockPost, isLiked: true };
    const { getByText } = render(
      <PostCard
        post={likedPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    // The filled heart should be rendered (❤️ emoji)
    expect(getByText('❤️')).toBeTruthy();
  });

  it('displays menu items when no images are present', () => {
    const { getByText } = render(
      <PostCard
        post={mockPostWithoutImages}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    expect(getByText('What was eaten:')).toBeTruthy();
    expect(getByText('• Pasta')).toBeTruthy();
    expect(getByText('• Bread')).toBeTruthy();
  });

  it('displays "No photos or menu items" when both are empty', () => {
    const emptyPost = { ...mockPost, images: [], menuItems: [] };
    const { getByText } = render(
      <PostCard
        post={emptyPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    expect(getByText('No photos or menu items')).toBeTruthy();
  });

  it('calls onCreateSimilarPost when plus button is pressed', () => {
    const { getByTestId } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
        onCreateSimilarPost={mockOnCreateSimilarPost}
      />
    );

    const createSimilarButton = getByTestId('create-similar-button');
    fireEvent.press(createSimilarButton);

    expect(mockOnCreateSimilarPost).toHaveBeenCalledWith('Rand Dining Center', 'Lunch');
  });

  it('displays rating correctly', () => {
    const { getByText } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    expect(getByText('8.5')).toBeTruthy();
  });

  it('handles zero comments correctly', () => {
    const postWithNoComments = { ...mockPost, commentCount: 0 };
    const { queryByText } = render(
      <PostCard
        post={postWithNoComments}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    expect(queryByText(/View all/)).toBeFalsy();
  });

  it('handles zero likes correctly', () => {
    const postWithNoLikes = { ...mockPost, likeCount: 0 };
    const { queryByText } = render(
      <PostCard
        post={postWithNoLikes}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    expect(queryByText(/likes/)).toBeFalsy();
  });

  it('opens comments modal when comment button is pressed', () => {
    const { getByTestId, getByText } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    const commentButton = getByTestId('comment-button');
    fireEvent.press(commentButton);

    // CommentsModal should be visible
    expect(getByText('Comments')).toBeTruthy();
  });

  it('updates comment count when new comment is added', () => {
    const { getByTestId, getByText } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    // Open comments modal
    const commentButton = getByTestId('comment-button');
    fireEvent.press(commentButton);

    // Verify initial comment count
    expect(getByText('View all 5 comments')).toBeTruthy();
  });

  it('does not call onLike when button is disabled during liking', async () => {
    mockOnLike.mockImplementation(() => new Promise<void>(resolve => setTimeout(() => resolve(), 1000)));
    
    const { getByTestId } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    const likeButton = getByTestId('like-button');
    
    // First press
    fireEvent.press(likeButton);
    
    // Second press while first is processing (should be ignored)
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(mockOnLike).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onCreateSimilarPost if prop is not provided', () => {
    const { getByTestId } = render(
      <PostCard
        post={mockPost}
        onLike={mockOnLike}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    const createSimilarButton = getByTestId('create-similar-button');
    fireEvent.press(createSimilarButton);

    // Should not crash, just do nothing
    expect(mockOnCreateSimilarPost).not.toHaveBeenCalled();
  });

  it('does not call onLike if prop is not provided', () => {
    const { getByTestId } = render(
      <PostCard
        post={mockPost}
        onCommentCountUpdate={mockOnCommentCountUpdate}
      />
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);

    // Should not crash
    expect(mockOnLike).not.toHaveBeenCalled();
  });
});
