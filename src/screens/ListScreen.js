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
  ScrollView,
  AppState,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../services/api';
import GroceryItem from '../components/GroceryItem';
import AddItemInput from '../components/AddItemInput';
import { ItemsSkeleton } from '../components/Skeleton';
import AnimatedListItem from '../components/AnimatedListItem';
import FadeInScreen from '../components/FadeInScreen';

const LIST_ICONS = [
  'cart-outline', 'home-outline', 'business-outline', 'storefront-outline',
  'restaurant-outline', 'cafe-outline', 'wine-outline', 'pizza-outline',
  'fitness-outline', 'medical-outline', 'paw-outline', 'gift-outline',
  'heart-outline', 'star-outline', 'construct-outline', 'color-palette-outline',
  'leaf-outline', 'airplane-outline',
];

export default function ListScreen({ route, navigation }) {
  const { listId } = route.params;
  const [listName, setListName] = useState(route.params.listName);
  const [listIcon, setListIcon] = useState(route.params.listIcon || 'cart-outline');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('');
  const [showListEdit, setShowListEdit] = useState(false);
  const [listEditName, setListEditName] = useState('');
  const [listEditIcon, setListEditIcon] = useState('cart-outline');
  const [listMembers, setListMembers] = useState([]);

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await api.get(`/lists/${listId}/items`);
      const sorted = [...data].sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
      );
      setItems(sorted);
    } catch (err) {
      if (err.response?.status === 404) {
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  }, [listId, navigation]);

  const fetchListInfo = useCallback(async () => {
    try {
      const { data } = await api.get(`/lists/${listId}`);
      setListName(data.name);
      setListIcon(data.icon || 'cart-outline');
      setListMembers(data.members || []);
    } catch {}
  }, [listId]);

  useEffect(() => {
    fetchItems();
    fetchListInfo();

    // Poll for updates every 5 seconds while screen is active
    const interval = setInterval(fetchItems, 5000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchItems();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [fetchItems, fetchListInfo, listId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const addItem = async (name, quantity) => {
    try {
      await api.post(`/lists/${listId}/items`, { name, quantity });
      await fetchItems();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo agregar');
    }
  };

  const toggleItem = async (item) => {
    const newCompleted = !item.completed;
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, completed: newCompleted } : i)),
    );
    try {
      await api.patch(`/lists/${listId}/items/${item._id}`, { completed: newCompleted });
    } catch {
      await fetchItems();
    }
  };

  const deleteItem = async (id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
    try {
      await api.delete(`/lists/${listId}/items/${id}`);
    } catch {
      await fetchItems();
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditName(item.name);
    setEditQty(String(item.quantity));
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    try {
      await api.patch(`/lists/${listId}/items/${editItem._id}`, {
        name: editName.trim(),
        quantity: parseInt(editQty, 10) || 1,
      });
      setEditItem(null);
      await fetchItems();
    } catch {
      Alert.alert('Error', 'No se pudo guardar');
    }
  };

  const clearCompleted = useCallback(() => {
    const completedCount = items.filter((i) => i.completed).length;
    if (completedCount === 0) return;
    Alert.alert('Limpiar completados', `Eliminar ${completedCount} items completados?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpiar',
        style: 'destructive',
        onPress: async () => {
          setItems((prev) => prev.filter((i) => !i.completed));
          await api.post(`/lists/${listId}/items/clear-completed`);
          await fetchItems();
        },
      },
    ]);
  }, [items, listId, fetchItems]);

  const shareList = useCallback(async () => {
    try {
      const { data } = await api.get(`/lists/${listId}`);
      const code = data.invite_code;
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
    } catch {
      Alert.alert('Error', 'No se pudo obtener el codigo');
    }
  }, [listId]);

  const openListEdit = useCallback(async () => {
    await fetchListInfo();
    setListEditName(listName);
    setListEditIcon(listIcon);
    setShowListEdit(true);
  }, [fetchListInfo, listName, listIcon]);

  const saveListEdit = async () => {
    if (!listEditName.trim()) return;
    try {
      await api.patch(`/lists/${listId}`, { name: listEditName.trim(), icon: listEditIcon });
      setListName(listEditName.trim());
      setListIcon(listEditIcon);
      setShowListEdit(false);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  const removeMember = (member) => {
    Alert.alert('Quitar miembro', `Quitar a ${member.name} de la lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/lists/${listId}/remove-member`, { user_id: member._id });
            setListMembers((prev) => prev.filter((m) => m._id !== member._id));
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo quitar');
          }
        },
      },
    ]);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: listName,
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={shareList} hitSlop={8}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearCompleted} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openListEdit} hitSlop={8}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, listName, shareList, clearCompleted, openListEdit]);

  return (
    <FadeInScreen>
    <View style={styles.container}>
      <AddItemInput onAdd={addItem} />

      {loading ? (
        <ItemsSkeleton />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <GroceryItem
                item={item}
                onToggle={() => toggleItem(item)}
                onDelete={() => deleteItem(item._id)}
                onEdit={openEdit}
              />
            </AnimatedListItem>
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={items.length === 0 && styles.empty}
          ListEmptyComponent={
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="basket-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>Lista vacia. Agrega productos!</Text>
            </View>
          }
        />
      )}

      {/* Edit Item Modal */}
      <Modal visible={!!editItem} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar producto</Text>
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
              value={editQty}
              onChangeText={setEditQty}
              placeholder="Cantidad"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={saveEdit}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditItem(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveEdit}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit List Modal */}
      <Modal visible={showListEdit} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar lista</Text>
            <TextInput
              style={styles.modalInput}
              value={listEditName}
              onChangeText={setListEditName}
              placeholder="Nombre de la lista"
              placeholderTextColor="#999"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveListEdit}
            />

            <Text style={styles.membersTitle}>Icono</Text>
            <View style={styles.iconGrid}>
              {LIST_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconOption, listEditIcon === icon && styles.iconOptionSelected]}
                  onPress={() => setListEditIcon(icon)}>
                  <Ionicons
                    name={icon}
                    size={22}
                    color={listEditIcon === icon ? '#fff' : '#666'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.membersTitle}>Miembros</Text>
            <ScrollView style={styles.membersList}>
              {listMembers.map((member) => (
                <View key={member._id} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.name?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  {listMembers.length > 1 && (
                    <TouchableOpacity onPress={() => removeMember(member)} hitSlop={8}>
                      <Ionicons name="close-circle-outline" size={22} color="#e53935" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={[styles.modalButtons, { marginTop: 16 }]}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowListEdit(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveListEdit}>
                <Text style={styles.saveBtnText}>Guardar</Text>
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16, marginTop: 8 },
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
  membersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 12,
  },
  membersList: { maxHeight: 200 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  memberName: { fontSize: 15, fontWeight: '600', color: '#333' },
  memberEmail: { fontSize: 12, color: '#999' },
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
