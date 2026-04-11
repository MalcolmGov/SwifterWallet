import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const ITEMS = [
  { icon: "person-outline" as const, label: "Profile", desc: "Manage your account" },
  { icon: "notifications-outline" as const, label: "Notifications", desc: "Alerts & preferences" },
  { icon: "card-outline" as const, label: "Payment Methods", desc: "Cards & bank accounts" },
  { icon: "shield-checkmark-outline" as const, label: "Security", desc: "PIN, biometrics" },
  { icon: "help-circle-outline" as const, label: "Help & Support", desc: "FAQ, contact us" },
];

export default function SettingsScreen() {
  const { colors, isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.7}
            style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6" }]}>
              <Ionicons name={item.icon} size={18} color={isDark ? "#d1d5db" : "#6b7280"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.desc, { color: colors.textMuted }]}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
          </TouchableOpacity>
        ))}

        {/* Theme toggle */}
        <TouchableOpacity
          onPress={toggle}
          activeOpacity={0.7}
          style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.divider }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6" }]}>
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={isDark ? "#fbbf24" : "#6b7280"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.text }]}>Appearance</Text>
            <Text style={[styles.desc, { color: colors.textMuted }]}>{isDark ? "Switch to light mode" : "Switch to dark mode"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.textSoft }]}>Swifter v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  title: { fontSize: 20, fontWeight: "600" },
  card: { marginHorizontal: 24, borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 14, fontWeight: "500" },
  desc: { fontSize: 12, marginTop: 2 },
  version: { textAlign: "center", fontSize: 12, marginTop: 32 },
});
