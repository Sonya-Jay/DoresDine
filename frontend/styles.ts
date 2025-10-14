import { StyleSheet } from 'react-native';

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
  menusContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  facilityCard: {
    backgroundColor: '#D4A574',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  statusOpen: {
    backgroundColor: '#10B981',
  },
  statusClosed: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  diningHallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 12,
  },
  diningHallTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  daySection: {
    marginTop: 24,
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  mealButton: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  mealText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
  },
});

export default styles;
