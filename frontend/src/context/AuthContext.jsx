import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const bootstrap = async () => {
            if (!token) return setLoading(false);
            try {
                api.defaults.headers.common.Authorization = `Bearer ${token}`;
                const { data } = await api.get('/auth/me');
                setUser(data.data);
            } catch (err) {
                setToken(null);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        bootstrap();
    }, [token]);

    const login = async (payload) => {
        const { data } = await api.post('/auth/login', payload);
        const t = data.data.token;
        localStorage.setItem('token', t);
        api.defaults.headers.common.Authorization = `Bearer ${t}`;
        setToken(t);
        setUser(data.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common.Authorization;
        setToken(null);
        setUser(null);
    };

    const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
