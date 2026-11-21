// apps/mobile/src/components/FadeIn.tsx
//
// Makes whatever is inside it appear gently: it fades in and slides up a little when
// it first shows. Cards in a list can use a growing `delay`, so they arrive one after
// another. Nothing moves when the phone's "reduce motion" setting is on.
// Owned by Rubaiya.

import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Wait this many milliseconds before appearing (keep it small, like 60 x the card number). */
  delay?: number;
};

export function FadeIn({ children, delay = 0 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          progress.setValue(1);
          return;
        }
        animation = Animated.timing(progress, {
          toValue: 1,
          duration: 420,
          delay: Math.min(delay, 400),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        });
        animation.start();
      })
      .catch(() => progress.setValue(1));
    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [delay, progress]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
