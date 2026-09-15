import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface ErrorStateProps {
  message?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  action,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <AlertCircle size={36} color={colors.error} strokeWidth={2} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 20,
  },
});
