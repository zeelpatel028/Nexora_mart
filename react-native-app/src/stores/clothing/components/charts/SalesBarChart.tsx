import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface ChartDataPoint {
  label: string;
  value: number;
  highlight?: boolean;
}

interface SalesBarChartProps {
  data: ChartDataPoint[];
  height?: number;
  valuePrefix?: string;
  barColor?: string;
}

export const SalesBarChart: React.FC<SalesBarChartProps> = React.memo(
  ({ data, height = 132, valuePrefix = '₹', barColor }) => {
    const { colors, brandColors, isDark } = useTheme();
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      animValue.setValue(0);
      Animated.timing(animValue, {
        toValue: 1,
        duration: 420,
        useNativeDriver: false,
      }).start();
    }, [data, animValue]);

    const maxVal = Math.max(...data.map((d) => Number(d.value) || 0), 1);
    const activeColor = barColor || brandColors.primaryOrange;

    const formatCompact = (v: number): string => {
      if (v >= 100000) return `${valuePrefix}${(v / 100000).toFixed(1)}L`;
      if (v >= 1000) return `${valuePrefix}${(v / 1000).toFixed(1)}k`;
      if (v > 0) return `${valuePrefix}${Math.round(v)}`;
      return '';
    };

    return (
      <View style={styles.container}>
        <View style={[styles.barsRow, { height }]}>
          {data.map((item, idx) => {
            const pct = Math.max(0.06, (Number(item.value) || 0) / maxVal);
            const targetHeight = Math.round(pct * (height - 26));
            const animatedHeight = animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [4, targetHeight],
            });

            return (
              <View key={`${item.label}-${idx}`} style={styles.barColumn}>
                <Text
                  style={[styles.barValue, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {formatCompact(Number(item.value) || 0)}
                </Text>
                <View
                  style={[
                    styles.barTrack,
                    {
                      height: height - 26,
                      backgroundColor: isDark ? '#252F42' : '#F2F4F8',
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.barFill,
                      {
                        height: animatedHeight,
                        backgroundColor: item.highlight
                          ? activeColor
                          : Number(item.value) > 0
                          ? brandColors.secondaryOrange
                          : isDark
                          ? '#334155'
                          : '#DFE4EC',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barLabel,
                    {
                      color: item.highlight ? activeColor : colors.textSecondary,
                      fontWeight: item.highlight ? '700' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 6,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    minHeight: 14,
  },
  barTrack: {
    width: '68%',
    maxWidth: 26,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 6,
  },
});

export default SalesBarChart;
