import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../services/api';
import FadeInScreen from '../components/FadeInScreen';
import ModalWrapper from '../components/ModalWrapper';
import { ProfileSkeleton } from '../components/Skeleton';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, listsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/lists'),
      ]);
      setUser(userRes.data);
      setLists(listsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, fetchData]);

  const openEdit = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPassword('');
    setShowEdit(true);
  };

  const saveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      return Alert.alert('Error', 'Nombre y correo son requeridos');
    }
    setSaving(true);
    try {
      const body = { name: editName.trim(), email: editEmail.trim() };
      if (editPassword.trim()) body.password = editPassword.trim();
      const { data } = await api.patch('/auth/me', body);
      setUser(data);
      setShowEdit(false);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo actualizar');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    Alert.alert('Cerrar sesion', 'Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const leaveList = (list) => {
    Alert.alert('Salir de lista', `Salir de "${list.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/lists/${list._id}/leave`);
            setLists((prev) => prev.filter((l) => l._id !== list._id));
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo salir');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <FadeInScreen>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <TouchableOpacity style={styles.editProfileBtn} onPress={openEdit}>
          <Ionicons name="create-outline" size={16} color="#4CAF50" />
          <Text style={styles.editProfileBtnText}>Editar perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis listas</Text>
        {lists.map((list) => (
          <View key={list._id} style={styles.listRow}>
            <View style={styles.listIcon}>
              <Ionicons name="cart-outline" size={18} color="#4CAF50" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listName}>{list.name}</Text>
              <Text style={styles.listMeta}>
                {list.members.length} miembro{list.members.length !== 1 ? 's' : ''} ·{' '}
                {list.totalItems} producto{list.totalItems !== 1 ? 's' : ''}
              </Text>
            </View>
            {list.created_by !== user?._id && (
              <TouchableOpacity onPress={() => leaveList(list)} style={styles.leaveBtn}>
                <Ionicons name="exit-outline" size={16} color="#e53935" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {lists.length === 0 && (
          <Text style={styles.emptyText}>No perteneces a ninguna lista</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#e53935" />
          <Text style={styles.logoutBtnText}>Cerrar sesion</Text>
        </TouchableOpacity>
      </View>

      <ModalWrapper visible={showEdit} onClose={() => setShowEdit(false)}>
            <Text style={styles.modalTitle}>Editar perfil</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nombre"
              placeholderTextColor="#999"
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Correo"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.modalInput}
              value={editPassword}
              onChangeText={setEditPassword}
              placeholder="Nueva contrasena (opcional)"
              placeholderTextColor="#999"
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowEdit(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveProfile}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
      </ModalWrapper>
    </ScrollView>
    </FadeInScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700', color: '#333' },
  email: { fontSize: 14, color: '#999', marginTop: 4 },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editProfileBtnText: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
  section: { marginTop: 8, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 16,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listName: { fontSize: 16, fontWeight: '600', color: '#333' },
  listMeta: { fontSize: 13, color: '#999', marginTop: 2 },
  leaveBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff3f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  emptyText: { color: '#999', fontSize: 14, textAlign: 'center', padding: 20 },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcccc',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  logoutBtnText: { color: '#e53935', fontSize: 16, fontWeight: '600' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f5f5f5' },
  saveBtn: { backgroundColor: '#4CAF50' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#666' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
