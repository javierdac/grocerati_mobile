import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';

let CameraKit = null;
try {
  CameraKit = require('react-native-camera-kit');
} catch {}

async function requestCameraPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      { title: 'Camara', message: 'Grocerati necesita acceso a la camara para escanear QR', buttonPositive: 'Permitir' },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export default function QRScanner({ onRead }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!CameraKit) {
      setError('Camara no disponible en este dispositivo');
      return;
    }
    requestCameraPermission().then((granted) => {
      if (granted) {
        setHasPermission(true);
      } else {
        setError('Permiso de camara denegado');
      }
    });
  }, []);

  if (error) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>{error}</Text>
      </View>
    );
  }

  if (!hasPermission || !CameraKit) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Cargando camara...</Text>
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
  },
  fallbackText: {
    color: '#999',
    fontSize: 14,
  },
});
