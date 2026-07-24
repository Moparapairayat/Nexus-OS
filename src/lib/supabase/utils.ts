export interface SupabaseParsedError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export function parseSupabaseError(error: any): SupabaseParsedError {
  if (!error) {
    return { message: "Unknown error occurred." };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return {
    message: error.message || error.error_description || "Database operation failed.",
    code: error.code,
    details: error.details,
    hint: error.hint,
  };
}

export function formatPgTimestamp(date?: Date | string | null): string {
  if (!date) return new Date().toISOString();
  if (typeof date === "string") return new Date(date).toISOString();
  return date.toISOString();
}

export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: SupabaseParsedError | null }> {
  try {
    const { data, error } = await queryFn();
    if (error) {
      return { data: null, error: parseSupabaseError(error) };
    }
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: parseSupabaseError(err) };
  }
}
