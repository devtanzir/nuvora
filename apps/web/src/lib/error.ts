function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as Record<string, unknown>).response === 'object' &&
    (error as Record<string, unknown>).response !== null
  ) {
    const response = (error as Record<string, unknown>).response as Record<string, unknown>;

    if (
      typeof response.data === 'object' &&
      response.data !== null &&
      'message' in response.data
    ) {
      const data = response.data as { message?: unknown };

      if (typeof data.message === 'string') {
        return data.message;
      }
    }
  }

  return fallback;
}

export default getErrorMessage;
