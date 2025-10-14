import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import styles from '../styles';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <View style={styles.post}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Icon name="user" size={24} color="#fff" />
        </View>

        <View style={styles.userDetails}>
          <View style={styles.userHeader}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.rankedText}> ranked </Text>
            <Text style={styles.restaurant}>{post.dininghall}</Text>
          </View>

          <View style={styles.metadata}>
            <View style={styles.metadataRow}>
              <Icon name="calendar" size={11} color="#666" />
              <Text style={styles.metadataText}> {post.date}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Icon name="x" size={11} color="#666" />
              <Text style={styles.metadataText}> {post.visits} Visits</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.imagesContainer}>
        {post.images.map((img, idx) => (
          <View
            key={idx}
            style={[
              styles.imageWrapper,
              post.images.length === 1 && styles.singleImageWrapper,
            ]}
          >
            <Image
              source={{ uri: img.uri }}
              style={styles.foodImage}
              resizeMode="cover"
            />
            <View
              style={[
                styles.rating,
                {
                  borderColor:
                    img.rating >= 7
                      ? '#4CAF50'
                      : img.rating >= 5
                      ? '#FFA726'
                      : '#f44336',
                },
              ]}
            >
              <Text style={styles.ratingText}>{img.rating}</Text>
            </View>
          </View>
        ))}
      </View>

      {post.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>
            <Text style={styles.notesLabel}>Notes: </Text>
            {post.notes}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity>
            <Icon name="heart" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 20 }}>
            <Icon name="message-square" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 20 }}>
            <Icon name="send" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRight}>
          <TouchableOpacity>
            <Icon name="plus" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 20 }}>
            <Icon name="bookmark" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
