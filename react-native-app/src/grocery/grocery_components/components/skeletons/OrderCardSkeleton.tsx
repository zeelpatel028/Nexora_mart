import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import SkeletonLoader from '../common/SkeletonLoader';

export const OrderCardSkeleton: React.FC = () => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <SkeletonLoader width="35%" height={16} borderRadius={4} />
        <SkeletonLoader width="25%" height={22} borderRadius={12} />
      </View>
      <SkeletonLoader width="70%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      <SkeletonLoader width="50%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
      <View style={styles.footer}>
        <SkeletonLoader width="30%" height={16} borderRadius={4} />
        <SkeletonLoader width="25%" height={32} borderRadius={8} />
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default OrderCardSkeleton;
