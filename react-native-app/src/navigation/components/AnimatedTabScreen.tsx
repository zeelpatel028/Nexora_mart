import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface AnimatedTabScreenProps {
  children: React.ReactNode;
}

/**
 * Lightweight tab transition wrapper using native-driver Animated API.
 * Adds smooth fade + subtle slide-in when switching bottom tabs without remounting state.
 */
export const AnimatedTabScreen: React.FC<AnimatedTabScreenProps> = ({ children }) => {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0.92)).current;
  const translateY = useRef(new Animated.Value(isFocused ? 0 : 6)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isFocused) {
      opacity.setValue(0.82);
      translateY.setValue(8);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export function withTabTransition<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  const ComponentWithTransition: React.FC<P> = (props) => (
    <AnimatedTabScreen>
      <WrappedComponent {...props} />
    </AnimatedTabScreen>
  );
  ComponentWithTransition.displayName = `WithTabTransition(${
    WrappedComponent.displayName || WrappedComponent.name || 'Screen'
  })`;
  return ComponentWithTransition;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedTabScreen;
