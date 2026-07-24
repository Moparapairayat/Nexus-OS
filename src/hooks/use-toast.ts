import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast: sonnerToast,
    success: (message: string, description?: string) =>
      sonnerToast.success(message, { description }),
    error: (message: string, description?: string) =>
      sonnerToast.error(message, { description }),
    warning: (message: string, description?: string) =>
      sonnerToast.warning(message, { description }),
    info: (message: string, description?: string) =>
      sonnerToast.info(message, { description }),
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  };
}
