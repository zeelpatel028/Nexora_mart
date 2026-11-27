import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../utils/themeColors';
import AppIcon from '../icons/AppIcon';

export interface DropdownItem {
  label: string;
  value: string | number;
}

export interface AppDropdownProps {
  label?: string;
  items?: DropdownItem[];
  options?: DropdownItem[];
  selectedValue?: string | number;
  onSelect: (value: any, item?: DropdownItem) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  required?: boolean;
}

export const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  items,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  containerStyle,
  required,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const listItems = options || items || [];
  const selectedItem = listItems.find((it) => it.value === selectedValue);

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
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.btnText, !selectedItem && styles.placeholderText]} numberOfLines={1}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <AppIcon name="down" size={16} color={Colors.secondaryText} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AppIcon name="close" size={20} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={listItems}
              keyExtractor={(it) => String(it.value)}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[styles.itemRow, isSelected && styles.selectedItemRow]}
                    onPress={() => {
                      onSelect(item.value, item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
                      {item.label}
                    </Text>
                    {isSelected && <AppIcon name="check" size={16} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  requiredAsterisk: {
    color: '#EF4444',
    fontSize: 13,
  },
  dropdownBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  btnText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: '60%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  selectedItemRow: {
    backgroundColor: '#F8F9FC',
  },
  itemText: {
    fontSize: 14,
    color: '#334155',
  },
  selectedItemText: {
    fontWeight: '700',
    color: '#F57C00',
  },
});

export default AppDropdown;
