import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  colors: readonly [string, string, ...string[]];
  style?: ViewStyle;
  children: ReactNode;
}

export default function GradientCard({ colors, style, children }: Props) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
  },
});
