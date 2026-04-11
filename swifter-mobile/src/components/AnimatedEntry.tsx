import React, { useEffect, useRef, ReactNode } from "react";
import { Animated, Platform, ViewStyle } from "react-native";

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
    const useNative = Platform.OS !== "web";
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: useNative,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: useNative,
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
