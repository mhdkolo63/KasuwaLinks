import { Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { formatPrice, formatCompactPrice } from '@/utils/formatCurrency';

interface PriceLabelProps {
  price: number;
  currency?: string;
  compact?: boolean;
  style?: object;
}

export function PriceLabel({ price, currency, compact = false, style }: PriceLabelProps) {
  return (
    <Text style={[styles.price, style]} numberOfLines={1}>
      {compact ? formatCompactPrice(price) : formatPrice(price, currency)}
    </Text>
  );
}

const styles = StyleSheet.create({
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
