import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/context/AuthContext';
import { validateSignIn } from '@/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isConfigured } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setFormError(null);
    const validationErrors = validateSignIn(email, password);
    if (validationErrors.length > 0) {
      const fieldErrors: { email?: string; password?: string } = {};
      validationErrors.forEach((e) => {
        if (e.field === 'email') fieldErrors.email = e.message;
        if (e.field === 'password') fieldErrors.password = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await signIn({ email, password });
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setFormError(result.error ?? 'Login failed. Please try again.');
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to your KasuwaLink account</Text>
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
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
          />

          <View style={styles.forgotRow}>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </Link>
          </View>

          <Button
            label="Log In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="large"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Create one</Text>
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
    marginTop: 24,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
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
