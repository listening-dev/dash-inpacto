import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const FRIENDLY_ERRORS: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.',
    'Email not confirmed': 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.',
    'User not found': 'Nenhuma conta encontrada com esse e-mail.',
    'Too many requests': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
};

const friendlyMessage = (raw: string): string =>
    FRIENDLY_ERRORS[raw] ?? 'Ocorreu um erro ao tentar fazer login. Tente novamente.';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error: any) {
            setError(friendlyMessage(error.message || ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F0EB] flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <img src="/logo-inpacto.png" alt="In.Pacto" className="h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">In.Pacto Dashboard</h1>
                    <p className="text-slate-500 mt-2">Faça login para acessar os resultados</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">E-mail</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                required
                                autoFocus
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B] sm:text-sm bg-slate-50 transition-colors"
                                placeholder="seu@email.com.br"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                required
                                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B] sm:text-sm bg-slate-50 transition-colors"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#C0392B] hover:bg-[#A93226] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C0392B] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            'Entrar no Dashboard'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
