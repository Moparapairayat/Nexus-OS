import { z } from "zod";
import { ActionState } from "@/types/api";

/**
 * Higher-order utility to create type-safe Next.js Server Actions with Zod validation.
 */
export function createSafeAction<TInput, TValidatedData, TResult>(
  schema: z.ZodType<TValidatedData, any, TInput>,
  handler: (validatedData: TValidatedData) => Promise<TResult>
) {
  return async (input: TInput): Promise<ActionState<TResult>> => {
    const validationResult = schema.safeParse(input);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors as Record<string, string[]>;
      return {
        success: false,
        error: "Validation failed. Please check your inputs.",
        fieldErrors,
      };
    }

    try {
      const data = await handler(validationResult.data);
      return {
        success: true,
        data,
      };
    } catch (error: unknown) {
      console.error("Server Action execution failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      return {
        success: false,
        error: errorMessage,
      };
    }
  };
}
