import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Platform, Modal, TouchableWithoutFeedback, Animated, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { WalletColors, Gradients } from "../constants/theme";
import AnimatedEntry from "../components/AnimatedEntry";
import Skeleton from "../components/Skeleton";
import * as api from "../services/api";
import * as Haptics from "expo-haptics";

const DEMO_USER_EMAIL = "demo@swifter.app";

export default function WalletsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [wallets, setWallets] = useState<api.WalletData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const WALLET_TYPES = [
    { type: "MAIN", name: "Main Wallet", icon: "wallet-outline" as const, gradient: Gradients.violet },
    { type: "SAVINGS", name: "Savings", icon: "shield-outline" as const, gradient: Gradients.emerald },
    { type: "BUSINESS", name: "Business", icon: "briefcase-outline" as const, gradient: Gradients.amber },
    { type: "TRAVEL", name: "Travel", icon: "airplane-outline" as const, gradient: Gradients.blue },
  ];

  const loadWallets = useCallback(async () => {
    try {
      const { user } = await api.createUser(DEMO_USER_EMAIL, "Malcolm");
      setUserId(user.id);
      const { wallets: w } = await api.listWallets(user.id);
      setWallets(w);
    } catch (e) {
      console.log("API not reachable");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateWallet = async (type: string, name: string) => {
    if (!userId || creating) return;
    setCreating(true);
    try {
      await api.createWallet(userId, name, type);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setShowCreateModal(false);
      await loadWallets();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create wallet");
    }
    setCreating(false);
  };

  useEffect(() => { loadWallets(); }, [loadWallets]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => { if (!loading) loadWallets(); });
    return unsub;
  }, [navigation, loadWallets, loading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWallets();
    setRefreshing(false);
  };

  const formatCurrency = (val: string) =>
    `R${parseFloat(val).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalBalance = wallets.reduce((s, w) => s + parseFloat(w.balance), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.violet} />}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.title, { color: colors.text }]}>My Wallets</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
              style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
              activeOpacity={0.7}
            >
              <Ionicons name={balanceVisible ? "eye-outline" : "eye-off-outline"} size={18} color={isDark ? "#d1d5db" : "#6b7280"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={isDark ? "#d1d5db" : "#6b7280"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total */}
        <AnimatedEntry delay={0}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total across all wallets</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>
              {balanceVisible ? `R${totalBalance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "R•••••••"}
            </Text>
          </View>
        </AnimatedEntry>

        {/* Loading state */}
        {loading ? (
          <View style={styles.walletList}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width="100%" height={200} borderRadius={24} style={{ marginBottom: 16 }} />
            ))}
          </View>
        ) : (
          /* Wallet Cards */
          <View style={styles.walletList}>
            {wallets.map((w, i) => {
              const gradient = WalletColors[w.type] || Gradients.violet;
              return (
                <AnimatedEntry key={w.id} delay={100 + i * 100}>
                  <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.walletCard}
                  >
                    {/* Decorative elements */}
                    <View style={styles.orbTopRight} />
                    <View style={styles.orbBottomLeft} />
                    <View style={styles.cardPattern}>
                      {[...Array(3)].map((_, j) => (
                        <View key={j} style={[styles.patternLine, { top: 30 + j * 20, opacity: 0.04 + j * 0.02 }]} />
                      ))}
                    </View>

                    <View style={styles.walletHeader}>
                      <View style={styles.walletIconWrap}>
                        <Ionicons name="wallet-outline" size={16} color="#fff" />
                      </View>
                      <View style={styles.walletTypeBadge}>
                        <Text style={styles.walletType}>{w.type}</Text>
                      </View>
                    </View>

                    <Text style={styles.walletName}>{w.name}</Text>
                    <Text style={styles.walletBalance}>
                      {balanceVisible ? formatCurrency(w.balance) : "R•••••••"}
                    </Text>

                    <View style={styles.walletActions}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("Send", { walletId: w.id })}
                        style={styles.walletBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="send-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.walletBtnText}>Send</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("AddFunds", { walletId: w.id })}
                        style={styles.walletBtnPrimary}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add-circle-outline" size={14} color="#111827" style={{ marginRight: 6 }} />
                        <Text style={styles.walletBtnPrimaryText}>Add Funds</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </AnimatedEntry>
              );
            })}
          </View>
        )}

        {!loading && wallets.length === 0 && (
          <AnimatedEntry delay={100}>
            <View style={styles.empty}>
              <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? "rgba(124,58,237,0.1)" : "#f5f3ff" }]}>
                <Ionicons name="wallet-outline" size={40} color={colors.violet} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No wallets yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>Create your first wallet to get started</Text>
            </View>
          </AnimatedEntry>
        )}
      </ScrollView>

      {/* Create Wallet Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowCreateModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
                <View style={[styles.modalHandle, { backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }]} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create Wallet</Text>
                <Text style={[styles.modalDesc, { color: colors.textMuted }]}>Choose a wallet type</Text>

                {WALLET_TYPES.map((wt) => (
                  <TouchableOpacity
                    key={wt.type}
                    onPress={() => handleCreateWallet(wt.type, wt.name)}
                    disabled={creating}
                    activeOpacity={0.7}
                    style={[styles.walletTypeRow, {
                      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb",
                      borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
                      opacity: creating ? 0.5 : 1,
                    }]}
                  >
                    <LinearGradient colors={wt.gradient} style={styles.walletTypeIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name={wt.icon} size={20} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.walletTypeName, { color: colors.text }]}>{wt.name}</Text>
                      <Text style={[styles.walletTypeDesc, { color: colors.textMuted }]}>{wt.type.charAt(0) + wt.type.slice(1).toLowerCase()} account</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={22} color={colors.violet} />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => setShowCreateModal(false)}
                  activeOpacity={0.7}
                  style={[styles.modalCancel, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }]}
                >
                  <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  totalRow: { paddingHorizontal: 24, marginBottom: 20 },
  totalLabel: { fontSize: 13, letterSpacing: 0.2 },
  totalAmount: { fontSize: 28, fontWeight: "800", letterSpacing: -1, marginTop: 2 },

  walletList: { paddingHorizontal: 24, gap: 16 },
  walletCard: {
    borderRadius: 28, padding: 28, overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
      android: { elevation: 8 },
    }),
  },
  orbTopRight: {
    position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  orbBottomLeft: {
    position: "absolute", bottom: -15, left: -15, width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cardPattern: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  patternLine: {
    position: "absolute", left: 0, right: 0, height: 1,
    backgroundColor: "rgba(255,255,255,1)",
  },
  walletHeader: { flexDirection: "row", alignItems: "center", gap: 10, zIndex: 1 },
  walletIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  walletTypeBadge: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  walletType: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  walletName: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 18, zIndex: 1, letterSpacing: -0.3 },
  walletBalance: { color: "#fff", fontSize: 34, fontWeight: "800", marginTop: 4, letterSpacing: -1, zIndex: 1 },
  walletActions: { flexDirection: "row", gap: 12, marginTop: 24, zIndex: 1 },
  walletBtn: {
    flex: 1, flexDirection: "row", paddingVertical: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  walletBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  walletBtnPrimary: {
    flex: 1, flexDirection: "row", paddingVertical: 14, borderRadius: 16, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  walletBtnPrimaryText: { color: "#111827", fontSize: 14, fontWeight: "600" },

  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptyDesc: { fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3, marginBottom: 4 },
  modalDesc: { fontSize: 14, marginBottom: 20 },
  walletTypeRow: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 16,
    borderRadius: 18, borderWidth: 1, marginBottom: 10,
  },
  walletTypeIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  walletTypeName: { fontSize: 15, fontWeight: "600" },
  walletTypeDesc: { fontSize: 12, marginTop: 2 },
  modalCancel: { paddingVertical: 16, borderRadius: 18, alignItems: "center", marginTop: 8 },
  modalCancelText: { fontSize: 15, fontWeight: "600" },
});
