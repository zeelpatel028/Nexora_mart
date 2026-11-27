import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import SkeletonLoader from '../common/SkeletonLoader';

export const InvoiceCardSkeleton: React.FC = () => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="50%" height={16} borderRadius={4} />
          <SkeletonLoader width="35%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <SkeletonLoader width={70} height={20} borderRadius={6} />
      </View>
      <View style={styles.rowBottom}>
        <SkeletonLoader width="30%" height={14} borderRadius={4} />
        <SkeletonLoader width="25%" height={16} borderRadius={4} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default InvoiceCardSkeleton;
