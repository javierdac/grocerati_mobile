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

function ProfileListRowSkeleton() {
  return (
    <View style={styles.profileListRow}>
      <SkeletonPulse width={36} height={36} borderRadius={10} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonPulse width="60%" height={16} />
        <SkeletonPulse width="40%" height={13} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.profileContainer}>
      <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 24 }}>
        <SkeletonPulse width={80} height={80} borderRadius={40} />
        <SkeletonPulse width={140} height={22} style={{ marginTop: 12 }} />
        <SkeletonPulse width={180} height={14} style={{ marginTop: 8 }} />
        <SkeletonPulse width={120} height={36} borderRadius={20} style={{ marginTop: 12 }} />
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <SkeletonPulse width={90} height={13} style={{ marginTop: 16, marginBottom: 12 }} />
        <ProfileListRowSkeleton />
        <ProfileListRowSkeleton />
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <SkeletonPulse width={70} height={13} style={{ marginTop: 16, marginBottom: 12 }} />
        <SkeletonPulse width="100%" height={52} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  profileListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
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
