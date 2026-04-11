import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import TransactionItem from "../components/TransactionItem";
import TransactionDetailSheet from "../components/TransactionDetailSheet";
import AnimatedEntry from "../components/AnimatedEntry";
import Skeleton from "../components/Skeleton";
import * as api from "../services/api";

const DEMO_USER_EMAIL = "demo@swifter.app";

const FILTERS = [
  { key: "All", icon: "layers-outline" as const },
  { key: "Deposits", icon: "arrow-down-outline" as const },
  { key: "Payments", icon: "cart-outline" as const },
  { key: "Transfers", icon: "swap-horizontal-outline" as const },
] as const;

export default function HistoryScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState<api.TransactionEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<api.TransactionEntry | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const { user } = await api.createUser(DEMO_USER_EMAIL, "Malcolm");
      const { wallets } = await api.listWallets(user.id);

      const allEntries: api.TransactionEntry[] = [];
      for (const w of wallets) {
        const { entries } = await api.getTransactions(w.id, { limit: 50 });
        allEntries.push(...entries);
      }

      const unique = Array.from(new Map(allEntries.map((e) => [e.id, e])).values());
      unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(unique);
    } catch (e) {
      console.log("API not reachable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => { if (!loading) loadTransactions(); });
    return unsub;
  }, [navigation, loadTransactions, loading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const filtered = transactions.filter((tx) => {
    if (filter === "All") return true;
    if (filter === "Deposits") return tx.transactionType === "DEPOSIT";
    if (filter === "Payments") return tx.transactionType === "PAYMENT";
    if (filter === "Transfers") return tx.transactionType === "TRANSFER";
    return true;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, api.TransactionEntry[]>>((acc, tx) => {
    const d = new Date(tx.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (d.toDateString() === today.toDateString()) key = "Today";
    else if (d.toDateString() === yesterday.toDateString()) key = "Yesterday";
    else key = d.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.violet} />}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Ionicons name="search" size={18} color={isDark ? "#d1d5db" : "#6b7280"} />
          </TouchableOpacity>
        </View>

        {/* Summary bar */}
        <AnimatedEntry delay={0}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "#ecfdf5", borderColor: isDark ? "rgba(16,185,129,0.15)" : "#d1fae5" }]}>
              <Ionicons name="arrow-down" size={14} color="#10b981" />
              <Text style={[styles.summaryLabel, { color: "#10b981" }]}>
                R{filtered.filter(t => t.type === "CREDIT").reduce((s, t) => s + parseFloat(t.amount), 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "#fef2f2", borderColor: isDark ? "rgba(239,68,68,0.15)" : "#fecaca" }]}>
              <Ionicons name="arrow-up" size={14} color="#ef4444" />
              <Text style={[styles.summaryLabel, { color: "#ef4444" }]}>
                R{filtered.filter(t => t.type === "DEBIT").reduce((s, t) => s + parseFloat(t.amount), 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </AnimatedEntry>

        {/* Filters */}
        <AnimatedEntry delay={100}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
                style={[
                  styles.filterBtn,
                  filter === f.key
                    ? { backgroundColor: colors.violet }
                    : { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" },
                ]}
              >
                <Ionicons name={f.icon} size={14} color={filter === f.key ? "#fff" : colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.filterText, { color: filter === f.key ? "#fff" : colors.text }]}>{f.key}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AnimatedEntry>

        {/* Loading */}
        {loading && (
          <View style={{ paddingHorizontal: 24, gap: 12, marginTop: 8 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Skeleton width={44} height={44} borderRadius={15} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width={120} height={14} />
                  <Skeleton width={80} height={12} />
                </View>
                <Skeleton width={70} height={14} />
              </View>
            ))}
          </View>
        )}

        {/* Grouped Transaction List */}
        {!loading && Object.entries(grouped).map(([date, txs], gi) => (
          <AnimatedEntry key={date} delay={150 + gi * 80}>
            <View style={{ paddingHorizontal: 24, marginTop: gi === 0 ? 8 : 20 }}>
              <Text style={[styles.dateHeader, { color: colors.textMuted }]}>{date}</Text>
              <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {txs.map((tx, i) => (
                  <TransactionItem
                    key={tx.id}
                    description={tx.description}
                    amount={tx.amount}
                    type={tx.type}
                    transactionType={tx.transactionType}
                    createdAt={tx.createdAt}
                    showBorder={i > 0}
                    onPress={() => {
                      setSelectedTx(tx);
                      setSheetVisible(true);
                    }}
                  />
                ))}
              </View>
            </View>
          </AnimatedEntry>
        ))}

        {!loading && filtered.length === 0 && (
          <AnimatedEntry delay={100}>
            <View style={styles.empty}>
              <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? "rgba(124,58,237,0.1)" : "#f5f3ff" }]}>
                <Ionicons name="receipt-outline" size={36} color={colors.violet} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No transactions found</Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
                {filter !== "All" ? `No ${filter.toLowerCase()} yet` : "Make a transaction to see it here"}
              </Text>
            </View>
          </AnimatedEntry>
        )}
      </ScrollView>

      <TransactionDetailSheet
        transaction={selectedTx}
        visible={sheetVisible}
        onClose={() => { setSheetVisible(false); setSelectedTx(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  iconBtn: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  summaryRow: { flexDirection: "row", gap: 10, paddingHorizontal: 24, marginBottom: 16 },
  summaryCard: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  summaryLabel: { fontSize: 14, fontWeight: "700" },

  filterRow: { paddingHorizontal: 24, gap: 8, marginBottom: 8 },
  filterBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  filterText: { fontSize: 13, fontWeight: "600" },

  dateHeader: { fontSize: 13, fontWeight: "600", letterSpacing: 0.3, marginBottom: 8 },
  txCard: { borderRadius: 22, borderWidth: 1, overflow: "hidden" },

  empty: { alignItems: "center", paddingTop: 60, gap: 6 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "600" },
  emptyDesc: { fontSize: 13 },
});
