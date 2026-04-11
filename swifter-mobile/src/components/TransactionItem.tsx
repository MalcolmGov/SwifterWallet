import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface Props {
  description: string | null;
  amount: string;
  type: "DEBIT" | "CREDIT";
  transactionType: "DEPOSIT" | "TRANSFER" | "PAYMENT";
  createdAt: string;
  showBorder?: boolean;
}

function getIcon(txType: string): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string; bgDark: string } {
  switch (txType) {
    case "DEPOSIT":
      return { name: "arrow-down-outline", color: "#10b981", bg: "#ecfdf5", bgDark: "rgba(16,185,129,0.15)" };
    case "TRANSFER":
      return { name: "swap-horizontal-outline", color: "#3b82f6", bg: "#eff6ff", bgDark: "rgba(59,130,246,0.15)" };
    case "PAYMENT":
      return { name: "cart-outline", color: "#7c3aed", bg: "#f5f3ff", bgDark: "rgba(124,58,237,0.15)" };
    default:
      return { name: "card-outline", color: "#6b7280", bg: "#f3f4f6", bgDark: "rgba(107,114,128,0.15)" };
  }
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

export default function TransactionItem({ description, amount, type, transactionType, createdAt, showBorder }: Props) {
  const { colors, isDark } = useTheme();
  const icon = getIcon(transactionType);
  const isCredit = type === "CREDIT";
  const num = parseFloat(amount);
  const formatted = `R${Math.abs(num).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <TouchableOpacity activeOpacity={0.7} style={[styles.container, showBorder && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
      <View style={[styles.iconWrap, { backgroundColor: isDark ? icon.bgDark : icon.bg }]}>
        <Ionicons name={icon.name} size={18} color={icon.color} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.desc, { color: colors.text }]} numberOfLines={1}>
          {description || transactionType}
        </Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>{formatTime(createdAt)}</Text>
      </View>
      <View style={styles.amountWrap}>
        <Text style={[styles.amount, { color: isCredit ? "#10b981" : colors.text }]}>
          {isCredit ? "+" : "-"}{formatted}
        </Text>
        <Text style={[styles.typeLabel, { color: colors.textSoft }]}>{transactionType.toLowerCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  desc: {
    fontSize: 14,
    fontWeight: "500",
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  amountWrap: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  typeLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
