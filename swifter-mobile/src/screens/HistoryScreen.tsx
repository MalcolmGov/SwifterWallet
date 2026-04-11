import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import TransactionItem from "../components/TransactionItem";
import * as api from "../services/api";

const DEMO_USER_EMAIL = "demo@swifter.app";
const FILTERS = ["All", "Deposits", "Payments", "Transfers"] as const;

export default function HistoryScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [transactions, setTransactions] = useState<api.TransactionEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const { user } = await api.createUser(DEMO_USER_EMAIL, "Malcolm");
      const { wallets } = await api.listWallets(user.id);

      // Fetch transactions from all wallets and merge
      const allEntries: api.TransactionEntry[] = [];
      for (const w of wallets) {
        const { entries } = await api.getTransactions(w.id, { limit: 50 });
        allEntries.push(...entries);
      }

      // Deduplicate by id and sort by date
      const unique = Array.from(new Map(allEntries.map((e) => [e.id, e])).values());
      unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(unique);
    } catch (e) {
      console.log("API not reachable");
    }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadTransactions);
    return unsub;
  }, [navigation, loadTransactions]);

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

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
              style={[
                styles.filterBtn,
                filter === f
                  ? { backgroundColor: colors.violet }
                  : { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === f ? "#fff" : colors.text }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transaction List */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="time-outline" size={36} color={colors.textSoft} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions found</Text>
              </View>
            ) : (
              filtered.map((tx, i) => (
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: "600" },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  filterRow: { paddingHorizontal: 24, gap: 8, marginBottom: 16 },
  filterBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  filterText: { fontSize: 13, fontWeight: "500" },

  txCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 14 },
});
