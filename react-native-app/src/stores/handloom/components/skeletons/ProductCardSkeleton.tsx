import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import SkeletonLoader from '../common/SkeletonLoader';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <SkeletonLoader width={56} height={56} borderRadius={10} />
        <View style={styles.info}>
          <SkeletonLoader width="65%" height={16} borderRadius={4} />
          <SkeletonLoader width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
          <View style={styles.priceRow}>
            <SkeletonLoader width="30%" height={14} borderRadius={4} />
            <SkeletonLoader width="25%" height={14} borderRadius={4} />
          </View>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default ProductCardSkeleton;
