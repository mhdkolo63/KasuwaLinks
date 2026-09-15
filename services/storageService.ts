import { supabase, isSupabaseConfigured } from './supabase';
import { STORAGE_BUCKETS } from '@/constants/config';

// =============================================================================
// PRODUCT IMAGE STORAGE SERVICE
//
// Provides typed helpers for uploading and deleting product images in the
// Supabase Storage bucket named "product-images". Only image URLs and storage
// paths are stored in PostgreSQL — no base64 or binary data.
// =============================================================================

export interface UploadResult {
  path: string;
  publicUrl: string;
  error: string | null;
}

export interface StorageError {
  error: string;
}

// =============================================================================
// UPLOAD PRODUCT IMAGE
// =============================================================================

export async function uploadProductImage(
  productId: string,
  fileUri: string,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  if (!isSupabaseConfigured) {
    return { path: '', publicUrl: '', error: 'Supabase is not configured.' };
  }

  try {
    const filePath = `${productId}/${fileName}`;

    const { error: uploadError } = await supabase!
      .storage
      .from(STORAGE_BUCKETS.productImages)
      .upload(filePath, {
        uri: fileUri,
        type: contentType,
        name: fileName,
      } as unknown as File);

    if (uploadError) {
      return { path: '', publicUrl: '', error: uploadError.message };
    }

    const { data: urlData } = supabase!
      .storage
      .from(STORAGE_BUCKETS.productImages)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: urlData.publicUrl,
      error: null,
    };
  } catch (err) {
    return {
      path: '',
      publicUrl: '',
      error: err instanceof Error ? err.message : 'Failed to upload image.',
    };
  }
}

// =============================================================================
// DELETE PRODUCT IMAGE
// =============================================================================

export async function deleteProductImage(storagePath: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured.' };

  try {
    const { error } = await supabase!
      .storage
      .from(STORAGE_BUCKETS.productImages)
      .remove([storagePath]);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete image.',
    };
  }
}

// =============================================================================
// GET PUBLIC URL FOR A STORAGE PATH
// =============================================================================

export function getProductImagePublicUrl(storagePath: string): string {
  if (!isSupabaseConfigured) return '';

  const { data } = supabase!
    .storage
    .from(STORAGE_BUCKETS.productImages)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
