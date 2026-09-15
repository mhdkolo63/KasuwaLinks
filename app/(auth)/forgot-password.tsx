import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MailCheck } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/context/AuthContext';
import { isValidEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isConfigured } = useAuthContext();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setFormError(null);

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setEmailError(undefined);
    setLoading(true);

    const result = await resetPassword(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
    } else {
      setFormError(result.error ?? 'Failed to send reset email. Please try again.');
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
          <Text style={styles.title}>Forgot password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </View>

        {sent ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <MailCheck size={40} color={colors.success} strokeWidth={2} />
            </View>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successMessage}>
              If an account exists for {email}, you'll receive a password reset link shortly.
            </Text>
            <Button
              label="Back to Login"
              onPress={() => router.push('/(auth)/login')}
              variant="outline"
              fullWidth
              style={{ marginTop: 24 }}
            />
          </View>
        ) : (
          <>
            {!isConfigured && (
              <View style={styles.configWarning}>
                <Text style={styles.configWarningText}>
                  Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file to enable password reset.
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
                error={emailError}
              />
              <Button
                label="Send Reset Link"
                onPress={handleReset}
                loading={loading}
                fullWidth
                size="large"
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Log in</Text>
              </Pressable>
            </View>
          </>
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
    marginTop: 24,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  successMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
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
