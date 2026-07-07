import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://hostel-final-bq3a.onrender.com/api/v1",
   

  withCredentials: true,
  headers: {
    // Bypass ngrok warning page
    'ngrok-skip-browser-warning': 'true'
  }
});

// ── REQUEST: inject access token ──────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE: token refresh with queued-request support ──────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    const store = useAuthStore.getState();

      // If there's no access token stored, this request is likely an unauthenticated
      // endpoint (e.g. /auth/login). Don't attempt refresh flow — just reject so
      // callers (like the login page) can handle the 401 without a full-page reload.
      if (!store.accessToken) {
        return Promise.reject(error);
      }

    const isRefreshEndpoint = original?.url?.includes("/auth/refresh");
    const isLogoutEndpoint = original?.url?.includes("/auth/logout");

    if (
      error.response?.status === 401 &&
      !original?._retry &&
      !isRefreshEndpoint &&
      !isLogoutEndpoint
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (original?.headers) original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original!));
            },
            reject,
          });
        });
      }

      original!._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<{
          user_id: string;
          access_token: string;
          token_type: string;
          role: string;
          hostel_ids: string[];
          expires_in: number;
        }>(
          `${import.meta.env.VITE_API_BASE_URL ?? "https://hostel-final-bq3a.onrender.com/api/v1"}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.access_token;
        store.setUser(res.data.user_id, res.data.role, newToken, res.data.hostel_ids);
        processQueue(null, newToken);

        if (original?.headers) original.headers.Authorization = `Bearer ${newToken}`;
        return api(original!);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.clearUser();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
