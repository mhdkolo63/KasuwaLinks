import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { CATEGORIES, getCategoryIcon } from '@/constants/categories';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PackageOpen } from 'lucide-react-native';
import { ProductCard } from '@/components/product/ProductCard';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { getProducts } from '@/services/productService';
import type { ProductListItem, ProductCondition } from '@/types/product';

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'price-low', label: 'Price: Low to High' },
  { key: 'price-high', label: 'Price: High to Low' },
  { key: 'popular', label: 'Most Popular' },
] as const;

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; search?: string }>();

  const [search, setSearch] = useState(params.search ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(params.categoryId);
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition | undefined>();
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]['key']>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = useSupabaseQuery<ProductListItem[]>(
    () => getProducts({
      search: search.trim() || undefined,
      categoryId: selectedCategory,
      condition: selectedCondition,
      sortBy,
    }),
    [search, selectedCategory, selectedCondition, sortBy]
  );

  const handleProductPress = useCallback(
    (id: string) => router.push({ pathname: '/product/[id]', params: { id } }),
    [router]
  );

  const hasActiveFilters = Boolean(selectedCategory || selectedCondition);

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedCondition(undefined);
    setSearch('');
    setSortBy('newest');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          onClear={() => setSearch('')}
          style={styles.searchBar}
        />
        <Pressable
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal size={18} color={showFilters ? colors.white : colors.text} strokeWidth={2} />
          <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>
            Filters
          </Text>
        </Pressable>
      </View>

      {showFilters && (
        <ScrollView style={styles.filtersPanel} showsVerticalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <Pressable
                  style={[styles.chip, !selectedCategory && styles.chipSelected]}
                  onPress={() => setSelectedCategory(undefined)}
                >
                  <Text style={[styles.chipText, !selectedCategory && styles.chipTextSelected]}>All</Text>
                </Pressable>
                {CATEGORIES.map((cat) => {
                  const Icon = getCategoryIcon(cat.icon);
                  return (
                    <Pressable
                      key={cat.id}
                      style={[styles.chip, selectedCategory === cat.id && styles.chipSelected]}
                      onPress={() =>
                        setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)
                      }
                    >
                      <Icon size={14} color={selectedCategory === cat.id ? colors.primary : colors.textSecondary} strokeWidth={2} />
                      <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextSelected]}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Condition</Text>
            <View style={styles.chipRow}>
              {(['new', 'like-new', 'good', 'fair', 'used'] as ProductCondition[]).map((cond) => (
                <Pressable
                  key={cond}
                  style={[styles.chip, selectedCondition === cond && styles.chipSelected]}
                  onPress={() => setSelectedCondition(selectedCondition === cond ? undefined : cond)}
                >
                  <Text style={[styles.chipText, selectedCondition === cond && styles.chipTextSelected]}>
                    {cond.replace('-', ' ')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.chipRow}>
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  style={[styles.chip, sortBy === option.key && styles.chipSelected]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text style={[styles.chipText, sortBy === option.key && styles.chipTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {hasActiveFilters && (
            <Pressable onPress={clearFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear all filters</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingState message="Searching products..." />
        ) : products && products.length > 0 ? (
          <View style={styles.grid}>
            {products.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard product={product} onPress={handleProductPress} />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon={PackageOpen}
            title="No products found"
            message={
              hasActiveFilters
                ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                : 'Products will appear here once sellers start listing items on KasuwaLink.'
            }
            action={
              hasActiveFilters ? (
                <Pressable onPress={clearFilters} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear filters</Text>
                </Pressable>
              ) : undefined
            }
          />
        )}
      </ScrollView>
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
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  searchBar: {
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  filtersPanel: {
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  results: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
    flexGrow: 1,
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
});
