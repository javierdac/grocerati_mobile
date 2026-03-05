import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import FadeInScreen from '../components/FadeInScreen';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Completa todos los campos');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', data.token);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeInScreen>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Grocerati</Text>
      <Text style={styles.subtitle}>Listas de compras compartidas</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextInput
        ref={passwordRef}
        style={styles.input}
        placeholder="Contrasena"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        returnKeyType="go"
        blurOnSubmit={false}
        onSubmitEditing={() => handleLogin()}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesion</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>No tienes cuenta? Registrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
    </FadeInScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 36, fontWeight: '800', color: '#4CAF50', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  link: { color: '#4CAF50', textAlign: 'center', marginTop: 20, fontSize: 15 },
});
