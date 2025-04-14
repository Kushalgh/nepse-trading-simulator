"use client";

import { toast as sonnerToast } from "sonner";

type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "default"
  | "destructive";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
}

export function useToast() {
  const toast = ({
    title,
    description,
    variant = "default",
    duration,
  }: ToastOptions) => {
    switch (variant) {
      case "success":
        return sonnerToast.success(title, {
          description,
          duration,
        });
      case "error":
        return sonnerToast.error(title, {
          description,
          duration,
        });
      case "warning":
        return sonnerToast.warning(title, {
          description,
          duration,
        });
      case "info":
        return sonnerToast.info(title, {
          description,
          duration,
        });
      default:
        return sonnerToast(title, {
          description,
          duration,
        });
    }
  };

  return { toast };
}
