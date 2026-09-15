import { Pressable, ActivityIndicator, Text, View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

interface VariantStyle {
  container: ViewStyle;
  text: string;
}

const variantStyles: Record<ButtonVariant, VariantStyle> = {
  primary: { container: { backgroundColor: colors.primary }, text: colors.white },
  secondary: { container: { backgroundColor: colors.accent }, text: colors.text },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    text: colors.primary,
  },
  ghost: { container: { backgroundColor: 'transparent' }, text: colors.primary },
  danger: { container: { backgroundColor: colors.error }, text: colors.white },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const vStyle = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        vStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text} size="small" />
      ) : (
        <Text style={[styles.label, { color: vStyle.text }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

const sizeStyles = StyleSheet.create({
  small: {
    height: 36,
    paddingHorizontal: 12,
  },
  medium: {
    height: 46,
    paddingHorizontal: 16,
  },
  large: {
    height: 52,
    paddingHorizontal: 20,
  },
});
