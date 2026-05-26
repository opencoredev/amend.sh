type AuthCallbackError = {
  error?: {
    message?: string;
    statusText?: string;
  };
};

export function authErrorMessage(error: AuthCallbackError | undefined, fallback: string) {
  return error?.error?.message || error?.error?.statusText || fallback;
}
