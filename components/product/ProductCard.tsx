import { memo } from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { formatPrice } from '@/utils/formatCurrency';
import { formatRelativeTime } from '@/utils/formatDate';
import { getCategoryById } from '@/constants/categories';
import type { ProductListItem } from '@/types/product';

interface ProductCardProps {
  product: ProductListItem;
  onPress: (id: string) => void;
  compact?: boolean;
}

function ProductCardComponent({ product, onPress, compact = false }: ProductCardProps) {
  const category = getCategoryById(product.categoryId);

  return (
    <Pressable
      onPress={() => onPress(product.id)}
      style={({ pressed }) => [styles.container, compact && styles.compact, pressed && styles.pressed]}
    >
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {category?.name.charAt(0) ?? 'K'}
            </Text>
          </View>
        )}
        {product.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(product.price, product.currency)}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.locationRow}>
            <MapPin size={11} color={colors.textTertiary} strokeWidth={2} />
            <Text style={styles.location} numberOfLines={1}>{product.location}</Text>
          </View>
          <Text style={styles.time}>{formatRelativeTime(product.createdAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  compact: {
    maxWidth: 160,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  info: {
    padding: 10,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  title: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  location: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  time: {
    fontSize: 11,
    color: colors.textTertiary,
  },
});
