import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  Modal, Animated, Dimensions, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import type { TransactionEntry } from "../services/api";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface Props {
  transaction: TransactionEntry | null;
  visible: boolean;
  onClose: () => void;
}

function getIcon(txType: string): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string; bgDark: string } {
  switch (txType) {
    case "DEPOSIT":
      return { name: "arrow-down-outline", color: "#10b981", bg: "#ecfdf5", bgDark: "rgba(16,185,129,0.12)" };
    case "TRANSFER":
      return { name: "swap-horizontal-outline", color: "#3b82f6", bg: "#eff6ff", bgDark: "rgba(59,130,246,0.12)" };
    case "PAYMENT":
      return { name: "cart-outline", color: "#7c3aed", bg: "#f5f3ff", bgDark: "rgba(124,58,237,0.12)" };
    default:
      return { name: "card-outline", color: "#6b7280", bg: "#f3f4f6", bgDark: "rgba(107,114,128,0.12)" };
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

export default function TransactionDetailSheet({ transaction, visible, onClose }: Props) {
  const { colors, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!transaction) return null;

  const icon = getIcon(transaction.transactionType);
  const isCredit = transaction.type === "CREDIT";
  const num = parseFloat(transaction.amount);
  const formatted = `R${Math.abs(num).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdropFill} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View style={[styles.sheet, { backgroundColor: colors.card, transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }]} />
          </View>

          {/* Icon */}
          <View style={styles.headerRow}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? icon.bgDark : icon.bg }]}>
              <Ionicons name={icon.name} size={28} color={icon.color} />
            </View>
          </View>

          {/* Amount */}
          <Text style={[styles.amount, { color: isCredit ? "#10b981" : colors.text }]}>
            {isCredit ? "+" : "-"}{formatted}
          </Text>

          {/* Type badge */}
          <View style={[styles.typeBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6" }]}>
            <View style={[styles.typeDot, { backgroundColor: icon.color }]} />
            <Text style={[styles.typeText, { color: colors.textMuted }]}>
              {transaction.transactionType.charAt(0) + transaction.transactionType.slice(1).toLowerCase()}
            </Text>
          </View>

          {/* Details */}
          <View style={[styles.detailCard, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb", borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }]}>
            {transaction.description && (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Description</Text>
                </View>
                <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>{transaction.description}</Text>
              </View>
            )}
            <View style={[styles.detailRow, transaction.description ? { borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" } : {}]}>
              <View style={styles.detailLabelRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Date</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(transaction.createdAt)}</Text>
            </View>
            <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }]}>
              <View style={styles.detailLabelRow}>
                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Time</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>{formatTime(transaction.createdAt)}</Text>
            </View>
            <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }]}>
              <View style={styles.detailLabelRow}>
                <Ionicons name="swap-vertical-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Entry Type</Text>
              </View>
              <View style={[styles.entryBadge, { backgroundColor: isCredit ? (isDark ? "rgba(16,185,129,0.08)" : "#ecfdf5") : (isDark ? "rgba(239,68,68,0.08)" : "#fef2f2") }]}>
                <Text style={[styles.entryBadgeText, { color: isCredit ? "#10b981" : "#ef4444" }]}>
                  {isCredit ? "Credit" : "Debit"}
                </Text>
              </View>
            </View>
            <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }]}>
              <View style={styles.detailLabelRow}>
                <Ionicons name="finger-print-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Reference</Text>
              </View>
              <Text style={[styles.detailValueMono, { color: colors.textSoft }]}>{transaction.id.slice(0, 12)}...</Text>
            </View>
          </View>

          {/* Close button */}
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={[styles.closeBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }]}>
            <Text style={[styles.closeBtnText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  backdropFill: { flex: 1 },

  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, paddingHorizontal: 24 },
  handleRow: { alignItems: "center", paddingTop: 12, paddingBottom: 8 },
  handle: { width: 40, height: 4, borderRadius: 2 },

  headerRow: { alignItems: "center", marginBottom: 16 },
  iconCircle: { width: 64, height: 64, borderRadius: 22, alignItems: "center", justifyContent: "center" },

  amount: { fontSize: 36, fontWeight: "800", letterSpacing: -1.5, textAlign: "center", marginBottom: 8 },

  typeBadge: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginBottom: 24 },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  typeText: { fontSize: 13, fontWeight: "500" },

  detailCard: { width: "100%", borderRadius: 18, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  detailLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "500", maxWidth: "50%", textAlign: "right" },
  detailValueMono: { fontSize: 11, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },

  entryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  entryBadgeText: { fontSize: 12, fontWeight: "600" },

  closeBtn: { paddingVertical: 16, borderRadius: 18, alignItems: "center" },
  closeBtnText: { fontSize: 15, fontWeight: "600" },
});
