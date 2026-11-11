import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface CommonDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue?: string | number | null;
  onSelect: (value: any) => void;
  error?: string;
  searchable?: boolean;
  required?: boolean;
}

export const CommonDropdown: React.FC<CommonDropdownProps> = ({
  label,
  placeholder = 'Select option...',
  options,
  selectedValue,
  onSelect,
  error,
  searchable = true,
  required = false,
}) => {
  const { colors, brandColors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find((o) => String(o.value) === String(selectedValue));

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label} {required && <Text style={{ color: brandColors.error }}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[
          styles.selector,
          {
            backgroundColor: colors.surface,
            borderColor: error ? brandColors.error : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.selectorText,
            { color: selectedOption ? colors.textPrimary : colors.textMuted },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={[styles.arrow, { color: brandColors.primary }]}>▼</Text>
      </TouchableOpacity>

      {error ? <Text style={[styles.errorText, { color: brandColors.error }]}>{error}</Text> : null}

      <Modal visible={modalVisible} transparent animationType="slide">
        <SafeAreaView style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {label || 'Select'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: brandColors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>

            {searchable && (
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Search..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = String(item.value) === String(selectedValue);
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && { backgroundColor: brandColors.primaryLight },
                    ]}
                    onPress={() => {
                      onSelect(item.value);
                      setModalVisible(false);
                      setSearchQuery('');
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? brandColors.primary : colors.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Text style={[styles.checkmark, { color: brandColors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  selectorText: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 11,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
  },
});

