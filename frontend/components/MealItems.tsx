// components/MealItems.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { api } from './api/client';
import { MenuItem } from '../../backend/src/types/dining';

type Props = { menuId: number };

const MealItems: React.FC<Props> = ({ menuId }) => {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (items || loading) return;
    setLoading(true);
    try {
      const data = await api.getMenuItems(menuId);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // load on first render lazily
  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  if (loading) return <ActivityIndicator style={{ marginVertical: 8 }} />;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!items || items.length === 0)
    return <Text style={{ color: '#666' }}>No items available</Text>;

  return (
    <FlatList
      data={items}
      keyExtractor={i => String(i.name) + (i.calories ?? '')}
      renderItem={({ item }) => (
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ fontWeight: '600' }}>{item.name}</Text>
          {item.description ? <Text>{item.description}</Text> : null}
          {item.calories ? (
            <Text style={{ color: '#666' }}>{item.calories} kcal</Text>
          ) : null}
        </View>
      )}
    />
  );
};

export default MealItems;
