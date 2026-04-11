import React, { useEffect, useRef, ReactNode } from "react";
import { Animated, ViewStyle } from "react-native";

interface Props {
  children: ReactNode;
  delay?: number;
  duration?: number;
  slideFrom?: number;
  style?: ViewStyle;
}

/**
 * Wraps children with a fade-in + slide-up animation.
 * Use delay to stagger multiple items.
 */
export default function AnimatedEntry({ children, delay = 0, duration = 500, slideFrom = 20, style }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideFrom)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
  }, [opacity, translateY, delay, duration]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
