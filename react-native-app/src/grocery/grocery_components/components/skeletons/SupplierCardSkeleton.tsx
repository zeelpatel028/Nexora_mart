import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import SkeletonLoader from '../common/SkeletonLoader';

export const SupplierCardSkeleton: React.FC = () => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <SkeletonLoader width={48} height={48} borderRadius={10} />
        <View style={styles.info}>
          <SkeletonLoader width="55%" height={16} borderRadius={4} />
          <SkeletonLoader width="45%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <View style={styles.balance}>
          <SkeletonLoader width={70} height={16} borderRadius={4} />
          <SkeletonLoader width={45} height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  balance: {
    alignItems: 'flex-end',
  },
});

export default SupplierCardSkeleton;
