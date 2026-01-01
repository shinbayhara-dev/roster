import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, LoginResponse } from '../types';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            loadCurrentUser();
        }
    }, []);

    const loadCurrentUser = async () => {
        // Avoid double loading if we know we are authenticated but user is null
        try {
            const { data } = await api.getCurrentUser();
            setCurrentUser(data);
        } catch (err: any) {
            console.error("Failed to load user", err);
            logout();
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const resp: LoginResponse = await api.login(email, password);
            localStorage.setItem('token', resp.data.token);
            setIsAuthenticated(true);
            setCurrentUser(resp.data.user);
            return true;
        } catch (err: any) {
            setError(err.message || "Login gagal");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    return {
        currentUser,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        setError // exposed in case UI wants to clear error
    };
};
