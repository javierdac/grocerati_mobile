import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AddItemInput({ onAdd }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const qtyRef = useRef();

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const qty = parseInt(quantity, 10) || 1;
    onAdd(trimmed, qty);
    setName('');
    setQuantity('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.nameInput}
        placeholder="Producto"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => qtyRef.current?.focus()}
      />
      <TextInput
        ref={qtyRef}
        style={styles.qtyInput}
        placeholder="Cant."
        placeholderTextColor="#999"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="number-pad"
        returnKeyType="done"
        blurOnSubmit={false}
        onSubmitEditing={handleSubmit}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  qtyInput: {
    width: 65,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: { color: '#fff', fontSize: 28, fontWeight: '600', marginTop: -2 },
});
