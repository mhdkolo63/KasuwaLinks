import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { ShoppingBag, MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <ShoppingBag size={36} color={colors.white} strokeWidth={2.5} />
          </View>
          <Text style={styles.brandName}>KasuwaLink</Text>
          <Text style={styles.tagline}>{APP_CONFIG.tagline}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{APP_CONFIG.description}</Text>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MapPin size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Local marketplace for Kaduna & Northern Nigeria</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <ShoppingBag size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.featureText}>Browse and sell across 15+ categories</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Create Account"
            onPress={() => router.push('/(auth)/register')}
            fullWidth
            size="large"
          />
          <Button
            label="Log In"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            fullWidth
            size="large"
            style={styles.loginButton}
          />
          <Link href="/(tabs)" onPress={() => {}}>
            <Text style={styles.browseText}>Continue browsing without an account</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginTop: 32,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featureRow: {
    marginTop: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  actions: {
    marginTop: 'auto',
    paddingTop: 32,
    alignItems: 'center',
  },
  loginButton: {
    marginTop: 12,
  },
  browseText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 20,
  },
});
