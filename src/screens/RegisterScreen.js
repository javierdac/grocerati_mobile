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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Completa todos los campos');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      await AsyncStorage.setItem('token', data.token);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeInScreen>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextInput
        ref={emailRef}
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
        onSubmitEditing={() => handleRegister()}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Ya tienes cuenta? Inicia sesion</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
    </FadeInScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 30, fontWeight: '800', color: '#333', textAlign: 'center', marginBottom: 32 },
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
