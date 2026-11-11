import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';

interface CommonMultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  allowCustom?: boolean;
  placeholder?: string;
}

export const CommonMultiSelect: React.FC<CommonMultiSelectProps> = ({
  label,
  options,
  selectedValues = [],
  onChange,
  allowCustom = true,
  placeholder = 'Add custom...',
}) => {
  const { colors, brandColors } = useTheme();
  const [customText, setCustomText] = useState('');

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const addCustom = () => {
    const trimmed = customText.trim();
    if (trimmed && !selectedValues.includes(trimmed)) {
      onChange([...selectedValues, trimmed]);
      setCustomText('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

      {/* Preset Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => toggleOption(opt)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? brandColors.primary : colors.surface,
                    borderColor: isSelected ? brandColors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Custom Add Input */}
      {allowCustom && (
        <View style={styles.customRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            value={customText}
            onChangeText={setCustomText}
            onSubmitEditing={addCustom}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: brandColors.primary }]}
            onPress={addCustom}
          >
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected tags */}
      {selectedValues.length > 0 && (
        <View style={styles.selectedTagsRow}>
          {selectedValues.map((val) => (
            <View
              key={val}
              style={[
                styles.selectedTag,
                { backgroundColor: brandColors.primaryLight, borderColor: brandColors.primary },
              ]}
            >
              <Text style={[styles.selectedTagText, { color: brandColors.primary }]}>{val}</Text>
              <TouchableOpacity onPress={() => toggleOption(val)}>
                <Text style={[styles.removeTag, { color: brandColors.primary }]}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipScroll: {
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  addButton: {
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  selectedTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeTag: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
});

