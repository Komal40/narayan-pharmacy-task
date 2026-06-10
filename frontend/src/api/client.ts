import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosRequestConfig,
} from 'axios';
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;


// ─── Axios Instance ───────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s — Claude API calls can be slow
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Normalize all errors here so components always get a plain Error object
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    let message = 'An unexpected error occurred.';

    if (axios.isAxiosError(error)) {
      message =
        (error.response?.data as { detail?: string })?.detail ??
        error.message ??
        message;
    }

    return Promise.reject(new Error(message));
  }
);

// ─── Generic Dynamic Request Function ────────────────────────────────────────
/**
 * makeRequest<T>(config)
 *
 * Pass any AxiosRequestConfig — method, url, data, params.
 * Returns typed AxiosResponse<T>.
 *
 * Usage:
 *   makeRequest<User>({ method: 'GET', url: '/users/1' })
 *   makeRequest<User>({ method: 'POST', url: '/users', data: payload })
 */
export const makeRequest = <T>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return apiClient.request<T>(config);
};

export default apiClient;