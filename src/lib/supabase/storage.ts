import { createServerSupabaseClient } from "./server";
import { createBrowserSupabaseClient } from "./client";

export const STORAGE_BUCKETS = {
  CLIENT_DOCUMENTS: "client-documents",
  INVOICES: "invoices",
  CLIENT_LOGOS: "client-logos",
  SERVICE_FILES: "service-files",
  CONTRACTS: "contracts",
  AVATARS: "avatars",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export function getPublicStorageUrl(bucket: StorageBucket, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!supabaseUrl || !path) return "";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function createSignedStorageUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds: number = 3600
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      return { url: null, error: error?.message || "Failed to generate signed URL." };
    }

    return { url: data.signedUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || "Storage client error." };
  }
}

export function validateFileSize(fileSizeBytes: number, maxMb: number = 10): boolean {
  const maxBytes = maxMb * 1024 * 1024;
  return fileSizeBytes <= maxBytes;
}
