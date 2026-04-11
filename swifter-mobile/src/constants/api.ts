import { Platform } from "react-native";

/**
 * Resolve API host per platform.
 * - Web: same machine → localhost (10.0.2.2 is Android-emulator-only and breaks browsers).
 * - Android emulator: 10.0.2.2 maps to host loopback.
 * - iOS simulator: localhost works; physical device → set EXPO_PUBLIC_API_URL to your LAN IP.
 */
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (!__DEV__) {
    return "https://your-app.vercel.app";
  }

  const port = process.env.EXPO_PUBLIC_API_PORT || "3002";

  if (Platform.OS === "web") {
    return `http://localhost:${port}`;
  }
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${port}`;
  }
  return `http://localhost:${port}`;
}

export const API_BASE_URL = resolveApiBaseUrl();
