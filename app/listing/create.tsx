import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { CATEGORIES, getCategoryIcon } from '@/constants/categories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LocationChip } from '@/components/ui/LocationChip';
import { useAuthContext } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import { createProduct } from '@/services/productService';
import { isNonEmpty, validatePrice } from '@/utils/validation';
import type { ProductCondition } from '@/types/product';

const CONDITIONS: { key: ProductCondition; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'like-new', label: 'Like New' },
  { key: 'good', label: 'Good' },
  { key: 'fair', label: 'Fair' },
  { key: 'used', label: 'Used' },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const { user, isConfigured } = useAuthContext();
  const { selectedLocation } = useAppContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [condition, setCondition] = useState<ProductCondition>('new');
  const [location, setLocation] = useState(selectedLocation);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!isNonEmpty(title)) newErrors.title = 'Please enter a product title.';
    if (!isNonEmpty(description)) newErrors.description = 'Please enter a description.';
    const priceResult = validatePrice(price);
    if (!priceResult.valid) newErrors.price = 'Please enter a valid price.';
    if (!categoryId) newErrors.category = 'Please select a category.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!isConfigured) {
      setFormError('Supabase is not configured. Please set up your environment variables.');
      return;
    }

    if (!user) {
      setFormError('You must be signed in to create a listing.');
      return;
    }

    if (!validate()) return;

    setLoading(true);
    const priceResult = validatePrice(price);
    const result = await createProduct(
      {
        title: title.trim(),
        description: description.trim(),
        price: priceResult.value!,
        currency: APP_CONFIG.currency.code,
        categoryId: categoryId!,
        condition,
      }
    );
    setLoading(false);

    if (result.data) {
      Alert.alert('Success', 'Your listing has been created.', [
        { text: 'OK', onPress: () => router.replace(`/product/${result.data!.id}`) },
      ]);
    } else {
      setFormError(result.error ?? 'Failed to create listing. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Listing</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.photoUpload}>
          <Camera size={28} color={colors.textTertiary} strokeWidth={1.5} />
          <Text style={styles.photoUploadText}>Add photos</Text>
          <Text style={styles.photoUploadHint}>Up to 5 photos</Text>
        </Pressable>

        {formError && (
          <View style={styles.formErrorContainer}>
            <Text style={styles.formErrorText}>{formError}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Input
            label="Product Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. iPhone 13 Pro Max 256GB"
            error={errors.title}
          />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your product's condition, features, and any defects..."
            error={errors.description}
          />

          <Input
            label="Price (₦)"
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 450000"
            keyboardType="numeric"
            error={errors.price}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                return (
                  <Pressable
                    key={cat.id}
                    style={[styles.chip, categoryId === cat.id && styles.chipSelected]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Icon
                      size={14}
                      color={categoryId === cat.id ? colors.primary : colors.textSecondary}
                      strokeWidth={2}
                    />
                    <Text style={[styles.chipText, categoryId === cat.id && styles.chipTextSelected]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          <Text style={styles.label}>Condition</Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map((cond) => (
              <Pressable
                key={cond.key}
                style={[styles.chip, condition === cond.key && styles.chipSelected]}
                onPress={() => setCondition(cond.key)}
              >
                <Text style={[styles.chipText, condition === cond.key && styles.chipTextSelected]}>
                  {cond.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Location</Text>
          <View style={styles.chipRow}>
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
            label="Publish Listing"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  photoUpload: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  photoUploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  photoUploadHint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  formErrorContainer: {
    padding: 14,
    backgroundColor: colors.errorSoft,
    borderRadius: 10,
    marginBottom: 16,
  },
  formErrorText: {
    fontSize: 13,
    color: colors.error,
    lineHeight: 19,
  },
  form: {},
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
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
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
