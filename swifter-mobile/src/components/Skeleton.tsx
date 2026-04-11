import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function Skeleton({ width = "100%", height = 16, borderRadius = 12, style }: Props) {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          opacity,
        },
        style,
      ]}
    />
  );
}

// Pre-built skeleton layouts
export function DashboardSkeleton() {
  const { colors } = useTheme();
  return (
    <>
      {/* Header */}
      <Animated.View style={skeletonStyles.header}>
        <Animated.View>
          <Skeleton width={100} height={14} />
          <Skeleton width={140} height={22} style={{ marginTop: 8 }} />
        </Animated.View>
        <Animated.View style={skeletonStyles.headerActions}>
          <Skeleton width={40} height={40} borderRadius={14} />
          <Skeleton width={40} height={40} borderRadius={14} />
        </Animated.View>
      </Animated.View>

      {/* Balance card */}
      <Skeleton width="100%" height={160} borderRadius={24} style={{ marginHorizontal: 24, marginTop: 8 }} />

      {/* Quick actions */}
      <Animated.View style={skeletonStyles.actionsRow}>
        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={skeletonStyles.actionItem}>
            <Skeleton width={52} height={52} borderRadius={18} />
            <Skeleton width={48} height={12} style={{ marginTop: 8 }} />
          </Animated.View>
        ))}
      </Animated.View>

      {/* Section title */}
      <Skeleton width={100} height={18} style={{ marginHorizontal: 24, marginTop: 28 }} />

      {/* Wallet cards */}
      <Animated.View style={skeletonStyles.walletRow}>
        <Skeleton width={200} height={120} borderRadius={20} />
        <Skeleton width={200} height={120} borderRadius={20} />
      </Animated.View>

      {/* Transactions */}
      <Skeleton width={140} height={18} style={{ marginHorizontal: 24, marginTop: 24 }} />
      <Animated.View style={skeletonStyles.txList}>
        {[1, 2, 3, 4].map((i) => (
          <Animated.View key={i} style={skeletonStyles.txItem}>
            <Skeleton width={40} height={40} borderRadius={14} />
            <Animated.View style={{ flex: 1, marginLeft: 12 }}>
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
            </Animated.View>
            <Skeleton width={70} height={14} />
          </Animated.View>
        ))}
      </Animated.View>
    </>
  );
}

const skeletonStyles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingVertical: 16 },
  headerActions: { flexDirection: "row", gap: 8 },
  actionsRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 24, marginTop: 24 },
  actionItem: { alignItems: "center" },
  walletRow: { flexDirection: "row", gap: 12, paddingHorizontal: 24, marginTop: 12 },
  txList: { paddingHorizontal: 24, marginTop: 12, gap: 16 },
  txItem: { flexDirection: "row", alignItems: "center" },
});
