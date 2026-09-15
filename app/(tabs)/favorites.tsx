import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart, LogIn } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/context/AuthContext';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <View style={styles.content}>
          <EmptyState
            icon={Heart}
            title="Sign in to save favorites"
            message="Log in to save products you're interested in and access them anytime."
            action={
              <View style={styles.actionRow}>
                <Button
                  label="Log In"
                  onPress={() => router.push('/(auth)/login')}
                  size="medium"
                />
                <Button
                  label="Create Account"
                  onPress={() => router.push('/(auth)/register')}
                  variant="outline"
                  size="medium"
                />
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Favorites will be loaded from Supabase once the favorites table is created */}
        <EmptyState
          icon={Heart}
          title="No saved items yet"
          message="Tap the heart icon on any product to save it here for quick access later."
        />
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
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
