import axios from 'axios';

/**
 * Axios instance for Centralized Approval API calls.
 */
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getCookieDomain = (): string => {
    return window.location.hostname.includes('ceresnl.com') ? '.ceresnl.com' : window.location.hostname;
};

export const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
};

export const removeCookie = (name: string): void => {
    const domain = getCookieDomain();
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=" + domain + ";path=/";
};

// Interceptor to add auth token from cookie
api.interceptors.request.use((config) => {
    const token = getCookie('sso_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle unauthorized errors
api.interceptors.response.use(
    (response: any) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            removeCookie('sso_token');
            const ssoUrl = import.meta.env.VITE_SSO_URL || 'http://localhost:5173';
            window.location.href = `${ssoUrl}/login?redirect_url=${encodeURIComponent(window.location.origin + window.location.pathname)}`;
        }
        const errorData = error.response?.data;
        let errorMessage = errorData?.error || errorData?.detail || errorData?.message;

        if (!errorMessage && errorData && typeof errorData === 'object') {
            const vals = Object.values(errorData).flat();
            if (vals.length > 0 && typeof vals[0] === 'string') {
                errorMessage = vals.join('\n');
            }
        }

        if (!errorMessage) {
            errorMessage = error.message;
        }

        return Promise.reject(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
);

export const ssoApi = {
    getModules: async () => {
        const ssoBackendUrl = import.meta.env.VITE_SSO_BACKEND_URL || 'http://localhost:8000/api/v1';
        const response = await axios.get(`${ssoBackendUrl}/user/modules/`, {
            headers: {
                Authorization: `Bearer ${getCookie('sso_token')}`
            }
        });
        return response.data;
    }
};

export default api;
