import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, ChevronDown, PackageOpen } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { CATEGORIES, getCategoryIcon } from '@/constants/categories';
import { useAuthContext } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProductCard } from '@/components/product/ProductCard';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { getRecentProducts, getFeaturedProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import type { ProductListItem } from '@/types/product';
import type { Category } from '@/types/product';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { selectedLocation, setSelectedLocation, locations } = useAppContext();
  const [search, setSearch] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const { data: dbCategories } = useSupabaseQuery<Category[]>(
    () => getCategories(),
    []
  );

  const { data: recentProducts, isLoading: recentLoading } = useSupabaseQuery<ProductListItem[]>(
    () => getRecentProducts(8),
    []
  );

  const { data: featuredProducts, isLoading: featuredLoading } = useSupabaseQuery<ProductListItem[]>(
    () => getFeaturedProducts(6),
    []
  );

  const categories = dbCategories && dbCategories.length > 0
    ? dbCategories
    : CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.id,
        icon: c.icon,
        description: c.description,
        isActive: true,
        sortOrder: 0,
      }));

  const greeting = user ? `Hello, ${user.user_metadata?.full_name?.split(' ')[0] ?? 'there'}` : 'Welcome to KasuwaLink';

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      router.push({ pathname: '/(tabs)/explore', params: { categoryId } });
    },
    [router]
  );

  const handleProductPress = useCallback(
    (id: string) => {
      router.push({ pathname: '/product/[id]', params: { id } });
    },
    [router]
  );

  const handleSearchSubmit = useCallback(() => {
    if (search.trim()) {
      router.push({ pathname: '/(tabs)/explore', params: { search: search.trim() } });
    }
  }, [search, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Pressable
            style={styles.locationSelector}
            onPress={() => setShowLocationPicker((v) => !v)}
          >
            <MapPin size={16} color={colors.primary} strokeWidth={2} />
            <Text style={styles.locationText}>{selectedLocation}, Nigeria</Text>
            <ChevronDown size={16} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </View>

        {showLocationPicker && (
          <View style={styles.locationPicker}>
            {locations.map((loc) => (
              <Pressable
                key={loc}
                style={[
                  styles.locationOption,
                  selectedLocation === loc && styles.locationOptionSelected,
                ]}
                onPress={() => {
                  setSelectedLocation(loc);
                  setShowLocationPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.locationOptionText,
                    selectedLocation === loc && styles.locationOptionTextSelected,
                  ]}
                >
                  {loc}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.content}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search for products..."
            onClear={() => setSearch('')}
            onSubmit={handleSearchSubmit}
            style={styles.searchBar}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.icon);
                return (
                  <CategoryCard
                    key={category.id}
                    name={category.name}
                    icon={Icon}
                    onPress={() => handleCategoryPress(category.id)}
                  />
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Featured"
              actionLabel="View all"
              onActionPress={() => router.push('/(tabs)/explore')}
            />
            {featuredLoading ? (
              <LoadingState message="Loading featured products..." />
            ) : featuredProducts && featuredProducts.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productRow}
              >
                {featuredProducts.map((product) => (
                  <View key={product.id} style={styles.featuredItem}>
                    <ProductCard product={product} onPress={handleProductPress} />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderTitle}>No featured products yet</Text>
                <Text style={styles.placeholderText}>
                  Featured products will appear here once sellers start listing items.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Recent Listings"
              actionLabel="View all"
              onActionPress={() => router.push('/(tabs)/explore')}
            />
            {recentLoading ? (
              <LoadingState message="Loading recent listings..." />
            ) : recentProducts && recentProducts.length > 0 ? (
              <View style={styles.productGrid}>
                {recentProducts.map((product) => (
                  <View key={product.id} style={styles.gridItem}>
                    <ProductCard product={product} onPress={handleProductPress} />
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState
                icon={PackageOpen}
                title="No listings yet"
                message="Be the first to list a product on KasuwaLink. Products will appear here once sellers start posting."
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  locationPicker: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  locationOptionSelected: {
    backgroundColor: colors.primarySoft,
  },
  locationOptionText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  locationOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  searchBar: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  categoryRow: {
    gap: 12,
    paddingRight: 16,
  },
  productRow: {
    gap: 12,
    paddingRight: 16,
  },
  featuredItem: {
    width: 160,
  },
  placeholderCard: {
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  placeholderText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: 160,
    maxWidth: '48%',
  },
});
