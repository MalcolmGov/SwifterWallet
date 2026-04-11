import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  Animated, Easing, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { WalletColors, Gradients } from "../constants/theme";
import NumPad from "../components/NumPad";
import AnimatedEntry from "../components/AnimatedEntry";
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

  // Animations
  const spinAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  // Spinner animation for processing
  useEffect(() => {
    if (processing) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      );
      spin.start();
      // Pulse effect
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => { spin.stop(); pulse.stop(); };
    }
  }, [processing]);

  // Success animation
  useEffect(() => {
    if (sent) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(successScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
          Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [sent]);

  const handleSend = async () => {
    if (!selectedWallet || !amount) return;
    setProcessing(true);
    try {
      await api.makePayment(selectedWallet.id, parseFloat(amount), `Send to ${recipient?.name}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setProcessing(false);
      setSent(true);
    } catch (e: any) {
      setProcessing(false);
      alert(e.message || "Transfer failed");
    }
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const StepBar = () => (
    <View style={styles.stepBar}>
      {[0, 1, 2, 3].map((s) => (
        <View key={s} style={[styles.stepDot, { backgroundColor: s <= step ? colors.violet : isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }]}>
          {s < step && (
            <View style={[styles.stepDotInner, { backgroundColor: colors.violet }]} />
          )}
        </View>
      ))}
    </View>
  );

  // ─── Success ────────────────────────────────────────────────
  if (sent) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        {/* Decorative rings */}
        <Animated.View style={[styles.successRing3, { opacity: successOpacity, transform: [{ scale: successScale }] }]} />
        <Animated.View style={[styles.successRing2, { opacity: successOpacity, transform: [{ scale: successScale }] }]} />

        <Animated.View style={[styles.successCircleOuter, { transform: [{ scale: successScale }], opacity: successOpacity }]}>
          <LinearGradient colors={["#10b981", "#059669"]} style={styles.successCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <AnimatedEntry delay={300}>
          <Text style={[styles.successTitle, { color: colors.text }]}>Money Sent!</Text>
        </AnimatedEntry>
        <AnimatedEntry delay={400}>
          <Text style={[styles.successAmount, { color: colors.text }]}>
            R{parseFloat(amount).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </AnimatedEntry>
        <AnimatedEntry delay={500}>
          <View style={styles.successRecipientRow}>
            <View style={[styles.successRecipientDot, { backgroundColor: recipient?.color }]} />
            <Text style={[styles.successTo, { color: colors.textMuted }]}>to {recipient?.name}</Text>
          </View>
        </AnimatedEntry>

        <AnimatedEntry delay={700}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.successBtn} activeOpacity={0.85}>
            <LinearGradient colors={Gradients.violet} style={styles.successBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.successBtnText}>Back to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </AnimatedEntry>
      </View>
    );
  }

  // ─── Processing ─────────────────────────────────────────────
  if (processing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.processingOuter, { transform: [{ scale: pulseAnim }] }]}>
          <Animated.View style={[styles.processingSpinner, { transform: [{ rotate: spin }] }]}>
            <LinearGradient colors={Gradients.violet} style={styles.processingSpinnerInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="send" size={24} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </Animated.View>
        <Text style={[styles.processingText, { color: colors.text }]}>Sending Payment</Text>
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
          <AnimatedEntry delay={0}>
            <View style={styles.stepContent}>
              <Text style={[styles.stepHint, { color: colors.textMuted }]}>Choose which wallet to send from</Text>
              {wallets.map((w, i) => {
                const gradient = WalletColors[w.type] || Gradients.violet;
                return (
                  <AnimatedEntry key={w.id} delay={80 + i * 60}>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setSelectedWallet(w);
                        setStep(1);
                      }}
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
                      <View style={[styles.walletChevronWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb" }]}>
                        <Ionicons name="chevron-forward" size={16} color={colors.textSoft} />
                      </View>
                    </TouchableOpacity>
                  </AnimatedEntry>
                );
              })}
            </View>
          </AnimatedEntry>
        )}

        {/* Step 1: Select Recipient */}
        {step === 1 && (
          <AnimatedEntry delay={0}>
            <View style={styles.stepContent}>
              {/* Selected wallet indicator */}
              <View style={[styles.selectedWalletBadge, { backgroundColor: isDark ? "rgba(124,58,237,0.08)" : "#f5f3ff", borderColor: isDark ? "rgba(124,58,237,0.15)" : "#ede9fe" }]}>
                <Ionicons name="wallet-outline" size={14} color={colors.violet} />
                <Text style={[styles.selectedWalletText, { color: colors.violet }]}>
                  {selectedWallet?.name}
                </Text>
              </View>

              <View style={[styles.searchBar, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6", borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }]}>
                <Ionicons name="search" size={18} color={colors.textMuted} />
                <TextInput placeholder="Search name or email" placeholderTextColor={colors.textMuted} style={[styles.searchInput, { color: colors.text }]} />
              </View>
              <Text style={[styles.contactsLabel, { color: colors.textMuted }]}>RECENT CONTACTS</Text>
              {CONTACTS.map((c, i) => (
                <AnimatedEntry key={c.id} delay={100 + i * 60}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setRecipient(c);
                      setStep(2);
                    }}
                    activeOpacity={0.7}
                    style={[styles.contactRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={[styles.avatar, { backgroundColor: c.color }]}>
                      <Text style={styles.avatarText}>{c.avatar}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contactName, { color: colors.text }]}>{c.name}</Text>
                      <Text style={[styles.contactSub, { color: colors.textMuted }]}>Recent transfer</Text>
                    </View>
                    <View style={[styles.walletChevronWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb" }]}>
                      <Ionicons name="chevron-forward" size={16} color={colors.textSoft} />
                    </View>
                  </TouchableOpacity>
                </AnimatedEntry>
              ))}
            </View>
          </AnimatedEntry>
        )}

        {/* Step 2: Enter Amount */}
        {step === 2 && (
          <AnimatedEntry delay={0}>
            <View>
              <View style={styles.recipientBadge}>
                <View style={[styles.avatar, { backgroundColor: recipient?.color }]}>
                  <Text style={styles.avatarText}>{recipient?.avatar}</Text>
                </View>
                <Text style={[styles.sendingTo, { color: colors.textMuted }]}>
                  Sending to <Text style={{ color: colors.text, fontWeight: "600" }}>{recipient?.name}</Text>
                </Text>
              </View>

              <AnimatedEntry delay={100}>
                <View style={styles.amountDisplay}>
                  <Text style={[styles.amountCurrency, { color: colors.textMuted }]}>R</Text>
                  <Text style={[styles.amountValue, { color: colors.text }]}>{amount || "0"}</Text>
                </View>
              </AnimatedEntry>

              <AnimatedEntry delay={150}>
                <View style={[styles.availableBadge, { backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "#ecfdf5" }]}>
                  <Ionicons name="wallet-outline" size={12} color="#10b981" />
                  <Text style={[styles.availableText, { color: "#10b981" }]}>
                    Available: R{selectedWallet ? parseFloat(selectedWallet.balance).toLocaleString("en-ZA", { minimumFractionDigits: 2 }) : "0.00"}
                  </Text>
                </View>
              </AnimatedEntry>

              <AnimatedEntry delay={200}>
                <NumPad value={amount} onChange={setAmount} />
              </AnimatedEntry>

              <AnimatedEntry delay={250}>
                <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
                  <TouchableOpacity
                    onPress={() => {
                      if (amount && parseFloat(amount) > 0) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                        setStep(3);
                      }
                    }}
                    disabled={!amount || parseFloat(amount) <= 0}
                    activeOpacity={0.85}
                    style={{ opacity: !amount || parseFloat(amount) <= 0 ? 0.4 : 1 }}
                  >
                    <LinearGradient colors={Gradients.violet} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Text style={styles.primaryBtnText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </AnimatedEntry>
            </View>
          </AnimatedEntry>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <AnimatedEntry delay={0}>
            <View style={styles.stepContent}>
              <AnimatedEntry delay={80}>
                <View style={styles.confirmRecipient}>
                  <View style={[styles.avatarLg, { backgroundColor: recipient?.color }]}>
                    <Text style={styles.avatarLgText}>{recipient?.avatar}</Text>
                  </View>
                  <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>Sending to</Text>
                  <Text style={[styles.confirmName, { color: colors.text }]}>{recipient?.name}</Text>
                </View>
              </AnimatedEntry>

              <AnimatedEntry delay={160}>
                <Text style={[styles.confirmAmount, { color: colors.text }]}>
                  R{parseFloat(amount).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </AnimatedEntry>

              <AnimatedEntry delay={240}>
                <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelRow}>
                      <Ionicons name="wallet-outline" size={14} color={colors.textMuted} />
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>From</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedWallet?.name}</Text>
                  </View>
                  <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                    <View style={styles.detailLabelRow}>
                      <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>To</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{recipient?.name}</Text>
                  </View>
                  <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                    <View style={styles.detailLabelRow}>
                      <Ionicons name="pricetag-outline" size={14} color={colors.textMuted} />
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Fee</Text>
                    </View>
                    <View style={[styles.freeBadge, { backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "#ecfdf5" }]}>
                      <Text style={styles.freeText}>Free</Text>
                    </View>
                  </View>
                  <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                    <View style={styles.detailLabelRow}>
                      <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
                      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Total</Text>
                    </View>
                    <Text style={[styles.detailValueBold, { color: colors.text }]}>
                      R{parseFloat(amount).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              </AnimatedEntry>

              <AnimatedEntry delay={320}>
                <TouchableOpacity onPress={handleSend} activeOpacity={0.85}>
                  <LinearGradient colors={Gradients.violet} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryBtnText}>Confirm & Send</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </AnimatedEntry>

              <AnimatedEntry delay={400}>
                <View style={styles.secureRow}>
                  <Ionicons name="lock-closed" size={12} color={colors.textSoft} />
                  <Text style={[styles.secureText, { color: colors.textSoft }]}>Secured with end-to-end encryption</Text>
                </View>
              </AnimatedEntry>
            </View>
          </AnimatedEntry>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 17, fontWeight: "600", letterSpacing: -0.2 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  stepBar: { flexDirection: "row", gap: 6, paddingHorizontal: 24, marginBottom: 20 },
  stepDot: { flex: 1, height: 4, borderRadius: 2 },
  stepDotInner: { width: "100%", height: "100%", borderRadius: 2 },

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
  walletChevronWrap: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  selectedWalletBadge: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginBottom: 16,
  },
  selectedWalletText: { fontSize: 12, fontWeight: "600" },

  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 14 },
  contactsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 12 },
  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 18, borderWidth: 1, marginBottom: 8,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  contactName: { fontSize: 15, fontWeight: "600", letterSpacing: -0.1 },
  contactSub: { fontSize: 12, marginTop: 2 },

  recipientBadge: { alignItems: "center", gap: 8, marginBottom: 12 },
  sendingTo: { fontSize: 13 },
  amountDisplay: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 80, gap: 4, paddingHorizontal: 24 },
  amountCurrency: { fontSize: 28, fontWeight: "500" },
  amountValue: { fontSize: 52, fontWeight: "800", letterSpacing: -2 },

  availableBadge: {
    flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginBottom: 20,
  },
  availableText: { fontSize: 12, fontWeight: "600" },

  confirmRecipient: { alignItems: "center", marginTop: 8, marginBottom: 20 },
  avatarLg: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  avatarLgText: { color: "#fff", fontWeight: "700", fontSize: 22 },
  confirmLabel: { fontSize: 13, letterSpacing: 0.2 },
  confirmName: { fontSize: 20, fontWeight: "700", marginTop: 2, letterSpacing: -0.3 },
  confirmAmount: { fontSize: 40, fontWeight: "800", textAlign: "center", marginBottom: 28, letterSpacing: -1.5 },

  detailCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, paddingHorizontal: 18 },
  detailLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: "500" },
  detailValueBold: { fontSize: 15, fontWeight: "700" },
  freeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  freeText: { color: "#10b981", fontSize: 13, fontWeight: "600" },

  primaryBtn: { flexDirection: "row", paddingVertical: 17, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  secureRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16 },
  secureText: { fontSize: 11, letterSpacing: 0.2 },

  // Processing
  processingOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(124,58,237,0.06)", alignItems: "center", justifyContent: "center", marginBottom: 28 },
  processingSpinner: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  processingSpinnerInner: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  processingText: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
  processingSubtext: { fontSize: 13, marginTop: 6 },

  // Success
  successRing3: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: "rgba(16,185,129,0.06)" },
  successRing2: { position: "absolute", width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: "rgba(16,185,129,0.1)" },
  successCircleOuter: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(16,185,129,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 28 },
  successCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  successAmount: { fontSize: 22, fontWeight: "700", marginTop: 8, letterSpacing: -0.3 },
  successRecipientRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  successRecipientDot: { width: 8, height: 8, borderRadius: 4 },
  successTo: { fontSize: 15 },
  successBtn: { marginTop: 40, width: 280 },
  successBtnGradient: { paddingVertical: 17, borderRadius: 18, alignItems: "center" },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
