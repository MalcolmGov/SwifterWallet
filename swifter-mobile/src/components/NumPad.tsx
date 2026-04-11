import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import * as Haptics from "expo-haptics";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function NumPad({ value, onChange }: Props) {
  const { colors, isDark } = useTheme();

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "del"] as const;

  const handlePress = (key: typeof keys[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (key === "del") {
      onChange(value.slice(0, -1));
    } else if (key === "." && value.includes(".")) {
      return;
    } else {
      // Limit to 2 decimal places
      if (value.includes(".") && value.split(".")[1].length >= 2) return;
      onChange(value + String(key));
    }
  };

  return (
    <View style={styles.grid}>
      {keys.map((key) => (
        <TouchableOpacity
          key={String(key)}
          onPress={() => handlePress(key)}
          activeOpacity={0.6}
          style={[
            styles.key,
            key !== "del" && {
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            },
          ]}
        >
          {key === "del" ? (
            <Ionicons name="backspace-outline" size={22} color={colors.textMuted} />
          ) : (
            <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 10,
  },
  key: {
    width: "30%",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: {
    fontSize: 22,
    fontWeight: "500",
  },
});
