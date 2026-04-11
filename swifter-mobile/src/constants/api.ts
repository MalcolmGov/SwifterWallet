// When running locally, point to your dev server.
// After deploying to Vercel, update this to your production URL.
export const API_BASE_URL = __DEV__
  ? "http://10.0.2.2:3002" // Android emulator → host machine
  : "https://your-app.vercel.app";

// For physical device testing, replace with your machine's local IP:
// export const API_BASE_URL = "http://192.168.x.x:3002";
