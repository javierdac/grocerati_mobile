import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

function SkeletonPulse({ width, height, borderRadius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#e0e0e0', opacity }, style]}
    />
  );
}

export function ListCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonPulse width="60%" height={20} />
      <SkeletonPulse width="40%" height={14} style={{ marginTop: 10 }} />
    </View>
  );
}

export function GroceryItemSkeleton() {
  return (
    <View style={styles.item}>
      <SkeletonPulse width={28} height={28} borderRadius={14} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonPulse width="70%" height={17} />
        <SkeletonPulse width="40%" height={13} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function ListsSkeleton() {
  return (
    <View style={{ padding: 16 }}>
      <ListCardSkeleton />
      <ListCardSkeleton />
      <ListCardSkeleton />
    </View>
  );
}

export function ItemsSkeleton() {
  return (
    <View>
      <GroceryItemSkeleton />
      <GroceryItemSkeleton />
      <GroceryItemSkeleton />
      <GroceryItemSkeleton />
      <GroceryItemSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    padding: 14,
  },
});
