import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../context/ThemeContext";
import { Gradients, WalletColors } from "../constants/theme";
import NumPad from "../components/NumPad";
import * as api from "../services/api";
import * as Haptics from "expo-haptics";

const DEMO_USER_EMAIL = "demo@swifter.app";

export default function AddFundsScreen({ navigation, route }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<"wallet" | "amount" | "processing" | "success" | "error">("wallet");
  const [amount, setAmount] = useState("");
  const [wallets, setWallets] = useState<api.WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<api.WalletData | null>(null);

  const quickAmounts = [100, 250, 500, 1000];

  useEffect(() => {
    (async () => {
      try {
        const { user } = await api.createUser(DEMO_USER_EMAIL, "Malcolm");
        const { wallets: w } = await api.listWallets(user.id);
        setWallets(w);

        // If a walletId was passed from another screen, preselect it
        if (route.params?.walletId) {
          const found = w.find((x) => x.id === route.params.walletId);
          if (found) {
            setSelectedWallet(found);
            setStep("amount");
          }
        }
      } catch (e) {
        console.log("API not reachable");
      }
    })();
  }, []);

  const handleContinue = async () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedWallet) return;
    setStep("processing");

    try {
      // Create Yoco checkout via our backend
      const { redirectUrl } = await api.createDeposit(selectedWallet.id, parseFloat(amount));

      // Open Yoco payment page in an in-app browser
      const result = await WebBrowser.openBrowserAsync(redirectUrl, {
        dismissButtonStyle: "cancel",
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });

      // After the browser closes, assume success (webhook handles the actual crediting)
      if (result.type === "cancel") {
        setStep("amount");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setStep("success");
      }
    } catch (e: any) {
      console.error("Deposit error:", e);
      Alert.alert("Payment Error", e.message || "Something went wrong with the payment.");
      setStep("amount");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => {
            if (step === "amount") setStep("wallet");
            else navigation.goBack();
          }}
          style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
        >
          <Ionicons name="chevron-back" size={20} color={isDark ? "#d1d5db" : "#6b7280"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {step === "success" ? "" : "Add Funds"}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Ionicons name="close" size={20} color={isDark ? "#d1d5db" : "#6b7280"} />
        </TouchableOpacity>
      </View>

      {/* Step: Select Wallet */}
      {step === "wallet" && (
        <View style={styles.stepContent}>
          <Text style={[styles.stepHint, { color: colors.textMuted }]}>Which wallet should receive the funds?</Text>
          {wallets.map((w) => {
            const gradient = WalletColors[w.type] || Gradients.violet;
            return (
              <TouchableOpacity
                key={w.id}
                onPress={() => { setSelectedWallet(w); setStep("amount"); }}
                activeOpacity={0.7}
                style={[styles.walletOption, {
                  backgroundColor: colors.card,
                  borderColor: selectedWallet?.id === w.id ? colors.violet : colors.cardBorder,
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

      {/* Step: Amount Entry */}
      {step === "amount" && (
        <View style={{ flex: 1 }}>
          {selectedWallet && (
            <Text style={[styles.depositTo, { color: colors.textMuted }]}>
              Depositing to <Text style={{ color: colors.text, fontWeight: "600" }}>{selectedWallet.name}</Text>
            </Text>
          )}
          <View style={styles.amountDisplay}>
            <Text style={[styles.amountCurrency, { color: colors.textMuted }]}>R</Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>{amount || "0"}</Text>
          </View>

          <View style={styles.quickRow}>
            {quickAmounts.map((q) => (
              <TouchableOpacity
                key={q}
                onPress={() => setAmount(String(q))}
                style={[styles.quickBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6", borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.quickBtnText, { color: colors.text }]}>R{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <NumPad value={amount} onChange={setAmount} />

          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!amount || parseFloat(amount) <= 0}
              activeOpacity={0.85}
              style={{ opacity: !amount || parseFloat(amount) <= 0 ? 0.4 : 1 }}
            >
              <LinearGradient colors={Gradients.emerald} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="card-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Pay with Yoco</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Processing */}
      {step === "processing" && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={[styles.processingText, { color: colors.text }]}>Connecting to Yoco...</Text>
          <Text style={[styles.processingSubtext, { color: colors.textMuted }]}>You'll be redirected to complete payment</Text>
        </View>
      )}

      {/* Success */}
      {step === "success" && (
        <View style={styles.center}>
          <View style={styles.successOuter}>
            <View style={styles.successInner}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Funds Added!</Text>
          <Text style={[styles.successAmount, { color: colors.textMuted }]}>R{parseFloat(amount).toFixed(2)} deposited</Text>
          <Text style={[styles.successWallet, { color: colors.textMuted }]}>to {selectedWallet?.name}</Text>
          <Text style={[styles.successNote, { color: colors.textSoft }]}>
            Your balance will update once the payment is confirmed
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={{ width: "80%", marginTop: 32 }}>
            <LinearGradient colors={Gradients.violet} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  stepContent: { paddingHorizontal: 24 },
  stepHint: { fontSize: 14, marginBottom: 16 },

  walletOption: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, gap: 14, marginBottom: 10 },
  walletOptionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  walletOptionName: { fontSize: 15, fontWeight: "500" },
  walletOptionBalance: { fontSize: 13, marginTop: 2 },

  depositTo: { textAlign: "center", fontSize: 13, marginTop: 8, marginBottom: 4 },

  amountDisplay: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 80, gap: 4, marginTop: 12, marginBottom: 8 },
  amountCurrency: { fontSize: 24, fontWeight: "500" },
  amountValue: { fontSize: 48, fontWeight: "700", letterSpacing: -1 },

  quickRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  quickBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  quickBtnText: { fontSize: 14, fontWeight: "500" },

  primaryBtn: { flexDirection: "row", paddingVertical: 16, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  processingText: { fontSize: 16, fontWeight: "500", marginTop: 20 },
  processingSubtext: { fontSize: 13, marginTop: 6 },

  successOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: "rgba(16,185,129,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 24, fontWeight: "700" },
  successAmount: { fontSize: 16, marginTop: 8 },
  successWallet: { fontSize: 14, marginTop: 4 },
  successNote: { fontSize: 12, marginTop: 12, textAlign: "center" },
});
