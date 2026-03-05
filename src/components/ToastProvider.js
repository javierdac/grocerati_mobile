import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { registerToast } from '../utils/toast';

export default function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const timeout = useRef(null);

  const show = useCallback((msg) => {
    if (timeout.current) clearTimeout(timeout.current);
    setMessage(msg);
    translateY.setValue(30);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 120, friction: 14 }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    timeout.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 30, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 2000);
  }, [opacity, translateY]);

  useEffect(() => {
    registerToast(show);
  }, [show]);

  return (
    <>
      {children}
      <Animated.View
        style={[styles.toast, { opacity, transform: [{ translateY }] }]}
        pointerEvents="none">
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#ffffffee',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  text: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
});
