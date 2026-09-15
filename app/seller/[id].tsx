import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BadgeCheck, MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/product/ProductCard';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { getSellerById } from '@/services/sellerService';
import { getProductsBySeller } from '@/services/productService';
import { formatDate } from '@/utils/formatDate';
import { useAuthContext } from '@/context/AuthContext';
import { PackageOpen } from 'lucide-react-native';
import type { ProductListItem } from '@/types/product';
import type { Seller } from '@/types/seller';

export default function SellerProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthContext();

  const { data: seller, error: sellerError, isLoading: sellerLoading } = useSupabaseQuery<Seller | null>(
    () => getSellerById(id),
    [id]
  );

  const { data: products, isLoading: productsLoading } = useSupabaseQuery<ProductListItem[]>(
    () => getProductsBySeller(id, 0, 20),
    [id]
  );

  if (sellerLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState message="Loading seller profile..." fullScreen />
      </SafeAreaView>
    );
  }

  if (sellerError || !seller) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
          </Pressable>
        </View>
        <ErrorState
          message={sellerError ?? 'Seller not found.'}
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
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {seller.storeName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.storeName}>{seller.storeName}</Text>
              {seller.isVerified && <BadgeCheck size={20} color={colors.primary} strokeWidth={2} />}
            </View>
            <Text style={styles.fullName}>{seller.fullName}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textSecondary} strokeWidth={2} />
              <Text style={styles.location}>{seller.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{products?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seller.isVerified ? 'Yes' : 'No'}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seller.isSeller ? 'Yes' : 'No'}</Text>
            <Text style={styles.statLabel}>Seller</Text>
          </View>
        </View>

        {seller.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{seller.bio}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Member since</Text>
          <Text style={styles.joinedDate}>{formatDate(seller.joinedAt)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listings ({products?.length ?? 0})</Text>
          {productsLoading ? (
            <LoadingState message="Loading listings..." />
          ) : products && products.length > 0 ? (
            <View style={styles.grid}>
              {products.map((product) => (
                <View key={product.id} style={styles.gridItem}>
                  <ProductCard
                    product={product}
                    onPress={(productId) =>
                      router.push({ pathname: '/product/[id]', params: { id: productId } })
                    }
                  />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={PackageOpen}
              title="No active listings"
              message="This seller currently has no products listed."
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label={isAuthenticated ? 'Contact Seller' : 'Sign in to contact'}
          onPress={() => {
            if (!isAuthenticated) router.push('/(auth)/login');
          }}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  fullName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  location: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  joinedDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: 160,
    maxWidth: '48%',
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
