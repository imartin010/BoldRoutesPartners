interface RequestOptions extends RequestInit {
  timeout?: number;
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public type: 'timeout' | 'offline' | 'server' | 'unknown' = 'unknown'
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export async function fetchWithTimeout(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  // Check if online
  if (!navigator.onLine) {
    throw new NetworkError('No internet connection', 'offline');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new NetworkError(
        `HTTP error! status: ${response.status}`,
        response.status >= 500 ? 'server' : 'unknown'
      );
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout!, Please try again', 'timeout');
      }
      
      if (error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed', 'offline');
      }
    }

    throw error;
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  try {
    const response = await fetchWithTimeout(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError('An unexpected error occurred', 'unknown');
  }
}

export function handleNetworkError(
  error: Error,
  showTimeoutModal: (message?: string) => void,
  showErrorModal: (message?: string) => void
) {
  if (error instanceof NetworkError) {
    switch (error.type) {
      case 'timeout':
        showTimeoutModal(error.message);
        break;
      case 'offline':
        // Offline modal will be shown automatically by NetworkProvider
        break;
      case 'server':
        showErrorModal('Server error. Please try again later.');
        break;
      default:
        showErrorModal(error.message);
        break;
    }
  } else {
    showErrorModal('An unexpected error occurred');
  }
}
