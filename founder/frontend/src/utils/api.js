import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('token');
  if (!token && window.__authGetToken) {
    token = await window.__authGetToken?.();
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  }
);

/** Get presigned URL for viewing an avatar. key = s3Key */
export async function getAvatarViewUrl(key) {
  if (!key) return null;
  const { data } = await api.get(`/profile/avatar-view?key=${encodeURIComponent(key)}`);
  return data?.success && data?.data?.url ? data.data.url : null;
}
