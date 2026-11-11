import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../../../hooks/useTheme';

interface ImageItem {
  id?: string;
  image_url: string;
  is_primary?: boolean;
}

interface CommonImagePickerProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export const CommonImagePicker: React.FC<CommonImagePickerProps> = ({ images = [], onChange }) => {
  const { colors, brandColors } = useTheme();
  const [urlInput, setUrlInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const addImageUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const isFirst = images.length === 0;
    onChange([
      ...images,
      {
        id: String(Date.now()),
        image_url: trimmed,
        is_primary: isFirst,
      },
    ]);
    setUrlInput('');
    setShowInput(false);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
      updated[0].is_primary = true;
    }
    onChange(updated);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Product Images</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {images.map((img, idx) => (
          <View
            key={img.id || idx}
            style={[
              styles.imageCard,
              {
                borderColor: img.is_primary ? brandColors.primary : colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Image source={{ uri: img.image_url }} style={styles.image} resizeMode="cover" />

            {img.is_primary && (
              <View style={[styles.primaryBadge, { backgroundColor: brandColors.primary }]}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}

            <View style={styles.cardActions}>
              {!img.is_primary && (
                <TouchableOpacity onPress={() => setPrimary(idx)} style={styles.actionBtn}>
                  <Text style={[styles.actionText, { color: brandColors.primary }]}>★ Make</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => removeImage(idx)} style={styles.actionBtn}>
                <Text style={[styles.actionText, { color: brandColors.error }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Button */}
        <TouchableOpacity
          style={[
            styles.addCard,
            { borderColor: brandColors.primary, backgroundColor: brandColors.primaryLight },
          ]}
          onPress={() => setShowInput(true)}
        >
          <Text style={[styles.plusIcon, { color: brandColors.primary }]}>+</Text>
          <Text style={[styles.addText, { color: brandColors.primary }]}>Add Image</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* URL Input Form */}
      {showInput && (
        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Paste image URL (https://...)"
            placeholderTextColor={colors.textMuted}
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: brandColors.primary }]}
            onPress={addImageUrl}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setShowInput(false);
              setUrlInput('');
            }}
          >
            <Text style={{ color: colors.textSecondary }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  scroll: {
    flexDirection: 'row',
  },
  imageCard: {
    width: 100,
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 85,
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    height: 32,
  },
  actionBtn: {
    padding: 2,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addCard: {
    width: 100,
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 24,
    fontWeight: '700',
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    marginTop: 10,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
  },
  saveText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    padding: 4,
  },
});

