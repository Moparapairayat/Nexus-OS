/**
 * Supabase Environment Variables Guard & Validator
 * Strictly checks for required Supabase configuration parameters.
 */

export interface SupabaseEnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  serviceRoleKey?: string;
  isConfigured: boolean;
  errors: string[];
}

export function validateSupabaseEnv(): SupabaseEnvConfig {
  const errors: string[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl) {
    errors.push("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  } else if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.");
  }

  if (!supabaseAnonKey) {
    errors.push("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  }

  if (!serviceRoleKey && typeof window === "undefined") {
    // Warning for server side
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    serviceRoleKey,
    isConfigured: errors.length === 0,
    errors,
  };
}

export const supabaseEnv = validateSupabaseEnv();
