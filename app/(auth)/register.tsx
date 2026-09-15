import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationChip } from '@/components/ui/LocationChip';
import { useAuthContext } from '@/context/AuthContext';
import { validateSignUp, isNonEmpty } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isConfigured } = useAuthContext();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState<string>(APP_CONFIG.initialLocation.city);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorFields, setErrorFields] = useState<{ fullName?: string; email?: string; password?: string; phone?: string }>({});

  const handleRegister = async () => {
    setFormError(null);
    const validationErrors = validateSignUp(fullName, email, password);
    if (validationErrors.length > 0) {
      const fieldErrors: { fullName?: string; email?: string; password?: string } = {};
      validationErrors.forEach((e) => {
        if (e.field === 'fullName') fieldErrors.fullName = e.message;
        if (e.field === 'email') fieldErrors.email = e.message;
        if (e.field === 'password') fieldErrors.password = e.message;
      });
      setErrorFields(fieldErrors);
      return;
    }

    if (!isNonEmpty(phone)) {
      setErrorFields((prev) => ({ ...prev, phone: 'Please enter your phone number.' }));
      return;
    }
    setErrorFields((prev) => ({ ...prev, phone: undefined }));

    setErrorFields({});
    setLoading(true);

    const result = await signUp({
      email,
      password,
      fullName,
      phone,
      location,
    });
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setFormError(result.error ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join KasuwaLink and start buying and selling locally</Text>
        </View>

        {!isConfigured && (
          <View style={styles.configWarning}>
            <Text style={styles.configWarningText}>
              Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file to enable authentication.
            </Text>
          </View>
        )}

        {formError && (
          <View style={styles.formErrorContainer}>
            <Text style={styles.formErrorText}>{formError}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            autoCapitalize="words"
            error={errorFields.fullName}
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errorFields.email}
          />
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+234 801 234 5678"
            keyboardType="phone-pad"
            error={errorFields.phone}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            error={errorFields.password}
          />

          <Text style={styles.label}>Your Location</Text>
          <View style={styles.locationRow}>
            {APP_CONFIG.locations.map((loc) => (
              <LocationChip
                key={loc}
                location={loc}
                selected={location === loc}
                onPress={() => setLocation(loc)}
              />
            ))}
          </View>

          <View style={{ height: 24 }} />

          <Button
            label="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="large"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Log in</Text>
          </Pressable>
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
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginLeft: -8,
  },
  header: {
    marginTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  configWarning: {
    marginTop: 20,
    padding: 14,
    backgroundColor: colors.warningSoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  configWarningText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
  formErrorContainer: {
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.errorSoft,
    borderRadius: 10,
  },
  formErrorText: {
    fontSize: 13,
    color: colors.error,
    lineHeight: 19,
  },
  form: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
