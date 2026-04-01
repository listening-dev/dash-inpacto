import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, History, Lock, LogOut } from 'lucide-react';
import { differenceInDays, parseISO, format, subDays, startOfToday, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PLATFORMS } from '../../config/platforms';

// ─── NavItem ──────────────────────────────────────────────────────────────────

interface NavItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isSubItem?: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const NavItem = ({ id, label, icon, isSubItem = false, activeTab, setActiveTab, setIsMobileMenuOpen }: NavItemProps) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors flex items-center rounded-lg my-0.5
        ${isSubItem ? 'pl-11' : ''}
        ${isActive ? 'bg-[#C0392B]/10 text-black-300 border-l-2 border-gray-400' : 'text-gray-400 hover:text-black hover:bg-white/5'}`}
    >
      {!isSubItem && <span className="mr-3 text-base opacity-80">{icon}</span>}
      {label}
    </button>
  );
};

// ─── NavGroup ─────────────────────────────────────────────────────────────────

interface NavGroupProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  openMenus: { [key: string]: boolean };
  toggleMenu: (menu: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const NavGroup = ({ id, label, icon, openMenus, toggleMenu, activeTab, setActiveTab, setIsMobileMenuOpen }: NavGroupProps) => {
  const isOpen = openMenus[id];
  return (
    <div className="mb-1">
      <button
        onClick={() => toggleMenu(id)}
        className="w-full text-left px-5 py-2.5 text-sm font-medium transition-colors flex items-center justify-between text-gray-400 hover:text-black hover:bg-white/5 rounded-lg"
      >
        <div className="flex items-center">
          <span className="mr-3 text-base opacity-80">{icon}</span>
          {label}
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && (
        <div className="mt-0.5 space-y-0.5">
          <NavItem id={`${id}-flexivel`} label="Flexível" isSubItem activeTab={activeTab} setActiveTab={setActiveTab} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <NavItem id={`${id}-fixo`} label="Fixo" isSubItem activeTab={activeTab} setActiveTab={setActiveTab} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        </div>
      )}
    </div>
  );
};

// ─── SidebarDatePicker ────────────────────────────────────────────────────────

interface DatePickerProps {
  startDate: string;
  endDate: string;
  setStartDate: (d: string) => void;
  setEndDate: (d: string) => void;
  latestDataDate?: string;
}

const SidebarDatePicker = ({ startDate, endDate, setStartDate, setEndDate, latestDataDate }: DatePickerProps) => {
  let activeRange = 0;
  try {
    activeRange = differenceInDays(parseISO(endDate), parseISO(startDate));
  } catch {
    activeRange = 0;
  }

  const today = startOfToday();

  const handleQuickRange = (preset: 'yesterday' | '7d' | '30d' | 'thisMonth' | 'lastMonth' | '3m' | 'year') => {
    let start: Date;
    let end: Date = today;

    switch (preset) {
      case 'yesterday': {
        const yesterday = subDays(today, 1);
        start = yesterday;
        end = yesterday;
        break;
      }
      case '7d':
        start = subDays(today, 7);
        break;
      case '30d':
        start = subDays(today, 30);
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = today;
        break;
      case 'lastMonth': {
        const lastM = subMonths(today, 1);
        start = startOfMonth(lastM);
        end = endOfMonth(lastM);
        break;
      }
      case '3m':
        start = subDays(today, 90);
        break;
      case 'year':
        start = subDays(today, 365);
        break;
      default:
        return;
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    // Se início ficou depois do término, ajusta o término
    if (endDate && value > endDate) setEndDate(value);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    // Se término ficou antes do início, ajusta o início
    if (startDate && value < startDate) setStartDate(value);
  };

  const quickButtons = [
    { label: 'Ontem', preset: 'yesterday' as const },
    { label: '7D', preset: '7d' as const },
    { label: '30D', preset: '30d' as const },
    { label: 'Mês', preset: 'thisMonth' as const },
    { label: 'Ant.', preset: 'lastMonth' as const },
    { label: '3M', preset: '3m' as const },
  ];

  return (
    <div className="mx-4 mb-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative group flex-shrink-0">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#E67E22]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-[#E67E22]/10 transition-colors"></div>

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-1.5 bg-red-50 rounded-lg">
          <Calendar size={14} className="text-[#C0392B]" />
        </div>
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Intervalo</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-5 relative z-10">
        {quickButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleQuickRange(btn.preset)}
            className="py-1 px-1 rounded-md text-[10px] font-bold transition-all bg-gray-50 text-gray-500 hover:bg-[#C0392B] hover:text-white"
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 relative z-10">
        <div className="relative">
          <span className="absolute -top-1.5 left-2 px-1 bg-white text-[9px] font-bold text-gray-400 uppercase">Início</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold bg-gray-50/50 text-gray-800 cursor-pointer focus:ring-2 focus:ring-red-100 focus:border-[#C0392B] focus:outline-none transition-all"
          />
        </div>
        <div className="relative">
          <span className="absolute -top-1.5 left-2 px-1 bg-white text-[9px] font-bold text-gray-400 uppercase">Término</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold bg-gray-50/50 text-gray-800 cursor-pointer focus:ring-2 focus:ring-red-100 focus:border-[#C0392B] focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-center gap-2 relative z-10">
        <History size={12} className="text-gray-400" />
        <span className="text-[10px] font-medium text-gray-500 italic">
          {latestDataDate
            ? `Atualizado: ${latestDataDate.split('-').reverse().join('/')}`
            : 'Exibindo dados do período selecionado'}
        </span>
      </div>
    </div>
  );
};

// ─── MobileDateBar ────────────────────────────────────────────────────────────

export const MobileDateBar = ({ startDate, endDate, setStartDate, setEndDate }: DatePickerProps) => (
  <div className="flex items-center gap-2 bg-white border-t border-gray-200 px-4 py-2 md:hidden shadow-sm">
    <Calendar size={14} className="text-[#E67E22] shrink-0" />
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#E67E22] w-full"
    />
    <span className="text-[#E67E22] text-xs font-medium shrink-0">&rarr;</span>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#E67E22] w-full"
    />
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startDate: string;
  endDate: string;
  setStartDate: (d: string) => void;
  setEndDate: (d: string) => void;
  latestDataDate?: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onPasswordChange: () => void;
  onSignOut: () => void;
}

const SIDEBAR_ICON_FILTER = 'invert(27%) sepia(78%) saturate(2200%) hue-rotate(346deg) brightness(80%) contrast(95%)';

const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab,
  startDate, endDate, setStartDate, setEndDate,
  latestDataDate,
  isMobileMenuOpen, setIsMobileMenuOpen,
  onPasswordChange, onSignOut,
}) => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>(() => {
    const initial: Record<string, boolean> = {};
    PLATFORMS.forEach((p, i) => { initial[p.id] = i < 2; });
    return initial;
  });

  const toggleMenu = (menu: string) => setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  const navProps = { activeTab, setActiveTab, setIsMobileMenuOpen };

  return (
    <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 fixed md:sticky top-[60px] md:top-0 h-[calc(100vh-60px)] md:h-screen w-64 md:min-w-[16rem] bg-[#C0392B] flex flex-col z-40 overflow-y-auto scrollbar-hide border-r border-white/10`}>

      {/* Logo */}
      <div className="p-6 hidden md:block border-b border-white/10">
        <div className="flex items-center mb-1">
          <div className="w-20 h-20 rounded-lg bg-white mr-3 flex items-center justify-center overflow-hidden p-3">
            <img src="/logo-inpacto.png" alt="Logo In.Pacto" className="w-full h-full object-contain scale-125" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Dashboard Redes</h1>
            <p className="text-sm text-white font-medium">In.Pacto</p>
          </div>
        </div>
      </div>

      <SidebarDatePicker
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        latestDataDate={latestDataDate}
      />

      {/* Nav */}
      <nav className="flex-1 px-3 pb-10">
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="mb-2 px-3 text-[15px] font-bold text-gray-800 uppercase tracking-widest">
            Dashboard Principal
          </div>
          <div className="mb-5 space-y-0.5">
            <NavItem
              id="geral"
              label="Visão Geral"
              icon={<span style={{ color: '#C0392B', fontSize: '40px' }}>&#128065;</span>}
              {...navProps}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="mb-2 px-3 text-[15px] font-bold text-gray-800 uppercase tracking-widest">
            Redes Sociais
          </div>
          <div className="space-y-0.5">
            {PLATFORMS.map(p => (
              <NavGroup
                key={p.id}
                id={p.id}
                label={p.label}
                icon={
                  <img
                    src={p.icon}
                    alt={p.label}
                    className="w-8 h-8"
                    style={{ filter: SIDEBAR_ICON_FILTER }}
                  />
                }
                openMenus={openMenus}
                toggleMenu={toggleMenu}
                {...navProps}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Desktop footer */}
      <div className="p-4 border-t border-white/10 mt-auto hidden md:block space-y-2">
        <button
          onClick={onPasswordChange}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white rounded-xl transition-all font-medium text-sm"
        >
          <Lock size={16} />
          Alterar Senha
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:text-white rounded-xl transition-all font-medium text-sm"
        >
          <LogOut size={16} />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
