import React, { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect as coreUseFocusEffect } from '@react-navigation/core';

/**
 * Universal, fail-safe useFocusEffect hook.
 * Directly calls @react-navigation/core's useFocusEffect if present,
 * or gracefully falls back to React.useEffect + navigation.addListener('focus').
 */
export const useFocusEffect = (effect: () => void | (() => void)) => {
  if (typeof coreUseFocusEffect === 'function') {
    return coreUseFocusEffect(effect);
  }

  const navigation = useNavigation<any>();

  useEffect(() => {
    let cleanup: any;

    if (navigation && typeof navigation.isFocused === 'function' && navigation.isFocused()) {
      cleanup = effect();
    }

    const unsubFocus = navigation && typeof navigation.addListener === 'function'
      ? navigation.addListener('focus', () => {
          if (cleanup) cleanup();
          cleanup = effect();
        })
      : undefined;

    const unsubBlur = navigation && typeof navigation.addListener === 'function'
      ? navigation.addListener('blur', () => {
          if (cleanup) cleanup();
          cleanup = undefined;
        })
      : undefined;

    return () => {
      if (cleanup) cleanup();
      if (typeof unsubFocus === 'function') unsubFocus();
      if (typeof unsubBlur === 'function') unsubBlur();
    };
  }, [effect, navigation]);
};

export default useFocusEffect;
