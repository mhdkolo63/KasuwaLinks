import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, PackageOpen } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuthContext } from '@/context/AuthContext';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { getUserListings } from '@/services/productService';
import type { ProductListItem } from '@/types/product';

export default function EditListingsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();

  const { data: products, isLoading } = useSupabaseQuery<ProductListItem[]>(
    () => getUserListings(0, 50),
    [user?.id]
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>My Listings</Text>
        </View>
        <EmptyState
          icon={PackageOpen}
          title="Sign in required"
          message="Please log in to view and manage your listings."
          action={
            <Button label="Log In" onPress={() => router.push('/(auth)/login')} />
          }
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
        <Text style={styles.headerTitle}>My Listings</Text>
        <Pressable onPress={() => router.push('/listing/create')} hitSlop={8}>
          <Plus size={24} color={colors.primary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingState message="Loading your listings..." />
        ) : products && products.length > 0 ? (
          <Text style={styles.comingSoon}>
            You have {products.length} listing(s). Full listing management is coming soon.
          </Text>
        ) : (
          <EmptyState
            icon={PackageOpen}
            title="No listings yet"
            message="Start selling by creating your first listing on KasuwaLink."
            action={
              <Button
                label="Create Listing"
                onPress={() => router.push('/listing/create')}
              />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  comingSoon: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
