import React, { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  FlatList, Animated, Dimensions, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { Gradients, WalletColors } from "../constants/theme";
import TransactionItem from "../components/TransactionItem";
import AnimatedEntry from "../components/AnimatedEntry";
import { DashboardSkeleton } from "../components/Skeleton";
import * as api from "../services/api";

const DEMO_USER_EMAIL = "demo@swifter.app";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WALLET_CARD_WIDTH = SCREEN_WIDTH * 0.52;

export default function DashboardScreen({ navigation }: any) {
  const { colors, isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<api.WalletData[]>([]);
  const [transactions, setTransactions] = useState<api.TransactionEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  // Animated balance counter
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    try {
      const { user } = await api.createUser(DEMO_USER_EMAIL, "Malcolm");
      setUserId(user.id);

      const { wallets: w } = await api.listWallets(user.id);
      setWallets(w);

      const total = w.reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0);
      setTotalBalance(total);

      // Animate balance counter (avoid native driver on web — Animated.Text + native driver is unreliable)
      balanceAnim.setValue(0);
      Animated.timing(balanceAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== "web",
      }).start();

      // Load transactions from all wallets
      const allEntries: api.TransactionEntry[] = [];
      for (const wallet of w.slice(0, 3)) {
        try {
          const { entries } = await api.getTransactions(wallet.id, { limit: 5 });
          allEntries.push(...entries);
        } catch {}
      }
      const unique = Array.from(new Map(allEntries.map((e) => [e.id, e])).values());
      unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(unique.slice(0, 8));
    } catch (e) {
      console.log("API not reachable, using offline mode");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) =>
    `R${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Header opacity based on scroll
  const headerBg = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.violet} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== "web" }
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <View>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>Good morning</Text>
              <Text style={[styles.name, { color: colors.text }]}>Malcolm</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={toggle}
                style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                activeOpacity={0.7}
              >
                <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? "#fbbf24" : "#6b7280"} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={18} color={isDark ? "#d1d5db" : "#6b7280"} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedEntry>

        {/* Balance Card */}
        <AnimatedEntry delay={100}>
          <LinearGradient
            colors={["#7c3aed", "#6d28d9", "#4338ca"] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            {/* Decorative orbs */}
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={balanceVisible ? "eye-outline" : "eye-off-outline"} size={20} color="rgba(196,181,253,0.8)" />
              </TouchableOpacity>
            </View>

            <Animated.Text style={[styles.balanceAmount, { opacity: balanceAnim }]}>
              {balanceVisible ? formatCurrency(totalBalance) : "R•••••••"}
            </Animated.Text>

            <View style={styles.trendRow}>
              <View style={styles.trendBadge}>
                <Ionicons name="trending-up" size={12} color="#34d399" />
                <Text style={styles.trendText}>+12.5%</Text>
              </View>
              <Text style={styles.trendPeriod}>this month</Text>
            </View>
          </LinearGradient>
        </AnimatedEntry>

        {/* Quick Actions */}
        <AnimatedEntry delay={200}>
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
        </AnimatedEntry>

        {/* Wallet Cards */}
        <AnimatedEntry delay={300}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Wallets</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Wallets")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={wallets}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            keyExtractor={(item) => item.id}
            snapToInterval={WALLET_CARD_WIDTH + 12}
            decelerationRate="fast"
            renderItem={({ item }) => {
              const gradient = WalletColors[item.type] || Gradients.violet;
              return (
                <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate("Wallets")}>
                  <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.walletCard, { width: WALLET_CARD_WIDTH }]}>
                    <View style={styles.walletCardOrb} />
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
        </AnimatedEntry>

        {/* Recent Transactions */}
        <AnimatedEntry delay={400}>
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate("History")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {transactions.length === 0 ? (
              <View style={styles.emptyTx}>
                <Ionicons name="receipt-outline" size={36} color={colors.textSoft} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions yet</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSoft }]}>Add funds to get started</Text>
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
        </AnimatedEntry>
      </Animated.ScrollView>

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
  greeting: { fontSize: 13, letterSpacing: 0.2 },
  name: { fontSize: 22, fontWeight: "700", marginTop: 2, letterSpacing: -0.3 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  notifDot: { position: "absolute", top: 9, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: "#7c3aed" },

  balanceCard: { marginHorizontal: 24, borderRadius: 28, padding: 28, overflow: "hidden" },
  orb1: {
    position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  orb2: {
    position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(99,102,241,0.2)",
  },
  balanceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 1 },
  balanceLabel: { color: "rgba(196,181,253,0.9)", fontSize: 14, fontWeight: "500", letterSpacing: 0.3 },
  balanceAmount: { color: "#fff", fontSize: 38, fontWeight: "800", marginTop: 10, letterSpacing: -1.5, zIndex: 1 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, zIndex: 1 },
  trendBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(52,211,153,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  trendText: { color: "#34d399", fontSize: 12, fontWeight: "700" },
  trendPeriod: { color: "rgba(196,181,253,0.5)", fontSize: 12 },

  actionsRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 32, marginTop: 28 },
  actionItem: { alignItems: "center", gap: 10 },
  actionIcon: {
    width: 56, height: 56, borderRadius: 20, alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  actionLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.2 },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginTop: 32, marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: "700", letterSpacing: -0.2 },
  seeAll: { fontSize: 13, fontWeight: "600", color: "#7c3aed" },

  walletCard: { borderRadius: 22, padding: 20, overflow: "hidden" },
  walletCardOrb: {
    position: "absolute", top: -15, right: -15, width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  walletType: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  walletName: { color: "#fff", fontSize: 15, fontWeight: "600", marginTop: 8 },
  walletBalance: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 14, letterSpacing: -0.5 },

  txCard: { marginHorizontal: 24, borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  emptyTx: { alignItems: "center", paddingVertical: 40, gap: 6 },
  emptyText: { fontSize: 15, fontWeight: "500", marginTop: 4 },
  emptySubtext: { fontSize: 13 },

  fab: { position: "absolute", right: 24, zIndex: 50 },
  fabGradient: {
    width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
});
