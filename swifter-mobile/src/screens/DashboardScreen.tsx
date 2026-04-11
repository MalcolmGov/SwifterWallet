import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList, Animated, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { Gradients, WalletColors } from "../constants/theme";
import TransactionItem from "../components/TransactionItem";
import * as api from "../services/api";

const DEMO_USER_EMAIL = "demo@swifter.app";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DashboardScreen({ navigation }: any) {
  const { colors, isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallets, setWallets] = useState<api.WalletData[]>([]);
  const [transactions, setTransactions] = useState<api.TransactionEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  const loadData = useCallback(async () => {
    try {
      // Get or create user
      const { user } = await api.createUser(DEMO_USER_EMAIL, "Malcolm");
      setUserId(user.id);

      // Load wallets
      const { wallets: w } = await api.listWallets(user.id);
      setWallets(w);

      const total = w.reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0);
      setTotalBalance(total);

      // Load transactions from first wallet
      if (w.length > 0) {
        const { entries } = await api.getTransactions(w[0].id, { limit: 10 });
        setTransactions(entries);
      }
    } catch (e) {
      console.log("API not reachable, using offline mode");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) =>
    `R${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.violet} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>Good morning</Text>
            <Text style={[styles.name, { color: colors.text }]}>Malcolm</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={toggle}
              style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? "#fbbf24" : "#6b7280"} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <Ionicons name="notifications-outline" size={18} color={isDark ? "#d1d5db" : "#6b7280"} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={["#7c3aed", "#6d28d9", "#4338ca"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              <Ionicons name={balanceVisible ? "eye-outline" : "eye-off-outline"} size={18} color="rgba(196,181,253,0.8)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? formatCurrency(totalBalance) : "R•••••••"}
          </Text>
          <View style={styles.trendRow}>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={12} color="#34d399" />
              <Text style={styles.trendText}>+12.5%</Text>
            </View>
            <Text style={styles.trendPeriod}>this month</Text>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {[
            { icon: "send" as const, label: "Send", gradient: Gradients.violet, onPress: () => navigation.navigate("Send") },
            { icon: "add" as const, label: "Add Funds", gradient: Gradients.emerald, onPress: () => navigation.navigate("AddFunds") },
            { icon: "swap-horizontal" as const, label: "Transfer", gradient: Gradients.blue, onPress: () => navigation.navigate("Send") },
          ].map((action, i) => (
            <TouchableOpacity key={i} onPress={action.onPress} style={styles.actionItem} activeOpacity={0.7}>
              <LinearGradient colors={action.gradient} style={styles.actionIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={action.icon} size={22} color="#fff" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Wallet Cards */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Wallets</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Wallets")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={wallets}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const gradient = WalletColors[item.type] || Gradients.violet;
            return (
              <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate("Wallets")}>
                <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.walletCard}>
                  <Text style={styles.walletType}>{item.type}</Text>
                  <Text style={styles.walletName}>{item.name}</Text>
                  <Text style={styles.walletBalance}>
                    {balanceVisible ? `R${parseFloat(item.balance).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "R•••••"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }}
        />

        {/* Recent Transactions */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {transactions.length === 0 ? (
            <View style={styles.emptyTx}>
              <Ionicons name="time-outline" size={32} color={colors.textSoft} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions yet</Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((tx, i) => (
              <TransactionItem
                key={tx.id}
                description={tx.description}
                amount={tx.amount}
                type={tx.type}
                transactionType={tx.transactionType}
                createdAt={tx.createdAt}
                showBorder={i > 0}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Send Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Send")}
        activeOpacity={0.85}
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
      >
        <LinearGradient colors={Gradients.violet} style={styles.fabGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="send" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 16 },
  greeting: { fontSize: 13 },
  name: { fontSize: 20, fontWeight: "600", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  notifDot: { position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: "#7c3aed" },

  balanceCard: { marginHorizontal: 24, borderRadius: 24, padding: 24, overflow: "hidden" },
  balanceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balanceLabel: { color: "rgba(196,181,253,0.8)", fontSize: 13, fontWeight: "500" },
  balanceAmount: { color: "#fff", fontSize: 36, fontWeight: "700", marginTop: 8, letterSpacing: -1 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  trendBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(52,211,153,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  trendText: { color: "#34d399", fontSize: 12, fontWeight: "600" },
  trendPeriod: { color: "rgba(196,181,253,0.6)", fontSize: 12 },

  actionsRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 24, marginTop: 24 },
  actionItem: { alignItems: "center", gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, fontWeight: "500" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  seeAll: { fontSize: 13, fontWeight: "500", color: "#7c3aed" },

  walletCard: { width: 200, borderRadius: 20, padding: 18 },
  walletType: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "500" },
  walletName: { color: "#fff", fontSize: 14, fontWeight: "600", marginTop: 6 },
  walletBalance: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 12 },

  txCard: { marginHorizontal: 24, borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  emptyTx: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14 },

  fab: { position: "absolute", right: 24, zIndex: 50 },
  fabGradient: {
    width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center",
    shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
});
