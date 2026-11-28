import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppIcon, { IconName } from '../icons/AppIcon';

export interface KpiCardItem {
  id: string;
  title: string;
  value: string;
  sub: string;
  subColor?: string;
  icon: IconName;
  accent: string;
  tintBg: string;
  onPress: () => void;
}

interface DashboardKpiGridProps {
  cards: KpiCardItem[];
  loading: boolean;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = React.memo(({ cards, loading }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.kpiGrid}>
      {cards.map((card) => (
        <TouchableOpacity
          key={card.id}
          activeOpacity={0.82}
          onPress={card.onPress}
          style={[
            styles.kpiCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.kpiTopRow}>
            <View style={[styles.kpiIconBox, { backgroundColor: card.tintBg }]}>
              <AppIcon name={card.icon} size={18} color={card.accent} />
            </View>
            <AppIcon name="right" size={14} color={colors.textMuted} />
          </View>
          <Text style={[styles.kpiTitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {card.title}
          </Text>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]} numberOfLines={1}>
            {loading ? '...' : card.value}
          </Text>
          <Text style={[styles.kpiSub, { color: card.subColor || card.accent }]} numberOfLines={1}>
            {card.sub}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kpiCard: {
    width: '48.5%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: { fontSize: 12, fontWeight: '600' },
  kpiValue: { fontSize: 19, fontWeight: '900', marginTop: 2, letterSpacing: -0.3 },
  kpiSub: { fontSize: 11, fontWeight: '700', marginTop: 4 },
});

export default DashboardKpiGrid;
