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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../hooks/useTheme';
import { StoreTypeCode } from '../types';
import { STORE_TYPE_METADATA } from '../constants';

interface AddProductLayoutProps {
  storeType: StoreTypeCode;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  onBack: () => void;
  onSave: () => void;
  onSaveDraft?: () => void;
  children: React.ReactNode;
}

export const AddProductLayout: React.FC<AddProductLayoutProps> = ({
  storeType,
  title,
  subtitle,
  isLoading = false,
  onBack,
  onSave,
  onSaveDraft,
  children,
}) => {
  const { colors, brandColors } = useTheme();
  const meta = STORE_TYPE_METADATA[storeType] || {
    displayName: 'Store',
    icon: 'cube',
    badgeColor: brandColors.primary,
  };

  const pageTitle = title || `Add ${meta.displayName} Product`;
  const pageSubtitle = subtitle || `Configure specifications and inventory for ${meta.displayName}`;

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
                {pageTitle}
              </Text>
              <View style={[styles.badge, { backgroundColor: meta.badgeColor + '20' }]}>
                <Ionicons name={meta.icon as any} size={12} color={meta.badgeColor} />
                <Text style={[styles.badgeText, { color: meta.badgeColor }]}>{meta.displayName}</Text>
              </View>
            </View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {pageSubtitle}
            </Text>
          </View>
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
          {onSaveDraft && (
            <TouchableOpacity
              style={[styles.draftButton, { borderColor: colors.border }]}
              onPress={onSaveDraft}
              disabled={isLoading}
            >
              <Ionicons name="bookmark-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.draftButtonText, { color: colors.textSecondary }]}>Save Draft</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: brandColors.primary }]}
            onPress={onSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Product</Text>
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
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
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
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
  },
  draftButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
