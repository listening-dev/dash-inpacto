import React, { useState } from 'react';
import SocialDashboard from './SocialDashboard';
import GeralView from './GeralView';
import Sidebar, { MobileDateBar } from './Sidebar';
import RelatorioTab from '../relatorio/RelatorioTab';
import BugReportModal from './BugReportModal';
import { Lock, LogOut, Menu, X, Eye, EyeOff, FileText, AlertTriangle } from 'lucide-react';
import { format, subDays, startOfToday } from 'date-fns';
import { supabase } from '../../lib/supabaseClient';
import { useMetricsBatch } from '../../lib/metrics';
import { PLATFORMS } from '../../config/platforms';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../contexts/AuthContext';

const MainDashboard = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('geral');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isBugReportOpen, setBugReportOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [startDate, setStartDate] = useState(format(subDays(startOfToday(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));

  const { all, byPlatform, loading, latestDataDate } = useMetricsBatch(startDate, endDate);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Senha atualizada com sucesso!', 'success');
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const openPasswordModal = () => {
    setPasswordError('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPwd(false);
    setShowConfirmPwd(false);
    setPasswordModalOpen(true);
  };

  const renderContent = () => {
    const commonProps = { startDate, endDate, setStartDate, setEndDate };

    if (activeTab === 'relatorio') return <RelatorioTab userId={user?.id || ''} />;

    if (activeTab === 'geral') {
      return (
        <GeralView
          all={all}
          byPlatform={byPlatform}
          loading={loading}
          startDate={startDate}
          endDate={endDate}
        />
      );
    }

    for (const p of PLATFORMS) {
      const pid = p.id as 'instagram' | 'facebook' | 'linkedin' | 'twitter';
      if (activeTab === `${p.id}-flexivel`) return <SocialDashboard key={`${p.id}-flex`} platform={pid} mode="flexivel" {...commonProps} />;
      if (activeTab === `${p.id}-fixo`) return <SocialDashboard key={`${p.id}-fixo`} platform={pid} mode="fixo" {...commonProps} />;
    }

    return <GeralView all={all} byPlatform={byPlatform} loading={loading} startDate={startDate} endDate={endDate} />;
  };

  const handleSignOut = () => supabase.auth.signOut().then(() => window.location.reload());

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col md:flex-row font-sans text-gray-900">
      {/* Mobile top bar */}
      <div className="md:hidden bg-[#7B241C] border-b border-white/10 p-4 flex justify-between items-center z-50 fixed w-full top-0">
        <h1 className="text-lg font-bold text-white tracking-wide">Dashboard In.Pacto</h1>
        <div className="flex items-center gap-3">
          <button onClick={openPasswordModal} className="text-white/60 hover:text-white p-1 flex items-center" aria-label="Alterar senha">
            <Lock size={18} />
          </button>
          <button onClick={() => setBugReportOpen(true)} className="text-yellow-400 hover:text-yellow-300 p-1 flex items-center" aria-label="Reportar Problema" title="Reportar Problema">
            <AlertTriangle size={18} />
          </button>
          <button onClick={handleSignOut} className="text-red-400 hover:text-red-300 p-1 flex items-center" aria-label="Sair">
            <LogOut size={20} />
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white p-1" aria-label="Menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="md:hidden fixed top-[60px] w-full z-40">
        <MobileDateBar startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        latestDataDate={latestDataDate}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onPasswordChange={openPasswordModal}
        onSignOut={handleSignOut}
        onBugReport={() => setBugReportOpen(true)}
      />

      {/* Main content */}
      <div className="flex-1 p-4 md:p-8 mt-[104px] md:mt-0 overflow-x-hidden relative min-h-screen flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-grow">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 flex flex-col items-center border-t border-gray-200/60 w-full">
          <img src="/regua.png" alt="Régua Parceiros" className="w-[80%] md:w-[60%] max-w-4xl opacity-80 grayscale mix-blend-multiply mb-6" />
          <p className="text-center text-gray-400 text-sm mb-8">
            &copy; {new Date().getFullYear()} Dashboard desenvolvido pela Listening para a In.Pacto.
            <br />
            Holding In.Pacto. Todos os direitos reservados.
          </p>
        </div>
      </div>

      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => setBugReportOpen(false)}
        userEmail={user?.email}
        userId={user?.id}
      />

      {/* Password modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-fadeIn">
            <button onClick={() => setPasswordModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Fechar">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Lock size={20} className="text-[#C0392B]" /> Alterar Senha
            </h3>
            <p className="text-sm text-gray-500 mb-6">Digite sua nova senha de acesso.</p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 text-sm rounded-lg bg-red-50 text-red-700">
                  {passwordError}
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                    className="w-full px-3 py-2 pr-9 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowNewPwd(v => !v)} aria-label={showNewPwd ? 'Ocultar' : 'Mostrar'} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                    className="w-full px-3 py-2 pr-9 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPwd(v => !v)} aria-label={showConfirmPwd ? 'Ocultar' : 'Mostrar'} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? 'Salvando...' : 'Atualizar Senha'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
