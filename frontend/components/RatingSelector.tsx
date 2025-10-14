import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface RatingSelectorProps {
  selectedRating: 'liked' | 'fine' | 'disliked' | null;
  onRatingChange: (rating: 'liked' | 'fine' | 'disliked') => void;
}

const RatingSelector: React.FC<RatingSelectorProps> = ({
  selectedRating,
  onRatingChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How was it?</Text>
      <View style={styles.options}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => onRatingChange('liked')}
        >
          <View style={[styles.circle, styles.circleLiked]}>
            {selectedRating === 'liked' && (
              <Icon name="check" size={32} color="#fff" />
            )}
          </View>
          <Text style={styles.optionText}>I liked it!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => onRatingChange('fine')}
        >
          <View style={[styles.circle, styles.circleFine]}>
            {selectedRating === 'fine' && (
              <Icon name="check" size={32} color="#fff" />
            )}
          </View>
          <Text style={styles.optionText}>It was fine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => onRatingChange('disliked')}
        >
          <View style={[styles.circle, styles.circleDisliked]}>
            {selectedRating === 'disliked' && (
              <Icon name="check" size={32} color="#fff" />
            )}
          </View>
          <Text style={styles.optionText}>I didn't like it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  option: {
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLiked: {
    backgroundColor: '#A8D5BA',
  },
  circleFine: {
    backgroundColor: '#F4E4A6',
  },
  circleDisliked: {
    backgroundColor: '#F5B7B1',
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default RatingSelector;
