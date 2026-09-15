import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Tag, ShieldCheck, Users, TrendingUp, ChevronRight, Camera } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/context/AuthContext';

export default function SellScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    router.push('/listing/create');
  };

  const benefits = [
    {
      icon: Users,
      title: 'Reach local buyers',
      description: 'Connect with thousands of buyers across Kaduna and Northern Nigeria.',
    },
    {
      icon: Tag,
      title: 'Free listings',
      description: 'Post your items for free with no hidden charges or commission fees.',
    },
    {
      icon: ShieldCheck,
      title: 'Safe and trusted',
      description: 'Trade with confidence through verified profiles and community trust.',
    },
    {
      icon: TrendingUp,
      title: 'Sell faster',
      description: 'Get your products seen by the right buyers with smart categories.',
    },
  ];

  const requirements = [
    'At least one clear product photo',
    'A descriptive title and honest description',
    'A fair and competitive price',
    'Your correct location for pickup/delivery',
    'Accurate product condition',
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Tag size={36} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>Sell on KasuwaLink</Text>
          <Text style={styles.heroDescription}>
            Turn your items into cash. List your products in minutes and reach buyers across Kaduna and Northern Nigeria.
          </Text>
          <Button
            label="Create Listing"
            onPress={handleCreateListing}
            size="large"
            style={styles.ctaButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How selling works</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Create your listing</Text>
                <Text style={styles.stepDescription}>
                  Add photos, write a description, and set your price.
                </Text>
              </View>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get contacted by buyers</Text>
                <Text style={styles.stepDescription}>
                  Interested buyers will reach out to negotiate and arrange pickup.
                </Text>
              </View>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Meet and sell</Text>
                <Text style={styles.stepDescription}>
                  Meet in a safe public location, exchange your item, and get paid.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller benefits</Text>
          <View style={styles.benefitsList}>
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Icon size={22} color={colors.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDescription}>{benefit.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Before you list</Text>
          <View style={styles.requirementsCard}>
            {requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <View style={styles.requirementBullet} />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        {isAuthenticated && (
          <Pressable
            style={styles.myListingsButton}
            onPress={() => router.push('/listing/edit')}
          >
            <Text style={styles.myListingsText}>My Listings</Text>
            <ChevronRight size={20} color={colors.primary} strokeWidth={2} />
          </Pressable>
        )}
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
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  ctaButton: {
    marginTop: 20,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  steps: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    gap: 14,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  stepDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 19,
  },
  benefitsList: {
    gap: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  benefitDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 19,
  },
  requirementsCard: {
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  requirementBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  myListingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  myListingsText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
