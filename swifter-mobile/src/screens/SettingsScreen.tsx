import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { Gradients } from "../constants/theme";
import AnimatedEntry from "../components/AnimatedEntry";

const ACCOUNT_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string; desc: string; iconColor: string; iconBg: string; iconBgDark: string }[] = [
  { icon: "person-outline", label: "Profile", desc: "Manage your account details", iconColor: "#7c3aed", iconBg: "#f5f3ff", iconBgDark: "rgba(124,58,237,0.12)" },
  { icon: "card-outline", label: "Payment Methods", desc: "Cards & bank accounts", iconColor: "#3b82f6", iconBg: "#eff6ff", iconBgDark: "rgba(59,130,246,0.12)" },
  { icon: "shield-checkmark-outline", label: "Security", desc: "PIN, biometrics & passwords", iconColor: "#10b981", iconBg: "#ecfdf5", iconBgDark: "rgba(16,185,129,0.12)" },
];

const PREFERENCES_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string; desc: string; iconColor: string; iconBg: string; iconBgDark: string }[] = [
  { icon: "notifications-outline", label: "Notifications", desc: "Alerts & push preferences", iconColor: "#f59e0b", iconBg: "#fffbeb", iconBgDark: "rgba(245,158,11,0.12)" },
  { icon: "language-outline", label: "Language", desc: "English (South Africa)", iconColor: "#6366f1", iconBg: "#eef2ff", iconBgDark: "rgba(99,102,241,0.12)" },
];

const SUPPORT_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string; desc: string; iconColor: string; iconBg: string; iconBgDark: string }[] = [
  { icon: "help-circle-outline", label: "Help & Support", desc: "FAQ, contact us", iconColor: "#ec4899", iconBg: "#fdf2f8", iconBgDark: "rgba(236,72,153,0.12)" },
  { icon: "document-text-outline", label: "Terms & Privacy", desc: "Legal documents", iconColor: "#6b7280", iconBg: "#f3f4f6", iconBgDark: "rgba(107,114,128,0.12)" },
];

export default function SettingsScreen() {
  const { colors, isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();

  const renderItem = (item: typeof ACCOUNT_ITEMS[0], index: number, isLast: boolean) => (
    <TouchableOpacity
      key={item.label}
      activeOpacity={0.7}
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: isDark ? item.iconBgDark : item.iconBg }]}>
        <Ionicons name={item.icon} size={18} color={item.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
        <Text style={[styles.desc, { color: colors.textMuted }]}>{item.desc}</Text>
      </View>
      <View style={[styles.chevronWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb" }]}>
        <Ionicons name="chevron-forward" size={14} color={colors.textSoft} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          </View>
        </AnimatedEntry>

        {/* Profile Card */}
        <AnimatedEntry delay={80}>
          <TouchableOpacity activeOpacity={0.85} style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <LinearGradient colors={Gradients.violet} style={styles.profileAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.profileInitials}>MG</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.text }]}>Malcolm</Text>
              <Text style={[styles.profileEmail, { color: colors.textMuted }]}>demo@swifter.app</Text>
            </View>
            <View style={[styles.chevronWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb" }]}>
              <Ionicons name="chevron-forward" size={14} color={colors.textSoft} />
            </View>
          </TouchableOpacity>
        </AnimatedEntry>

        {/* Appearance Toggle */}
        <AnimatedEntry delay={160}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: isDark ? "rgba(251,191,36,0.12)" : "#fffbeb" }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={18} color={isDark ? "#fbbf24" : "#f59e0b"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.desc, { color: colors.textMuted }]}>{isDark ? "Currently using dark theme" : "Currently using light theme"}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggle}
                trackColor={{ false: "#d1d5db", true: "rgba(124,58,237,0.4)" }}
                thumbColor={isDark ? "#7c3aed" : "#fff"}
                ios_backgroundColor="#d1d5db"
              />
            </View>
          </View>
        </AnimatedEntry>

        {/* Account Section */}
        <AnimatedEntry delay={240}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {ACCOUNT_ITEMS.map((item, i) => renderItem(item, i, i === ACCOUNT_ITEMS.length - 1))}
          </View>
        </AnimatedEntry>

        {/* Preferences Section */}
        <AnimatedEntry delay={320}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {PREFERENCES_ITEMS.map((item, i) => renderItem(item, i, i === PREFERENCES_ITEMS.length - 1))}
          </View>
        </AnimatedEntry>

        {/* Support Section */}
        <AnimatedEntry delay={400}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SUPPORT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {SUPPORT_ITEMS.map((item, i) => renderItem(item, i, i === SUPPORT_ITEMS.length - 1))}
          </View>
        </AnimatedEntry>

        {/* Logout */}
        <AnimatedEntry delay={480}>
          <TouchableOpacity activeOpacity={0.7} style={[styles.logoutBtn, { backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "#fef2f2", borderColor: isDark ? "rgba(239,68,68,0.15)" : "#fecaca" }]}>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </AnimatedEntry>

        {/* Version */}
        <AnimatedEntry delay={560}>
          <View style={styles.versionRow}>
            <Text style={[styles.versionLabel, { color: colors.textSoft }]}>Swifter</Text>
            <Text style={[styles.version, { color: colors.textSoft }]}>v1.0.0</Text>
          </View>
        </AnimatedEntry>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },

  profileCard: {
    flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 24, padding: 18,
    borderRadius: 22, borderWidth: 1, marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  profileAvatar: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  profileInitials: { color: "#fff", fontSize: 18, fontWeight: "700" },
  profileName: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  profileEmail: { fontSize: 13, marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, paddingHorizontal: 24, marginTop: 24, marginBottom: 10 },

  card: {
    marginHorizontal: 24, borderRadius: 22, borderWidth: 1, overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 15, fontWeight: "600", letterSpacing: -0.1 },
  desc: { fontSize: 12, marginTop: 2 },
  chevronWrap: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginHorizontal: 24, marginTop: 28, paddingVertical: 16, borderRadius: 18, borderWidth: 1,
  },
  logoutText: { color: "#ef4444", fontSize: 15, fontWeight: "600" },

  versionRow: { alignItems: "center", marginTop: 24, gap: 2 },
  versionLabel: { fontSize: 13, fontWeight: "600", letterSpacing: 0.5 },
  version: { fontSize: 11 },
});
