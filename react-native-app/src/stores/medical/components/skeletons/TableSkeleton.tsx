import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from '../common/SkeletonLoader';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <SkeletonLoader width="30%" height={14} borderRadius={4} />
        <SkeletonLoader width="20%" height={14} borderRadius={4} />
        <SkeletonLoader width="25%" height={14} borderRadius={4} />
        <SkeletonLoader width="15%" height={14} borderRadius={4} />
      </View>
      {Array.from({ length: rows }).map((_, idx) => (
        <View key={idx} style={styles.bodyRow}>
          <SkeletonLoader width="35%" height={14} borderRadius={4} />
          <SkeletonLoader width="18%" height={14} borderRadius={4} />
          <SkeletonLoader width="22%" height={14} borderRadius={4} />
          <SkeletonLoader width="12%" height={14} borderRadius={4} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F3F4F6',
  },
  bodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
});

export default TableSkeleton;
