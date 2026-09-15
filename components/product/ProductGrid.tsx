import { FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { ProductCard } from './ProductCard';
import type { ProductListItem } from '@/types/product';

interface ProductGridProps {
  products: ProductListItem[];
  onProductPress: (id: string) => void;
  numColumns?: number;
  contentContainerStyle?: object;
}

export function ProductGrid({
  products,
  onProductPress,
  numColumns = 2,
  contentContainerStyle,
}: ProductGridProps) {
  const renderItem: ListRenderItem<ProductListItem> = ({ item }) => (
    <ProductCard product={item} onPress={onProductPress} />
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
    marginBottom: 12,
  },
  content: {
    paddingHorizontal: 16,
  },
});
