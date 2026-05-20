import axios from 'axios';

function getErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred',
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default getErrorMessage;
