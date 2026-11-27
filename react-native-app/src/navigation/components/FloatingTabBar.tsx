import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

type TabIconKey = 'home' | 'customers' | 'billing' | 'products' | 'grid';

interface TabMeta {
  label: string;
  icon: TabIconKey;
  semanticColor: string;
}

const TAB_META: Record<string, TabMeta> = {
  DashboardTab: { label: 'Home', icon: 'home', semanticColor: '#F57C00' },
  CustomerTab: { label: 'Customer', icon: 'customers', semanticColor: '#2EAD64' },
  PosTab: { label: 'Make Bill', icon: 'billing', semanticColor: '#8B5CF6' },
  ProductsTab: { label: 'Products', icon: 'products', semanticColor: '#2196F3' },
  MoreTab: { label: 'More', icon: 'grid', semanticColor: '#64748B' },
};

const TabSvgIcon: React.FC<{ name: TabIconKey; color: string; size?: number }> = ({
  name,
  color,
  size = 20,
}) => {
  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M5 12l-2 0l9 -9l9 9l-2 0" />
          <Path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
          <Path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
        </Svg>
      );
    case 'customers':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
          <Path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
          <Path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
        </Svg>
      );
    case 'billing':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <Path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
          <Path d="M9 9l1 0" />
          <Path d="M9 13l6 0" />
          <Path d="M9 17l6 0" />
        </Svg>
      );
    case 'products':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 3l8 4.5v9l-8 4.5l-8 -4.5v-9l8 -4.5" />
          <Path d="M12 12l8 -4.5" />
          <Path d="M12 12v9" />
          <Path d="M12 12l-8 -4.5" />
        </Svg>
      );
    case 'grid':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M4 4h6v6h-6z" />
          <Path d="M14 4h6v6h-6z" />
          <Path d="M4 14h6v6h-6z" />
          <Path d="M14 14h6v6h-6z" />
        </Svg>
      );
  }
};

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, brandColors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const indicatorX = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(state.routes.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subShow = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const subHide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const tabCount = state.routes.length || 5;
  const horizontalInset = 6;
  const innerWidth = Math.max(0, barWidth - horizontalInset * 2);
  const tabWidth = innerWidth / tabCount;

  useEffect(() => {
    if (tabWidth > 0) {
      Animated.spring(indicatorX, {
        toValue: state.index * tabWidth,
        useNativeDriver: true,
        stiffness: 240,
        damping: 24,
        mass: 0.85,
      }).start();
    }

    state.routes.forEach((_, idx) => {
      Animated.spring(scaleAnims[idx], {
        toValue: idx === state.index ? 1.08 : 1,
        useNativeDriver: true,
        stiffness: 260,
        damping: 20,
      }).start();
    });
  }, [state.index, tabWidth, indicatorX, scaleAnims, state.routes]);

  if (keyboardVisible) {
    return null;
  }

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - barWidth) > 1) {
      setBarWidth(w);
    }
  };

  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 6);

  return (
    <View
      style={[
        styles.outerWrap,
        {
          paddingBottom: bottomPadding,
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        onLayout={handleLayout}
        style={[
          styles.floatingBar,
          {
            backgroundColor: isDark ? colors.tabBarBg : '#FFFFFF',
            borderColor: isDark ? colors.tabBarBorder : '#ECEFF5',
            shadowColor: isDark ? '#000000' : '#0F172A',
          },
        ]}
      >
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicatorWrap,
              {
                width: tabWidth,
                left: horizontalInset,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          >
            <View
              style={[
                styles.activePill,
                {
                  backgroundColor: isDark ? colors.badgeOrangeBg : brandColors.lightOrange,
                },
              ]}
            />
            <View
              style={[
                styles.activeTopLine,
                { backgroundColor: brandColors.primaryOrange },
              ]}
            />
          </Animated.View>
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const meta = TAB_META[route.name] || {
            label: route.name,
            icon: 'grid' as TabIconKey,
            semanticColor: brandColors.primaryOrange,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconColor = isFocused
            ? meta.icon === 'grid'
              ? brandColors.primaryOrange
              : meta.semanticColor
            : isDark
            ? '#7E8BA3'
            : meta.semanticColor + 'AA';

          const labelColor = isFocused ? brandColors.primaryOrange : colors.textSecondary;
          const isCenterBill = route.name === 'PosTab';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || meta.label}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.78}
              style={styles.tabButton}
            >
              <Animated.View
                style={[
                  styles.iconHolder,
                  isCenterBill &&
                    isFocused && {
                      backgroundColor: brandColors.primaryOrange,
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    },
                  { transform: [{ scale: scaleAnims[index] }] },
                ]}
              >
                <TabSvgIcon
                  name={meta.icon}
                  size={20}
                  color={isCenterBill && isFocused ? '#FFFFFF' : iconColor}
                />
              </Animated.View>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: labelColor,
                    fontWeight: isFocused ? '800' : '600',
                  },
                ]}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrap: { paddingHorizontal: 12, paddingTop: 4 },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 6,
    borderRadius: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
    position: 'relative',
  },
  activeIndicatorWrap: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  activePill: { width: '100%', height: '100%', borderRadius: 16 },
  activeTopLine: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    zIndex: 1,
  },
  iconHolder: { alignItems: 'center', justifyContent: 'center', marginBottom: 3, minHeight: 24 },
  tabLabel: { fontSize: 10.5, letterSpacing: 0.1 },
});

export default FloatingTabBar;
