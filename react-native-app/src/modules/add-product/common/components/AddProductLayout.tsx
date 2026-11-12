import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../../hooks/useTheme';
import { useScreenSystemBar } from '../../../../utils/systemBar';
import { ArrowLeftIcon, CheckIcon, BookmarkIcon } from '../../../../components/branding/Icons';
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
  const insets = useSafeAreaInsets();

  // Dynamic white header / status bar synchronization
  useScreenSystemBar('white');

  const meta = STORE_TYPE_METADATA[storeType] || {
    displayName: 'Store',
    icon: 'cube',
    badgeColor: brandColors.primary,
  };

  const pageTitle = title || `Add ${meta.displayName} Product`;
  const pageSubtitle = subtitle || `Configure specifications and inventory for ${meta.displayName}`;

  const topPadding = insets.top > 0 ? insets.top + 6 : 12;

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Navigation Bar Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
              paddingTop: topPadding,
            },
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={isLoading} activeOpacity={0.7}>
            <ArrowLeftIcon size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                {pageTitle}
              </Text>
              <View style={[styles.badge, { backgroundColor: meta.badgeColor + '20' }]}>
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {/* Bottom Actions Bar */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 14),
            },
          ]}
        >
          {onSaveDraft && (
            <TouchableOpacity
              style={[styles.draftButton, { borderColor: colors.border }]}
              onPress={onSaveDraft}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <BookmarkIcon size={18} color={colors.textSecondary} />
              <Text style={[styles.draftButtonText, { color: colors.textSecondary }]}>Save Draft</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: brandColors.primary }]}
            onPress={onSave}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <CheckIcon size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Product</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
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
    paddingBottom: 12,
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
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  draftButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AddProductLayout;
