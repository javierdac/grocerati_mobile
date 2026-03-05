import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, Linking, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

let CameraKit = null;
try {
  CameraKit = require('react-native-camera-kit');
} catch {}

async function checkAndRequestPermission() {
  if (Platform.OS === 'android') {
    const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
    if (status) return 'granted';
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Permiso de camara',
        message: 'Grocerati necesita acceso a la camara para escanear codigos QR',
        buttonPositive: 'Permitir',
        buttonNegative: 'Denegar',
      },
    );
    if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
    return 'denied';
  }

  // iOS - react-native-camera-kit handles permission request internally
  // but we check first to show proper UI
  if (CameraKit) {
    try {
      // CameraKit on iOS will trigger the permission dialog when camera mounts
      // We return 'pending' to show camera (which triggers the dialog)
      return 'granted';
    } catch {
      return 'denied';
    }
  }
  return 'unavailable';
}

export default function QRScanner({ onRead }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (!CameraKit) {
      setStatus('unavailable');
      return;
    }
    checkAndRequestPermission().then(setStatus);
  }, []);

  if (status === 'checking') {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Verificando permisos...</Text>
      </View>
    );
  }

  if (status === 'unavailable') {
    return (
      <View style={styles.fallback}>
        <Ionicons name="camera-outline" size={32} color="#999" />
        <Text style={styles.fallbackText}>Camara no disponible</Text>
      </View>
    );
  }

  if (status === 'denied') {
    return (
      <View style={styles.fallback}>
        <Ionicons name="lock-closed-outline" size={32} color="#999" />
        <Text style={styles.fallbackText}>Permiso de camara denegado</Text>
      </View>
    );
  }

  if (status === 'blocked') {
    return (
      <View style={styles.fallback}>
        <Ionicons name="lock-closed-outline" size={32} color="#999" />
        <Text style={styles.fallbackText}>Permiso de camara bloqueado</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => Linking.openSettings()}>
          <Text style={styles.settingsBtnText}>Abrir Ajustes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { Camera, CameraType } = CameraKit;

  return (
    <Camera
      style={styles.camera}
      cameraType={CameraType.Back}
      scanBarcode
      onReadCode={(event) => {
        const code = event.nativeEvent.codeStringValue;
        if (code) onRead(code);
      }}
    />
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1 },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 10,
    padding: 20,
  },
  fallbackText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  settingsBtn: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  settingsBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
