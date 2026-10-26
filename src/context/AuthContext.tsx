import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { getCookie, removeCookie } from '../services/api';

export interface User {
    id: number | string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    name: string;
    role_name: string;
    role_code: string;
    role_level?: number | string;
    department: string;
    department_id?: number | null;
    company?: string;
    image?: string;
    is_approver?: boolean;
    is_superuser?: boolean;
    is_staff?: boolean;
    title?: string;
    role?: number;
    is_active?: boolean;
    modules?: string[];
}

export interface SSOModule {
    code: string;
    name: string;
    redirect_url: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const ssoUrl = import.meta.env.VITE_SSO_URL || 'http://localhost:5173';

    const redirectToSSO = () => {
        const currentUrl = window.location.origin + window.location.pathname;
        window.location.href = `${ssoUrl}/login?redirect_url=${encodeURIComponent(currentUrl)}`;
    };

    const performLogout = () => {
        removeCookie('sso_token');
        removeCookie('sso_user');
        const currentUrl = window.location.origin + window.location.pathname;
        window.location.href = `${ssoUrl}/logout?redirect_url=${encodeURIComponent(currentUrl)}`;
    };

    useEffect(() => {
        const initAuth = async () => {
            // Check URL for token (redirected from SSO)
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get('token');

            if (tokenFromUrl) {
                // In shared cookie setups or direct token delivery, clean URL query
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            const token = getCookie('sso_token');

            if (token) {
                try {
                    // Decode JWT payload (base64)
                    const payloadBase64 = token.split('.')[1];
                    const payload = JSON.parse(atob(payloadBase64));

                    // Check expiration
                    const currentTime = Math.floor(Date.now() / 1000);
                    if (payload.exp && payload.exp < currentTime) {
                        throw new Error('Token expired');
                    }

                    // Check approval module access (as requested)
                    if (!payload.module_access || (!payload.module_access['approval'] && !payload.module_access['APPROVAL'])) {
                        throw new Error('Unauthorized: No approval module access');
                    }

                    // Extract user info from token
                    const nameParts = (payload.name || '').split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    const approvalRole = payload.module_roles?.['APPROVAL'] || payload.module_roles?.['approval'];
                    const isApprover = !!approvalRole && approvalRole.toLowerCase() !== 'viewer';

                    const moduleAccess = payload.module_access || {};
                    const modules = Object.keys(moduleAccess).filter((key) => moduleAccess[key] === 'EQ');

                    // Fetch user details from Centralized Approval backend
                    let dbUser: any = null;
                    try {
                        const meRes: any = await api.get('/auth/me');
                        dbUser = meRes?.data || meRes;
                    } catch (err) {
                        console.warn('Could not fetch user details from Centralized Approval /auth/me:', err);
                    }

                    setUser({
                        id: dbUser?.id || payload.user_id,
                        username: dbUser?.username || payload.email,
                        email: payload.email,
                        first_name: dbUser?.first_name || firstName,
                        last_name: dbUser?.last_name || lastName,
                        name: payload.name || dbUser?.first_name || '',
                        role_name: dbUser?.role_name || approvalRole || 'User',
                        role_code: dbUser?.role_code || approvalRole || 'USER',
                        role_level: payload.role,
                        department: dbUser?.department || payload.department || 'Commercial & Operations',
                        department_id: dbUser?.department_id || null,
                        company: dbUser?.company || payload.company || 'PT Nirwana Lestari',
                        image: payload.image,
                        is_approver: dbUser?.is_approver ?? isApprover,
                        is_superuser: dbUser?.is_superuser || false,
                        is_staff: dbUser?.is_staff || false,
                        title: payload.title,
                        role: dbUser?.role || 1,
                        is_active: true,
                        modules: modules
                    });
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('SSO Authentication Error:', error);
                    removeCookie('sso_token');
                    redirectToSSO();
                }
            } else {
                redirectToSSO();
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Listen for logout from other tabs via BroadcastChannel (same-origin)
    useEffect(() => {
        const logoutChannel = new BroadcastChannel('logout_channel_approval');

        logoutChannel.onmessage = (event) => {
            if (event.data === 'logout') {
                performLogout();
            }
        };

        return () => logoutChannel.close();
    }, []);

    // Poll cookie for global logout
    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = setInterval(() => {
            const token = getCookie('sso_token');
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                redirectToSSO();
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const login = () => {
        redirectToSSO();
    };

    const logout = () => {
        const logoutChannel = new BroadcastChannel('logout_channel_approval');
        logoutChannel.postMessage('logout');
        logoutChannel.close();

        performLogout();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
