import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function DoresDineApp() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Feed');

  const posts = [
    {
      id: 1,
      username: 'VandyDiner123',
      restaurant: 'Rand Dining Center',
      date: '09/19/2025 Lunch',
      visits: 23,
      images: [
        {
          uri: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400',
          rating: 5.8,
        },
        {
          uri: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
          rating: 10.0,
        },
      ],
      notes: 'Love rand cookies',
    },
    {
      id: 2,
      username: 'DiningHater01',
      restaurant: 'The Kitchen at Kissam',
      date: '09/19/2025 Lunch',
      visits: 11,
      images: [
        {
          uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
          rating: 1.2,
        },
      ],
      notes: '',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>
            Dores<Text style={styles.logoAccent}>Dine</Text>
          </Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Icon name="bell" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 20 }}>
              <Icon name="menu" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search a menu, member, etc."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="x" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}
        >
          {['Trending', 'Friend Recs', 'Filter By'].map((filter, idx) => (
            <TouchableOpacity key={idx} style={styles.filterButton}>
              <Text style={styles.filterText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed */}
      <ScrollView style={styles.feed}>
        {posts.map(post => (
          <View key={post.id} style={styles.post}>
            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Icon name="user" size={24} color="#fff" />
              </View>

              <View style={styles.userDetails}>
                <View style={styles.userHeader}>
                  <Text style={styles.username}>{post.username}</Text>
                  <Text style={styles.rankedText}> ranked </Text>
                  <Text style={styles.restaurant}>{post.restaurant}</Text>
                </View>

                <View style={styles.metadata}>
                  <View style={styles.metadataRow}>
                    <Icon name="calendar" size={11} color="#666" />
                    <Text style={styles.metadataText}> {post.date}</Text>
                  </View>
                  <View style={styles.metadataRow}>
                    <Icon name="x" size={11} color="#666" />
                    <Text style={styles.metadataText}>
                      {' '}
                      {post.visits} Visits
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Images */}
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

            {/* Notes */}
            {post.notes ? (
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>
                  <Text style={styles.notesLabel}>Notes: </Text>
                  {post.notes}
                </Text>
              </View>
            ) : null}

            {/* Actions */}
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
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'grid', label: 'Feed' },
          { icon: 'file-text', label: 'Menus' },
          { icon: 'search', label: 'Search' },
          { icon: 'users', label: 'Friends' },
          { icon: 'user', label: 'Profile' },
        ].map((item, idx) => {
          const isActive = activeTab === item.label;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => setActiveTab(item.label)}
              style={styles.navItem}
            >
              <Icon
                name={item.icon}
                size={26}
                color={isActive ? '#000' : '#999'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[styles.navLabel, isActive && styles.navLabelActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logo: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
  },
  logoAccent: {
    color: '#D4A574',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  filterContainer: {
    marginBottom: 3,
  },
  filterContentContainer: {
    paddingRight: 20,
  },
  filterButton: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  feed: {
    flex: 1,
  },
  post: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  rankedText: {
    fontSize: 14,
    color: '#666',
  },
  restaurant: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  metadata: {
    marginTop: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  singleImageWrapper: {
    flex: 0,
    width: 208,
  },
  foodImage: {
    width: '100%',
    height: 224,
    borderRadius: 12,
  },
  rating: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 2,
  },
  ratingText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#000',
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#000',
  },
  notesLabel: {
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#999',
  },
  navLabelActive: {
    color: '#000',
    fontWeight: '600',
  },
});
