import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { categoryService, storeService } from '../../services';
import { Category, Store } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export const CategoryListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, brandColors } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);

  // New Category Creation modal/inline state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏬');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [cats, store] = await Promise.all([
        categoryService.getCategories(false),
        storeService.getMyStore().catch(() => null),
      ]);
      setCategories(cats);
      if (store) setCurrentStore(store);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSwitchStoreCategory = async (cat: Category) => {
    if (currentStore?.category_id === cat.id) return;

    Alert.alert(
      'Switch Store Category',
      `Change your active store business model to "${cat.name}"? This tailors inventory rules, units, and custom fields to ${cat.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply Category',
          onPress: async () => {
            setSwitching(cat.id);
            try {
              const updated = await storeService.updateMyStore({ category_id: cat.id });
              setCurrentStore(updated);
              Alert.alert('Store Updated', `Your store category has been switched to ${cat.name}!`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update store category.');
            } finally {
              setSwitching(null);
            }
          },
        },
      ]
    );
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Required Field', 'Please enter category name.');
      return;
    }
    setCreating(true);
    try {
      const code = newCatName.trim().toLowerCase().replace(/\s+/g, '_');
      await categoryService.createCategory({
        name: newCatName.trim(),
        code,
        icon: newCatIcon,
        description: newCatDesc.trim() || undefined,
      });

      setShowAddForm(false);
      setNewCatName('');
      setNewCatDesc('');
      Alert.alert('Success', `Category "${newCatName}" created!`);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create category.');
    } finally {
      setCreating(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isCurrentActive = currentStore?.category_id === item.id;
    const isThisSwitching = switching === item.id;

    return (
      <Card
        style={
          isCurrentActive
            ? { ...styles.catCard, borderColor: brandColors.primary, borderWidth: 2 }
            : styles.catCard
        }
        onPress={() => handleSwitchStoreCategory(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 28 }}>{item.icon || '🏬'}</Text>
          </View>

          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.catName, { color: colors.textPrimary }]}>{item.name}</Text>
              {isCurrentActive && (
                <Badge label="Active Store Category" variant="primary" />
              )}
            </View>
            <Text style={[styles.catDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description || 'Pre-configured retail ERP specifications and dynamic attributes.'}
            </Text>
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.fieldsNote, { color: colors.textMuted }]}>
            Code: {item.code}
          </Text>

          {isCurrentActive ? (
            <Badge label="✓ Current Store Category" variant="success" />
          ) : (
            <TouchableOpacity
              onPress={() => handleSwitchStoreCategory(item)}
              disabled={isThisSwitching}
              style={[styles.switchBtn, { backgroundColor: brandColors.primaryLight }]}
            >
              <Text style={[styles.switchBtnText, { color: brandColors.primary }]}>
                {isThisSwitching ? 'Applying...' : 'Select for Store'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Category Architecture"
        subtitle="Multi-category store setup"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: showAddForm ? '✕' : '➕',
          onPress: () => setShowAddForm(!showAddForm),
        }}
      />

      {/* Add Custom Category Inline Box */}
      {showAddForm && (
        <Card style={styles.addCard}>
          <Text style={[styles.addTitle, { color: colors.textPrimary }]}>Create New Category</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.iconInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              value={newCatIcon}
              onChangeText={setNewCatIcon}
              placeholder="Icon"
            />
            <TextInput
              style={[styles.nameInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="Category Name (e.g. Pet Care, Bakery)"
              placeholderTextColor={colors.textPlaceholder}
            />
          </View>
          <TextInput
            style={[styles.descInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            value={newCatDesc}
            onChangeText={setNewCatDesc}
            placeholder="Brief description of merchandise rules"
            placeholderTextColor={colors.textPlaceholder}
          />
          <Button
            title="Create Category"
            onPress={handleCreateCategory}
            loading={creating}
            size="sm"
            style={{ marginTop: 8 }}
          />
        </Card>
      )}

      {loading ? (
        <Loader message="Loading category blueprints..." />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[brandColors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  catCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: 16,
    fontWeight: '800',
  },
  catDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  fieldsNote: {
    fontSize: 12,
    fontWeight: '600',
  },
  switchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addCard: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
  },
  addTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  iconInput: {
    width: 50,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 20,
    marginRight: 8,
  },
  nameInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  descInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
});

export default CategoryListScreen;
