import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../services/api';
import { ListsSkeleton } from '../components/Skeleton';
import AnimatedListItem from '../components/AnimatedListItem';
import FadeInScreen from '../components/FadeInScreen';

const LIST_ICONS = [
  'cart-outline', 'home-outline', 'business-outline', 'storefront-outline',
  'restaurant-outline', 'cafe-outline', 'wine-outline', 'pizza-outline',
  'fitness-outline', 'medical-outline', 'paw-outline', 'gift-outline',
  'heart-outline', 'star-outline', 'construct-outline', 'color-palette-outline',
  'leaf-outline', 'airplane-outline',
];

export default function ListsScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('cart-outline');
  const [joinCode, setJoinCode] = useState('');
  const [userName, setUserName] = useState('');

  const fetchLists = useCallback(async () => {
    try {
      const { data } = await api.get('/lists');
      setLists(data);
    } catch (err) {
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchLists();
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUserName(data.name);
      } catch {}
    };
    fetchUser();
  }, [fetchLists]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLists();
    });
    return unsubscribe;
  }, [navigation, fetchLists]);

  const createList = async () => {
    if (!newName.trim()) return;
    try {
      const { data } = await api.post('/lists', { name: newName.trim(), icon: newIcon });
      setNewName('');
      setNewIcon('cart-outline');
      setShowCreate(false);
      setLists((prev) => [data, ...prev]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo crear');
    }
  };

  const joinList = async () => {
    if (!joinCode.trim()) return;
    try {
      const { data } = await api.post('/lists/join', { invite_code: joinCode.trim() });
      setJoinCode('');
      setShowJoin(false);
      setLists((prev) => [data, ...prev]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo unir');
    }
  };

  const confirmDeleteList = async (list) => {
    try {
      await api.delete(`/lists/${list._id}`);
      setLists((prev) => prev.filter((l) => l._id !== list._id));
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo eliminar');
    }
  };

  const shareList = (list) => {
    const code = list.invite_code;
    Alert.alert('Compartir lista', `Codigo de invitacion:\n\n${code}`, [
      {
        text: 'Copiar',
        onPress: () => {
          Clipboard.setString(code);
          Alert.alert('Copiado!', 'Codigo copiado al portapapeles');
        },
      },
      { text: 'Cerrar' },
    ]);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowJoin(true)} style={styles.headerJoinBtn}>
          <Ionicons name="qr-code-outline" size={16} color="#fff" />
          <Text style={styles.headerJoinText}>Unirse</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const renderList = ({ item, index }) => (
    <AnimatedListItem index={index}>
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ListDetail', { listId: item._id, listName: item.name, listIcon: item.icon })
        }
        onLongPress={() =>
          Alert.alert(
            'Eliminar lista',
            `Estas seguro de eliminar "${item.name}" y todos sus productos?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Compartir', onPress: () => shareList(item) },
              { text: 'Eliminar', style: 'destructive', onPress: () => confirmDeleteList(item) },
            ],
          )
        }
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name={item.icon || 'cart-outline'} size={20} color="#4CAF50" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.members.length} miembro{item.members.length !== 1 ? 's' : ''} ·{' '}
              {item.totalItems} producto{item.totalItems !== 1 ? 's' : ''}
            </Text>
          </View>
          {item.pendingItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.pendingItems}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 8 }} />
        </View>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  return (
    <FadeInScreen>
    <View style={styles.container}>
      {userName ? <Text style={styles.greeting}>Hola, {userName}!</Text> : null}

      {loading ? (
        <ListsSkeleton />
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item._id}
          renderItem={renderList}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await fetchLists();
            setRefreshing(false);
          }}
          contentContainerStyle={[styles.listContent, lists.length === 0 && styles.empty]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#ddd" />
              <Text style={styles.emptyText}>No tienes listas</Text>
              <Text style={styles.emptySubtext}>Crea una lista o unite con un codigo</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showCreate} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Lista</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nombre de la lista"
              placeholderTextColor="#999"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={createList}
            />
            <Text style={styles.iconSectionTitle}>Icono</Text>
            <View style={styles.iconGrid}>
              {LIST_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconOption, newIcon === icon && styles.iconOptionSelected]}
                  onPress={() => setNewIcon(icon)}>
                  <Ionicons
                    name={icon}
                    size={22}
                    color={newIcon === icon ? '#fff' : '#666'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => {
                  setShowCreate(false);
                  setNewName('');
                  setNewIcon('cart-outline');
                }}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveModalBtn]}
                onPress={createList}>
                <Text style={styles.saveBtnText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showJoin} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unirse a Lista</Text>
            <TextInput
              style={styles.modalInput}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="Codigo de invitacion"
              placeholderTextColor="#999"
              autoCapitalize="characters"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={joinList}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => {
                  setShowJoin(false);
                  setJoinCode('');
                }}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.joinModalBtn]}
                onPress={joinList}>
                <Text style={styles.saveBtnText}>Unirse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
    </FadeInScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  listContent: { padding: 16, paddingBottom: 80 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 18, fontWeight: '600', marginTop: 12 },
  emptySubtext: { color: '#999', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardName: { fontSize: 16, fontWeight: '700', color: '#333' },
  cardMeta: { fontSize: 13, color: '#999', marginTop: 2 },
  badge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelModalBtn: { backgroundColor: '#f5f5f5' },
  saveModalBtn: { backgroundColor: '#4CAF50' },
  joinModalBtn: { backgroundColor: '#2196F3' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#666' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  headerJoinText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  iconSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  iconOption: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    backgroundColor: '#4CAF50',
  },
});
