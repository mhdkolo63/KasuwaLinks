import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Heart,
  Share2,
  Flag,
  BadgeCheck,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PriceLabel } from '@/components/ui/PriceLabel';
import { SellerCard } from '@/components/seller/SellerCard';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { getProductById, incrementViews } from '@/services/productService';
import { getCategoryById } from '@/constants/categories';
import { formatRelativeTime } from '@/utils/formatDate';
import { useAuthContext } from '@/context/AuthContext';
import type { Product } from '@/types/product';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthContext();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: product, error, isLoading } = useSupabaseQuery<Product | null>(
    () => getProductById(id),
    [id]
  );

  const category = product ? getCategoryById(product.categoryId) : undefined;

  const handleContactSeller = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Loading product..." fullScreen />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
          </Pressable>
        </View>
        <ErrorState
          message={error ?? 'Product not found or no longer available.'}
          action={<Button label="Go Back" onPress={() => router.back()} variant="outline" />}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setIsFavorite((v) => !v)} hitSlop={8}>
            <Heart
              size={22}
              color={isFavorite ? colors.error : colors.text}
              strokeWidth={2}
              fill={isFavorite ? colors.error : 'none'}
            />
          </Pressable>
          <Pressable hitSlop={8}>
            <Share2 size={20} color={colors.text} strokeWidth={2} />
          </Pressable>
          <Pressable hitSlop={8}>
            <Flag size={20} color={colors.text} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {category?.name.charAt(0) ?? 'K'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <PriceLabel price={product.price} currency={product.currency} style={styles.price} />
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={14} color={colors.textSecondary} strokeWidth={2} />
              <Text style={styles.metaText}>{product.location}</Text>
            </View>
            <Text style={styles.metaText}>{formatRelativeTime(product.createdAt)}</Text>
          </View>

          <View style={styles.badges}>
            {category && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{category.name}</Text>
              </View>
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.condition.replace('-', ' ')}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <Pressable onPress={() => product.sellerId && router.push({ pathname: '/seller/[id]', params: { id: product.sellerId } })}>
              <View style={styles.sellerCard}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerAvatarText}>S</Text>
                </View>
                <View style={styles.sellerInfo}>
                  <View style={styles.sellerNameRow}>
                    <Text style={styles.sellerName}>Seller</Text>
                    <BadgeCheck size={16} color={colors.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.sellerLocation}>{product.location}</Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label={isAuthenticated ? 'Contact Seller' : 'Sign in to contact'}
          onPress={handleContactSeller}
          size="large"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  imagePlaceholderText: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.primary,
  },
  content: {
    padding: 16,
  },
  price: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 6,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sellerLocation: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
