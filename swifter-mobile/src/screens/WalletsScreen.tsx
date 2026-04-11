import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { WalletColors, Gradients } from "../constants/theme";
import * as api from "../services/api";

const DEMO_USER_EMAIL = "demo@swifter.app";

export default function WalletsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [wallets, setWallets] = useState<api.WalletData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const loadWallets = useCallback(async () => {
    try {
      const { user } = await api.createUser(DEMO_USER_EMAIL, "Malcolm");
      const { wallets: w } = await api.listWallets(user.id);
      setWallets(w);
    } catch (e) {
      console.log("API not reachable");
    }
  }, []);

  useEffect(() => { loadWallets(); }, [loadWallets]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadWallets);
    return unsub;
  }, [navigation, loadWallets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWallets();
    setRefreshing(false);
  };

  const formatCurrency = (val: string) =>
    `R${parseFloat(val).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
          <TouchableOpacity
            onPress={() => setBalanceVisible(!balanceVisible)}
            style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
          >
            <Ionicons name={balanceVisible ? "eye-outline" : "eye-off-outline"} size={18} color={isDark ? "#d1d5db" : "#6b7280"} />
          </TouchableOpacity>
        </View>

        {/* Wallet Cards */}
        <View style={styles.walletList}>
          {wallets.map((w, i) => {
            const gradient = WalletColors[w.type] || Gradients.violet;
            return (
              <LinearGradient
                key={w.id}
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.walletCard}
              >
                <View style={styles.walletHeader}>
                  <View style={styles.walletIconWrap}>
                    <Ionicons name="wallet-outline" size={16} color="#fff" />
                  </View>
                  <Text style={styles.walletType}>{w.type}</Text>
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
                    <Text style={styles.walletBtnText}>Send</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("AddFunds", { walletId: w.id })}
                    style={styles.walletBtnPrimary}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.walletBtnPrimaryText}>Add Funds</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            );
          })}
        </View>

        {wallets.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color={colors.textSoft} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No wallets yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "600" },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  walletList: { paddingHorizontal: 24, gap: 16 },
  walletCard: { borderRadius: 24, padding: 24, overflow: "hidden" },
  walletHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  walletIconWrap: { width: 32, height: 32, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  walletType: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "500" },
  walletName: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 16 },
  walletBalance: { color: "#fff", fontSize: 32, fontWeight: "700", marginTop: 4, letterSpacing: -0.5 },
  walletActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  walletBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  walletBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  walletBtnPrimary: {
    flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: "#fff",
    alignItems: "center",
  },
  walletBtnPrimaryText: { color: "#111827", fontSize: 14, fontWeight: "600" },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
});
