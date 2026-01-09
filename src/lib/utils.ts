import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AxiosRequestConfig } from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Axios utility types and functions
export interface AxiosConfigWithSkipToast extends AxiosRequestConfig {
  skipGlobalErrorToast?: boolean;
}

// Utility function to create axios config that skips global error toast
export function createAxiosConfig(config?: AxiosRequestConfig, skipGlobalErrorToast = false): AxiosConfigWithSkipToast {
  return {
    ...config,
    skipGlobalErrorToast
  };
}

// Utility function to skip global error toast for a request
export function skipErrorToast(config?: AxiosRequestConfig): AxiosConfigWithSkipToast {
  return createAxiosConfig(config, true);
}
