import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  Animated, Easing, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../context/ThemeContext";
import { Gradients, WalletColors } from "../constants/theme";
import NumPad from "../components/NumPad";
import AnimatedEntry from "../components/AnimatedEntry";
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

  // Animations
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const { user } = await api.createUser(DEMO_USER_EMAIL, "Malcolm");
        const { wallets: w } = await api.listWallets(user.id);
        setWallets(w);
        if (route.params?.walletId) {
          const found = w.find((x) => x.id === route.params.walletId);
          if (found) { setSelectedWallet(found); setStep("amount"); }
        }
      } catch (e) {
        console.log("API not reachable");
      }
    })();
  }, []);

  // Processing animation
  useEffect(() => {
    if (step === "processing") {
      const spin = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      );
      spin.start();
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => { spin.stop(); pulse.stop(); };
    }
  }, [step]);

  // Success animation
  useEffect(() => {
    if (step === "success") {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(successScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
          Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [step]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const handleContinue = async () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedWallet) return;
    setStep("processing");

    try {
      const { redirectUrl } = await api.createDeposit(selectedWallet.id, parseFloat(amount));
      const result = await WebBrowser.openBrowserAsync(redirectUrl, {
        dismissButtonStyle: "cancel",
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });

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
          {step === "success" ? "" : step === "processing" ? "" : "Add Funds"}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Ionicons name="close" size={20} color={isDark ? "#d1d5db" : "#6b7280"} />
        </TouchableOpacity>
      </View>

      {/* Step: Select Wallet */}
      {step === "wallet" && (
        <AnimatedEntry delay={0}>
          <View style={styles.stepContent}>
            <Text style={[styles.stepHint, { color: colors.textMuted }]}>Which wallet should receive the funds?</Text>
            {wallets.map((w, i) => {
              const gradient = WalletColors[w.type] || Gradients.violet;
              return (
                <AnimatedEntry key={w.id} delay={80 + i * 60}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setSelectedWallet(w);
                      setStep("amount");
                    }}
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
                    <View style={[styles.chevronWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb" }]}>
                      <Ionicons name="chevron-forward" size={16} color={colors.textSoft} />
                    </View>
                  </TouchableOpacity>
                </AnimatedEntry>
              );
            })}
          </View>
        </AnimatedEntry>
      )}

      {/* Step: Amount Entry */}
      {step === "amount" && (
        <View style={{ flex: 1 }}>
          <AnimatedEntry delay={0}>
            {selectedWallet && (
              <View style={[styles.walletBadge, { backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "#ecfdf5", borderColor: isDark ? "rgba(16,185,129,0.15)" : "#d1fae5" }]}>
                <Ionicons name="wallet-outline" size={14} color="#10b981" />
                <Text style={[styles.walletBadgeText, { color: "#10b981" }]}>
                  {selectedWallet.name}
                </Text>
              </View>
            )}
          </AnimatedEntry>

          <AnimatedEntry delay={80}>
            <View style={styles.amountDisplay}>
              <Text style={[styles.amountCurrency, { color: colors.textMuted }]}>R</Text>
              <Text style={[styles.amountValue, { color: colors.text }]}>{amount || "0"}</Text>
            </View>
          </AnimatedEntry>

          <AnimatedEntry delay={140}>
            <View style={styles.quickRow}>
              {quickAmounts.map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setAmount(String(q));
                  }}
                  style={[styles.quickBtn, {
                    backgroundColor: amount === String(q)
                      ? (isDark ? "rgba(124,58,237,0.12)" : "#f5f3ff")
                      : (isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6"),
                    borderColor: amount === String(q)
                      ? (isDark ? "rgba(124,58,237,0.3)" : "#ddd6fe")
                      : (isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb"),
                  }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickBtnText, {
                    color: amount === String(q) ? colors.violet : colors.text,
                  }]}>R{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedEntry>

          <AnimatedEntry delay={200}>
            <NumPad value={amount} onChange={setAmount} />
          </AnimatedEntry>

          <AnimatedEntry delay={250}>
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
              <View style={styles.secureRow}>
                <Ionicons name="lock-closed" size={11} color={colors.textSoft} />
                <Text style={[styles.secureText, { color: colors.textSoft }]}>Secured by Yoco payment gateway</Text>
              </View>
            </View>
          </AnimatedEntry>
        </View>
      )}

      {/* Processing */}
      {step === "processing" && (
        <View style={styles.center}>
          <Animated.View style={[styles.processingOuter, { transform: [{ scale: pulseAnim }] }]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <LinearGradient colors={Gradients.emerald} style={styles.processingInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="card" size={28} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </Animated.View>
          <Text style={[styles.processingText, { color: colors.text }]}>Connecting to Yoco</Text>
          <Text style={[styles.processingSubtext, { color: colors.textMuted }]}>You'll be redirected to complete payment</Text>
        </View>
      )}

      {/* Success */}
      {step === "success" && (
        <View style={styles.center}>
          {/* Decorative rings */}
          <Animated.View style={[styles.successRing3, { opacity: successOpacity, transform: [{ scale: successScale }] }]} />
          <Animated.View style={[styles.successRing2, { opacity: successOpacity, transform: [{ scale: successScale }] }]} />

          <Animated.View style={[styles.successOuter, { transform: [{ scale: successScale }], opacity: successOpacity }]}>
            <LinearGradient colors={["#10b981", "#059669"]} style={styles.successInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <Ionicons name="checkmark" size={36} color="#fff" />
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          <AnimatedEntry delay={300}>
            <Text style={[styles.successTitle, { color: colors.text }]}>Funds Added!</Text>
          </AnimatedEntry>
          <AnimatedEntry delay={400}>
            <Text style={[styles.successAmount, { color: colors.text }]}>
              R{parseFloat(amount).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </AnimatedEntry>
          <AnimatedEntry delay={500}>
            <View style={styles.successWalletRow}>
              <Ionicons name="wallet-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.successWallet, { color: colors.textMuted }]}>to {selectedWallet?.name}</Text>
            </View>
          </AnimatedEntry>
          <AnimatedEntry delay={600}>
            <View style={[styles.noteBadge, { backgroundColor: isDark ? "rgba(245,158,11,0.08)" : "#fffbeb", borderColor: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7" }]}>
              <Ionicons name="time-outline" size={14} color="#f59e0b" />
              <Text style={[styles.noteText, { color: isDark ? "#fbbf24" : "#92400e" }]}>
                Balance updates once payment is confirmed
              </Text>
            </View>
          </AnimatedEntry>
          <AnimatedEntry delay={700}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={{ width: 280, marginTop: 32 }}>
              <LinearGradient colors={Gradients.violet} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </AnimatedEntry>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 17, fontWeight: "600", letterSpacing: -0.2 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  stepContent: { paddingHorizontal: 24 },
  stepHint: { fontSize: 14, marginBottom: 16, letterSpacing: 0.1 },

  walletOption: {
    flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 20, gap: 14, marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  walletOptionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  walletOptionName: { fontSize: 15, fontWeight: "600", letterSpacing: -0.1 },
  walletOptionBalance: { fontSize: 13, marginTop: 3 },
  chevronWrap: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  walletBadge: {
    flexDirection: "row", alignItems: "center", alignSelf: "center",
    gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, borderWidth: 1, marginTop: 4, marginBottom: 8,
  },
  walletBadgeText: { fontSize: 12, fontWeight: "600" },

  amountDisplay: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 80, gap: 4, marginTop: 8, marginBottom: 8 },
  amountCurrency: { fontSize: 28, fontWeight: "500" },
  amountValue: { fontSize: 52, fontWeight: "800", letterSpacing: -2 },

  quickRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 20 },
  quickBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  quickBtnText: { fontSize: 14, fontWeight: "600" },

  primaryBtn: { flexDirection: "row", paddingVertical: 17, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  secureRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  secureText: { fontSize: 11, letterSpacing: 0.2 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },

  // Processing
  processingOuter: { width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(16,185,129,0.06)", alignItems: "center", justifyContent: "center", marginBottom: 28 },
  processingInner: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  processingText: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
  processingSubtext: { fontSize: 13, marginTop: 6 },

  // Success
  successRing3: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: "rgba(16,185,129,0.06)" },
  successRing2: { position: "absolute", width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: "rgba(16,185,129,0.1)" },
  successOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(16,185,129,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 28 },
  successInner: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  successAmount: { fontSize: 22, fontWeight: "700", marginTop: 8, letterSpacing: -0.3 },
  successWalletRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  successWallet: { fontSize: 15 },
  noteBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginTop: 20,
  },
  noteText: { fontSize: 12, fontWeight: "500" },
});
