import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface AnimatedTabScreenProps {
  children: React.ReactNode;
}

/**
 * Lightweight tab transition wrapper using native-driver Animated API.
 * Adds smooth fade + subtle slide-in when switching bottom tabs without remounting state,
 * while explicitly hiding blurred tabs on Android so inactive tabs never overlap active tabs.
 */
export const AnimatedTabScreen: React.FC<AnimatedTabScreenProps> = ({ children }) => {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(isFocused ? 0 : 6)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isFocused) {
      opacity.stopAnimation();
      translateY.stopAnimation();
      opacity.setValue(0.86);
      translateY.setValue(6);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.stopAnimation();
      translateY.stopAnimation();
      opacity.setValue(0);
      translateY.setValue(6);
    }
  }, [isFocused, opacity, translateY]);

  return (
    <View
      pointerEvents={isFocused ? 'auto' : 'none'}
      style={[
        styles.container,
        isFocused ? styles.visible : styles.hidden,
      ]}
    >
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
    </View>
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
  visible: {
    display: 'flex',
  },
  hidden: {
    display: 'none',
  },
});

export default AnimatedTabScreen;
