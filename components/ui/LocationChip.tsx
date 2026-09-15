import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface LocationChipProps {
  location: string;
  onPress?: () => void;
  selected?: boolean;
}

export function LocationChip({ location, onPress, selected = false }: LocationChipProps) {
  if (!onPress) {
    return (
      <View style={[styles.container, selected && styles.selected]}>
        <MapPin size={14} color={selected ? colors.primary : colors.textSecondary} strokeWidth={2} />
        <Text style={[styles.text, selected && styles.selectedText]}>{location}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <MapPin size={14} color={selected ? colors.primary : colors.textSecondary} strokeWidth={2} />
      <Text style={[styles.text, selected && styles.selectedText]}>{location}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedText: {
    color: colors.primary,
  },
});
