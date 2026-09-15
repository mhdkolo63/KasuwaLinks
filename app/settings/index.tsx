import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Bell, Globe, Lock, Info, FileText } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';

export default function SettingsScreen() {
  const router = useRouter();

  const sections: {
    title: string;
    items: { icon: typeof Bell; label: string; value?: string }[];
  }[] = [
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: 'On' },
        { icon: Globe, label: 'Language', value: 'English' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: Lock, label: 'Privacy & Security' },
        { icon: FileText, label: 'Terms of Service' },
        { icon: Info, label: 'About KasuwaLink' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.item,
                      index === section.items.length - 1 && styles.itemLast,
                      pressed && styles.itemPressed,
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View style={styles.itemIcon}>
                        <Icon size={20} color={colors.primary} strokeWidth={2} />
                      </View>
                      <Text style={styles.itemLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.itemRight}>
                      {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                      <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>{APP_CONFIG.appName}</Text>
          <Text style={styles.aboutVersion}>Version {APP_CONFIG.version}</Text>
          <Text style={styles.aboutLocation}>
            {APP_CONFIG.initialLocation.city}, {APP_CONFIG.initialLocation.country}
          </Text>
          <Text style={styles.aboutContact}>{APP_CONFIG.contactEmail}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemPressed: {
    backgroundColor: colors.background,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemValue: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  aboutSection: {
    alignItems: 'center',
    marginTop: 16,
    padding: 20,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  aboutVersion: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },
  aboutLocation: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },
  aboutContact: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
  },
});
