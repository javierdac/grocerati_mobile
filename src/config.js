import { Platform } from 'react-native';

// Set to true to use the Vercel production URL
const USE_PRODUCTION = true;
const PRODUCTION_URL = 'https://grocerati-backend.vercel.app';

const getDevHost = () => {
  if (Platform.OS === 'ios') return 'localhost';
  // For real Android devices use your Mac's local IP.
  // 10.0.2.2 only works on the Android emulator.
  return '192.168.1.8';
};

export const API_URL = USE_PRODUCTION
  ? PRODUCTION_URL
  : `http://${getDevHost()}:3001`;
