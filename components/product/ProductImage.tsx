import { View, Image, StyleSheet } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface ProductImageProps {
  uri?: string;
  size?: number;
  borderRadius?: number;
}

export function ProductImage({ uri, size = 120, borderRadius = 10 }: ProductImageProps) {
  if (!uri) {
    return (
      <View
        style={[
          styles.placeholder,
          { width: size, height: size, borderRadius },
        ]}
      >
        <ImageIcon size={size * 0.3} color={colors.textTertiary} strokeWidth={1.5} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius }}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
