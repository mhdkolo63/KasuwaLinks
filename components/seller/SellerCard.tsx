import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import { MapPin, BadgeCheck, Star } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import type { Seller } from '@/types/seller';

interface SellerCardProps {
  seller: Seller;
  onPress?: (id: string) => void;
  listingCount?: number;
}

export function SellerCard({ seller, onPress, listingCount }: SellerCardProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {seller.avatarUrl ? (
          <Image source={{ uri: seller.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {seller.storeName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{seller.storeName}</Text>
          {seller.verified && (
            <BadgeCheck size={16} color={colors.primary} strokeWidth={2} />
          )}
        </View>
        <View style={styles.metaRow}>
          <MapPin size={12} color={colors.textTertiary} strokeWidth={2} />
          <Text style={styles.location} numberOfLines={1}>{seller.location}</Text>
        </View>
        <View style={styles.statsRow}>
          {seller.rating > 0 && (
            <View style={styles.ratingRow}>
              <Star size={12} color={colors.accent} strokeWidth={2} fill={colors.accent} />
              <Text style={styles.stat}>{seller.rating.toFixed(1)}</Text>
            </View>
          )}
          {listingCount !== undefined && (
            <Text style={styles.stat}>{listingCount} listings</Text>
          )}
        </View>
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={() => onPress(seller.id)} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  avatarContainer: {},
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  stat: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
