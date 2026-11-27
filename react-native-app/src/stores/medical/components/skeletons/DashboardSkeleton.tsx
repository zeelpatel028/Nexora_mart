import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from '../common/SkeletonLoader';
import AppCard from '../common/AppCard';

export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Top Banner Skeleton */}
      <SkeletonLoader width="100%" height={90} borderRadius={16} style={{ marginBottom: 16 }} />

      {/* 4 Metric Cards */}
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <AppCard key={i} style={styles.gridCard}>
            <SkeletonLoader width={36} height={36} borderRadius={18} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="60%" height={18} borderRadius={4} style={{ marginBottom: 4 }} />
            <SkeletonLoader width="40%" height={12} borderRadius={4} />
          </AppCard>
        ))}
      </View>

      {/* Recent Activity List */}
      <SkeletonLoader width="45%" height={18} borderRadius={4} style={{ marginVertical: 14 }} />
      {[1, 2, 3].map((i) => (
        <AppCard key={i} style={{ padding: 12, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <SkeletonLoader width="50%" height={14} borderRadius={4} />
            <SkeletonLoader width="20%" height={14} borderRadius={4} />
          </View>
        </AppCard>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    padding: 12,
    marginBottom: 10,
  },
});

export default DashboardSkeleton;
