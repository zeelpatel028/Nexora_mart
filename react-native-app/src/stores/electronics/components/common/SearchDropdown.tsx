import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../utils/themeColors';
import AppIcon from '../icons/AppIcon';

export interface SearchDropdownItem {
  id: string | number;
  title: string;
  subtitle?: string;
  extra?: any;
}

export interface SearchDropdownProps {
  label?: string;
  items?: SearchDropdownItem[];
  options?: any[];
  selectedItem?: SearchDropdownItem | null;
  selectedValue?: string | number;
  onSelect: (item: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  required?: boolean;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  label,
  items,
  options,
  selectedItem,
  selectedValue,
  onSelect,
  placeholder = 'Search & select...',
  searchPlaceholder = 'Type to search...',
  onAddNew,
  addNewLabel = '+ Add New',
  containerStyle,
  required,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize items from options or items
  const resolvedItems: SearchDropdownItem[] = (items || (options || []).map((o: any) => ({
    id: o.value !== undefined ? o.value : o.id,
    title: o.label || o.title || String(o.value || o.id),
    subtitle: o.subtitle,
    extra: o,
  })));

  const currentSelection =
    selectedItem ||
    (selectedValue !== undefined
      ? resolvedItems.find((it) => String(it.id) === String(selectedValue))
      : null);

  const filteredItems = resolvedItems.filter((it) => {
    const q = searchQuery.toLowerCase();
    return (
      it.title.toLowerCase().includes(q) ||
      (it.subtitle && it.subtitle.toLowerCase().includes(q))
    );
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.dropdownBtn}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectedText, !currentSelection && styles.placeholderText]}>
          {currentSelection ? currentSelection.title : placeholder}
        </Text>
        <AppIcon name="search" size={18} color={Colors.secondaryText} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{label || 'Search & Select'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AppIcon name="close" size={20} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchRow}>
              <AppIcon name="search" size={16} color={Colors.secondaryText} />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor={Colors.secondaryText}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <AppIcon name="close" size={16} color={Colors.secondaryText} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Quick Add Button */}
            {onAddNew ? (
              <TouchableOpacity
                style={styles.addNewBtn}
                onPress={() => {
                  setModalVisible(false);
                  onAddNew();
                }}
              >
                <AppIcon name="plus" size={16} color={Colors.primaryOrange} />
                <Text style={styles.addNewText}>{addNewLabel}</Text>
              </TouchableOpacity>
            ) : null}

            {/* List */}
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                    onPress={() => {
                      onSelect(item);
                      setModalVisible(false);
                      setSearchQuery('');
                    }}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, isSelected && styles.itemTitleSelected]}>
                        {item.title}
                      </Text>
                      {item.subtitle ? (
                        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <AppIcon name="check" size={18} color={Colors.primaryOrange} />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matching items found.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.darkText,
  },
  requiredAsterisk: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '700',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  selectedText: {
    fontSize: 14,
    color: Colors.darkText,
  },
  placeholderText: {
    color: Colors.secondaryText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkText,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 14,
    color: Colors.darkText,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  addNewText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryOrange,
    marginLeft: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemRowSelected: {
    backgroundColor: '#FFF3E0',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkText,
  },
  itemTitleSelected: {
    color: Colors.primaryOrange,
    fontWeight: '700',
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.secondaryText,
    fontSize: 14,
  },
});

export default SearchDropdown;
