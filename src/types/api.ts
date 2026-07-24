export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  metadata?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    timestamp: string;
  };
}

export type ActionState<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
