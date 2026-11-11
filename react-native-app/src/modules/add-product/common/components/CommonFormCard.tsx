import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../hooks/useTheme';

interface CommonFormCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  icon?: React.ReactNode | string;
}

export const CommonFormCard: React.FC<CommonFormCardProps> = ({
  title,
  subtitle,
  badge,
  children,
  collapsible = false,
  defaultExpanded = true,
  icon,
}) => {
  const { colors, brandColors } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      if (icon.length <= 4) {
        return <Text style={{ fontSize: 18 }}>{icon}</Text>;
      }
      return <Ionicons name={icon as any} size={20} color={brandColors.primary} />;
    }
    return icon;
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={collapsible ? 0.7 : 1}
        onPress={() => collapsible && setExpanded(!expanded)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          {icon ? <View style={styles.iconContainer}>{renderIcon()}</View> : null}
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
              {badge ? (
                <View style={[styles.badge, { backgroundColor: brandColors.primaryLight }]}>
                  <Text style={[styles.badgeText, { color: brandColors.primary }]}>{badge}</Text>
                </View>
              ) : null}
            </View>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            ) : null}
          </View>
        </View>

        {collapsible ? (
          <Text style={[styles.chevron, { color: brandColors.primary }]}>
            {expanded ? '▲' : '▼'}
          </Text>
        ) : null}
      </TouchableOpacity>

      {expanded ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 14,
    fontWeight: '700',
    paddingLeft: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

