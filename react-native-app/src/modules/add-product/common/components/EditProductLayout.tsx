import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../hooks/useTheme';
import { StoreTypeCode } from '../types';
import { STORE_TYPE_METADATA } from '../constants';

interface EditProductLayoutProps {
  storeType: StoreTypeCode;
  productName?: string;
  sku?: string;
  isLoading?: boolean;
  onBack: () => void;
  onUpdate: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}

export const EditProductLayout: React.FC<EditProductLayoutProps> = ({
  storeType,
  productName,
  sku,
  isLoading = false,
  onBack,
  onUpdate,
  onDelete,
  children,
}) => {
  const { colors, brandColors } = useTheme();
  const meta = STORE_TYPE_METADATA[storeType] || {
    displayName: 'Store',
    icon: 'cube',
    badgeColor: brandColors.primary,
  };

  const handleDeletePrompt = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${productName || 'this product'}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Navigation Bar Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={isLoading}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                {productName || 'Edit Product'}
              </Text>
              <View style={[styles.badge, { backgroundColor: meta.badgeColor + '20' }]}>
                <Ionicons name={meta.icon as any} size={12} color={meta.badgeColor} />
                <Text style={[styles.badgeText, { color: meta.badgeColor }]}>{meta.displayName}</Text>
              </View>
            </View>
            {sku ? (
              <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                SKU: {sku}
              </Text>
            ) : null}
          </View>

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePrompt}
              disabled={isLoading}
            >
              <Ionicons name="trash-outline" size={22} color={brandColors.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable Form Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {/* Bottom Actions Bar */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={onBack}
            disabled={isLoading}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: brandColors.primary }]}
            onPress={onUpdate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={19} color="#FFFFFF" />
                <Text style={styles.updateButtonText}>Update Product</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  deleteButton: {
    padding: 6,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  updateButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
