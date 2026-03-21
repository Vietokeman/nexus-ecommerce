import { toast, type ToastOptions } from 'react-toastify';

type ToastKind = 'success' | 'error' | 'warning' | 'info';

interface AppToastOptions {
  key?: string;
  autoClose?: number;
}

const recentKeys = new Map<string, number>();

function notify(kind: ToastKind, message: string, options?: AppToastOptions) {
  const key = options?.key;
  if (key) {
    const now = Date.now();
    const recent = recentKeys.get(key);
    if (recent && now - recent < 3000) {
      return;
    }
    recentKeys.set(key, now);
  }

  const toastOptions: ToastOptions = {
    toastId: key,
    autoClose: options?.autoClose,
  };

  toast[kind](message, toastOptions);
}

export const appToast = {
  successAction(message: string, key?: string) {
    notify('success', message, { key, autoClose: 2200 });
  },
  errorAction(message: string, detail?: string, key?: string) {
    notify('error', detail ? `${message}: ${detail}` : message, { key, autoClose: 3200 });
  },
  warning(message: string, key?: string) {
    notify('warning', message, { key, autoClose: 2600 });
  },
  info(message: string, key?: string) {
    notify('info', message, { key, autoClose: 2200 });
  },
  networkError(detail?: string, key = 'network-error') {
    notify('error', detail || 'Network error. Please try again.', { key, autoClose: 3600 });
  },
};
