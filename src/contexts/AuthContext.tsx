import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    hasAccess: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    hasAccess: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        let mounted = true;
        let resolved = false;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                setHasAccess(true);
            } else if (event === 'INITIAL_SESSION') {
                setUser(null);
                setHasAccess(false);
            }

            if (mounted) {
                resolved = true;
                setLoading(false);
            }
        });

        const safetyTimeout = setTimeout(() => {
            if (mounted && !resolved) {
                setLoading(false);
            }
        }, 2000);

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, hasAccess }}>
            {children}
        </AuthContext.Provider>
    );
};
