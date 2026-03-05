import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default function GroceryItem({ item, onToggle, onDelete, onEdit }) {
  const swipeRef = useRef();

  const renderRightActions = (progress) => {
    const translateEdit = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [120, 0],
    });
    const translateDelete = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [60, 0],
    });

    return (
      <View style={styles.actions}>
        <Animated.View style={{ transform: [{ translateX: translateEdit }] }}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => {
              swipeRef.current?.close();
              onEdit(item);
            }}>
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ translateX: translateDelete }] }}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => {
              swipeRef.current?.close();
              Alert.alert(
                'Eliminar producto',
                `Eliminar "${item.name}"?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Eliminar', style: 'destructive', onPress: onDelete },
                ],
              );
            }}>
            <Text style={styles.actionText}>Eliminar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} overshootRight={false} friction={2} rightThreshold={40}>
      <Pressable style={[styles.container, item.completed && styles.completedContainer]} onPress={onToggle} onLongPress={() => swipeRef.current?.openRight()}>
        <View style={[styles.checkbox, item.completed && styles.checked]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, item.completed && styles.completedText]}>
            {item.name}
          </Text>
          <Text style={styles.meta}>
            x{item.quantity} · {item.added_by?.name || 'Desconocido'}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  completedContainer: { opacity: 0.5 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checked: { backgroundColor: '#4CAF50' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '600', color: '#333' },
  completedText: { textDecorationLine: 'line-through', color: '#999' },
  meta: { fontSize: 13, color: '#aaa', marginTop: 2 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginRight: 12,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    borderRadius: 12,
    marginLeft: 4,
  },
  editBtn: { backgroundColor: '#2196F3' },
  deleteBtn: { backgroundColor: '#e53935' },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
