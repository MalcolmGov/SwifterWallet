import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { WalletColors, Gradients } from "../constants/theme";
import NumPad from "../components/NumPad";
import * as api from "../services/api";
import * as Haptics from "expo-haptics";

const DEMO_USER_EMAIL = "demo@swifter.app";

const CONTACTS = [
  { id: "c1", name: "Sarah M.", avatar: "SM", color: "#ec4899" },
  { id: "c2", name: "David K.", avatar: "DK", color: "#3b82f6" },
  { id: "c3", name: "Thabo N.", avatar: "TN", color: "#10b981" },
  { id: "c4", name: "Lisa P.", avatar: "LP", color: "#f59e0b" },
];

export default function SendScreen({ navigation, route }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [wallets, setWallets] = useState<api.WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<api.WalletData | null>(null);
  const [recipient, setRecipient] = useState<typeof CONTACTS[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await api.createUser(DEMO_USER_EMAIL, "Malcolm");
        const { wallets: w } = await api.listWallets(user.id);
        setWallets(w);
        if (route.params?.walletId) {
          const found = w.find((x) => x.id === route.params.walletId);
          if (found) { setSelectedWallet(found); setStep(1); }
        }
      } catch (e) {
        console.log("API not reachable");
      }
    })();
  }, []);

  const handleSend = async () => {
    if (!selectedWallet || !amount) return;
    setProcessing(true);
    try {
      // For demo, we do a payment. In production you'd transfer to recipient's wallet
      await api.makePayment(selectedWallet.id, parseFloat(amount), `Send to ${recipient?.name}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSent(true);
    } catch (e: any) {
      alert(e.message || "Transfer failed");
    }
    setProcessing(false);
  };

  const StepBar = () => (
    <View style={styles.stepBar}>
      {[0, 1, 2, 3].map((s) => (
        <View key={s} style={[styles.stepDot, { backgroundColor: s <= step ? colors.violet : isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }]} />
      ))}
    </View>
  );

  // ─── Success ────────────────────────────────────────────────
  if (sent) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <View style={styles.successCircleOuter}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={36} color="#fff" />
          </View>
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>Sent!</Text>
        <Text style={[styles.successAmount, { color: colors.textMuted }]}>R{parseFloat(amount).toFixed(2)}</Text>
        <Text style={[styles.successTo, { color: colors.textMuted }]}>to {recipient?.name}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.successBtn} activeOpacity={0.85}>
          <LinearGradient colors={Gradients.violet} style={styles.successBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.successBtnText}>Back to Dashboard</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Processing ─────────────────────────────────────────────
  if (processing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.violet} />
        <Text style={[styles.processingText, { color: colors.text }]}>Processing...</Text>
        <Text style={[styles.processingSubtext, { color: colors.textMuted }]}>This will only take a moment</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : navigation.goBack()} style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Ionicons name="chevron-back" size={20} color={isDark ? "#d1d5db" : "#6b7280"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {step === 0 ? "Select Wallet" : step === 1 ? "Recipient" : step === 2 ? "Amount" : "Confirm"}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Ionicons name="close" size={20} color={isDark ? "#d1d5db" : "#6b7280"} />
        </TouchableOpacity>
      </View>
      <StepBar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Step 0: Select Wallet */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepHint, { color: colors.textMuted }]}>Choose which wallet to send from</Text>
            {wallets.map((w) => {
              const gradient = WalletColors[w.type] || Gradients.violet;
              return (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => { setSelectedWallet(w); setStep(1); }}
                  activeOpacity={0.7}
                  style={[styles.walletOption, {
                    backgroundColor: colors.card, borderColor: selectedWallet?.id === w.id ? colors.violet : colors.cardBorder,
                    borderWidth: selectedWallet?.id === w.id ? 2 : 1,
                  }]}
                >
                  <LinearGradient colors={gradient} style={styles.walletOptionIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Ionicons name="wallet-outline" size={20} color="#fff" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.walletOptionName, { color: colors.text }]}>{w.name}</Text>
                    <Text style={[styles.walletOptionBalance, { color: colors.textMuted }]}>
                      R{parseFloat(w.balance).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step 1: Select Recipient */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6", borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }]}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput placeholder="Search name or email" placeholderTextColor={colors.textMuted} style={[styles.searchInput, { color: colors.text }]} />
            </View>
            <Text style={[styles.contactsLabel, { color: colors.textMuted }]}>RECENT</Text>
            {CONTACTS.map((c) => (
              <TouchableOpacity key={c.id} onPress={() => { setRecipient(c); setStep(2); }} activeOpacity={0.7} style={styles.contactRow}>
                <View style={[styles.avatar, { backgroundColor: c.color }]}>
                  <Text style={styles.avatarText}>{c.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactName, { color: colors.text }]}>{c.name}</Text>
                  <Text style={[styles.contactSub, { color: colors.textMuted }]}>Recent</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Enter Amount */}
        {step === 2 && (
          <View>
            <View style={styles.recipientBadge}>
              <View style={[styles.avatar, { backgroundColor: recipient?.color }]}>
                <Text style={styles.avatarText}>{recipient?.avatar}</Text>
              </View>
              <Text style={[styles.sendingTo, { color: colors.textMuted }]}>
                Sending to <Text style={{ color: colors.text, fontWeight: "600" }}>{recipient?.name}</Text>
              </Text>
            </View>
            <View style={styles.amountDisplay}>
              <Text style={[styles.amountCurrency, { color: colors.textMuted }]}>R</Text>
              <Text style={[styles.amountValue, { color: colors.text }]}>{amount || "0"}</Text>
            </View>
            <Text style={[styles.available, { color: colors.textMuted }]}>
              Available: R{selectedWallet ? parseFloat(selectedWallet.balance).toLocaleString("en-ZA", { minimumFractionDigits: 2 }) : "0.00"}
            </Text>
            <NumPad value={amount} onChange={setAmount} />
            <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => amount && parseFloat(amount) > 0 && setStep(3)}
                disabled={!amount || parseFloat(amount) <= 0}
                activeOpacity={0.85}
                style={{ opacity: !amount || parseFloat(amount) <= 0 ? 0.4 : 1 }}
              >
                <LinearGradient colors={Gradients.violet} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.confirmRecipient}>
              <View style={[styles.avatarLg, { backgroundColor: recipient?.color }]}>
                <Text style={styles.avatarLgText}>{recipient?.avatar}</Text>
              </View>
              <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>Sending to</Text>
              <Text style={[styles.confirmName, { color: colors.text }]}>{recipient?.name}</Text>
            </View>
            <Text style={[styles.confirmAmount, { color: colors.text }]}>R{parseFloat(amount).toFixed(2)}</Text>

            <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.detailRow]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>From</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{selectedWallet?.name}</Text>
              </View>
              <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>To</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{recipient?.name}</Text>
              </View>
              <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Fee</Text>
                <Text style={[styles.detailValue, { color: "#10b981" }]}>Free</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleSend} activeOpacity={0.85}>
              <LinearGradient colors={Gradients.violet} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.primaryBtnText}>Confirm & Send</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  stepBar: { flexDirection: "row", gap: 6, paddingHorizontal: 24, marginBottom: 20 },
  stepDot: { flex: 1, height: 3, borderRadius: 2 },
  stepContent: { paddingHorizontal: 24 },
  stepHint: { fontSize: 14, marginBottom: 16 },

  walletOption: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, gap: 14, marginBottom: 10 },
  walletOptionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  walletOptionName: { fontSize: 15, fontWeight: "500" },
  walletOptionBalance: { fontSize: 13, marginTop: 2 },

  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 14 },
  contactsLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 12 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  contactName: { fontSize: 15, fontWeight: "500" },
  contactSub: { fontSize: 12, marginTop: 2 },

  recipientBadge: { alignItems: "center", gap: 8, marginBottom: 12 },
  sendingTo: { fontSize: 13 },
  amountDisplay: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 80, gap: 4, paddingHorizontal: 24 },
  amountCurrency: { fontSize: 24, fontWeight: "500" },
  amountValue: { fontSize: 48, fontWeight: "700", letterSpacing: -1 },
  available: { textAlign: "center", fontSize: 13, marginBottom: 16 },

  confirmRecipient: { alignItems: "center", marginTop: 8, marginBottom: 20 },
  avatarLg: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  avatarLgText: { color: "#fff", fontWeight: "700", fontSize: 20 },
  confirmLabel: { fontSize: 13 },
  confirmName: { fontSize: 18, fontWeight: "600", marginTop: 2 },
  confirmAmount: { fontSize: 36, fontWeight: "700", textAlign: "center", marginBottom: 24, letterSpacing: -0.5 },

  detailCard: { borderRadius: 18, borderWidth: 1, padding: 4, marginBottom: 24 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: "500" },

  primaryBtn: { paddingVertical: 16, borderRadius: 18, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  successCircleOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: "rgba(16,185,129,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 24, fontWeight: "700" },
  successAmount: { fontSize: 18, marginTop: 8 },
  successTo: { fontSize: 14, marginTop: 4 },
  successBtn: { marginTop: 40, width: "80%" },
  successBtnGradient: { paddingVertical: 16, borderRadius: 18, alignItems: "center" },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  processingText: { fontSize: 16, fontWeight: "500", marginTop: 20 },
  processingSubtext: { fontSize: 13, marginTop: 6 },
});
