import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Button from './Button';
import { PackageIcon } from '../branding/Icons';

export interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  message?: string;
  actionTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  message,
  actionTitle,
  actionLabel,
  onAction,
}) => {
  const { colors, brandColors } = useTheme();
  const descText = description || message;
  const actionBtnText = actionTitle || actionLabel;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: brandColors.primaryLight,
          },
        ]}
      >
        {icon ? (
          typeof icon === 'string' ? (
            <Text style={{ fontSize: 28 }}>{icon}</Text>
          ) : (
            icon
          )
        ) : (
          <PackageIcon size={32} color={brandColors.primary} />
        )}
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {descText ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {descText}
        </Text>
      ) : null}
      {actionBtnText && onAction ? (
        <Button
          title={actionBtnText}
          onPress={onAction}
          variant="primary"
          size="sm"
          style={styles.actionBtn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: 4,
  },
});

export default EmptyState;
