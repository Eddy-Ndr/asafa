import React, { useState, useEffect } from 'react';
import {
  Bell,
  Menu,
  Music,
  CalendarDays,
  Image as ImageIcon,
  MessageSquare,
  ChevronRight,
  BookOpen,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { AsafaLogo } from '../components/AsafaLogo.tsx';
import { api } from '../services/api.ts';
import { Programme } from '../types.ts';
import { NavTab } from '../components/BottomNav.tsx';

interface DashboardScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenPendingApprovals?: () => void;
  pendingCount?: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenMenu,
  onOpenNotifications,
  onOpenPendingApprovals,
  pendingCount = 0,
}) => {
  const { user, role, teamId } = useAuth();
  const { t } = useLanguage();

  const [programmes, setProgrammes] = useState<Programme[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const progData = await api.getProgrammes();
        setProgrammes(progData);
      } catch (err) {
        console.error('Failed to load dashboard programmes:', err);
      }
    };
    loadData();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Mpikambana';

  // Filter only future programmes (Date in future or today). Expired/past events do not appear here.
  const isFutureEvent = (eventDateStr: string | null | undefined): boolean => {
    if (!eventDateStr) return false;
    const eventTime = new Date(eventDateStr).getTime();
    if (isNaN(eventTime)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventTime >= today.getTime();
  };

  const futureProgrammes = programmes
    .filter(p => !p.isArchived && isFutureEvent(p.eventDate))
    .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime());

  const upcomingProgramme = futureProgrammes[0];

  const latestAnnouncement = programmes
    .filter(p => !p.isArchived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const formatDayBadge = (dateStr: string | null | undefined) => {
    if (!dateStr) return { dayLabel: 'DATY', dayNum: '--' };
    try {
      const d = new Date(dateStr);
      const days = ['DIM.', 'LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.'];
      const dayLabel = days[d.getDay()] || 'DATY';
      const dayNum = String(d.getDate()).padStart(2, '0');
      return { dayLabel, dayNum };
    } catch {
      return { dayLabel: 'DATY', dayNum: '--' };
    }
  };

  const formatTimeAgo = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Vao haingana';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      if (hours < 1) return 'Vao haingana';
      if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
      const days = Math.floor(hours / 24);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } catch {
      return 'Vao haingana';
    }
  };

  const upcomingBadge = formatDayBadge(upcomingProgramme?.eventDate);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-6 space-y-4">
      {/* 1. Deep Blue Curved Header (Exactly as in screenshot) */}
      <div className="bg-gradient-to-b from-[#0A3370] via-[#0E4191] to-[#124FA6] text-white pt-5 pb-12 px-5 rounded-b-[40px] shadow-md relative select-none">
        {/* Top Row: Crest, Greeting, Bell, Menu */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo Crest */}
          <AsafaLogo className="w-12 h-12 shrink-0" />

          {/* Welcome Text */}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-blue-200 font-medium flex items-center gap-1 truncate">
              <span>👋</span>
              <span>Fiadanana'ny Tompo tompoko.</span>
            </div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-white leading-tight truncate">
              Tongasoa, {firstName} !
            </h2>
          </div>

          {/* Action Buttons: Bell & Hamburger Menu */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenNotifications}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 flex items-center justify-center text-white transition-all relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-white" />
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 ring-1 ring-white" />
              )}
            </button>

            <button
              onClick={onOpenMenu}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 flex items-center justify-center text-white transition-all"
              title="Paramètres & Menu"
            >
              <Menu className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="mt-4">
          <h1 className="font-serif text-lg sm:text-xl font-bold tracking-wider text-white leading-tight">
            ASAFA TOLIARA – MPIKAMBANA
          </h1>
          <p className="italic text-xs text-blue-200 mt-0.5 font-serif">
            Fiangonana Ara-pilazantsara eto Madagasikara
          </p>
        </div>
      </div>

      {/* 2. Warm Golden Card (TENY FIKASANA ANDROANY - Exactly as in screenshot) */}
      <div className="-mt-7 px-4 relative z-10">
        <div className="bg-gradient-to-r from-[#D97706] via-[#E2870A] to-[#E68A00] rounded-3xl p-5 shadow-lg text-amber-950">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-amber-950/80">
            <span>✨</span>
            <span>TENY FIKASANA ANDROANY</span>
          </div>
          <p className="font-serif italic font-semibold text-xs sm:text-[13px] text-amber-950 mt-2 leading-relaxed">
            « Mihirà fihiram-baovao ho Azy, mitendre tsara amin'ny feon-kira. »
          </p>
          <p className="font-serif font-bold text-xs text-amber-950 mt-2">
            Salamo 33 : 3
          </p>
        </div>
      </div>

      {/* Admin Pending Approvals Notification Bar (if pending members exist) */}
      {role === 'admin' && pendingCount > 0 && onOpenPendingApprovals && (
        <div className="px-4">
          <button
            onClick={onOpenPendingApprovals}
            className="w-full bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-900 rounded-2xl p-3 flex items-center justify-between text-xs font-bold transition-all shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Inscriptions en attente d'approbation ({pendingCount})</span>
            </div>
            <span className="text-[11px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">
              Examiner →
            </span>
          </button>
        </div>
      )}

      {/* 3. 2x2 Feature Action Cards Grid (Exactly as in screenshot) */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {/* Card 1: Chants */}
        <div
          onClick={() => onNavigate('chants')}
          className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-blue-200 flex flex-col justify-between min-h-[92px] cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
              <Music className="w-5 h-5 fill-current" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-bold text-xs text-slate-800 mt-2">
            Chants
          </div>
        </div>

        {/* Card 2: Programme */}
        <div
          onClick={() => onNavigate('programme')}
          className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-blue-200 flex flex-col justify-between min-h-[92px] cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-bold text-xs text-slate-800 mt-2">
            Programme
          </div>
        </div>

        {/* Card 3: Galerie */}
        <div
          onClick={() => onNavigate('galerie')}
          className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-blue-200 flex flex-col justify-between min-h-[92px] cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-[#EC4899] text-white flex items-center justify-center shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-bold text-xs text-slate-800 mt-2">
            Galerie
          </div>
        </div>

        {/* Card 4: Resadresaka */}
        <div
          onClick={() => onNavigate('resadresaka')}
          className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-blue-200 flex flex-col justify-between min-h-[92px] cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-bold text-xs text-slate-800 mt-2">
            Resadresaka
          </div>
        </div>
      </div>

      {/* 4. "Dernières annonces" Section (Exactly as in screenshot) */}
      <div className="px-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-800 tracking-wide">
            Dernières annonces
          </h3>
          <button
            onClick={() => onNavigate('programme')}
            className="text-xs font-bold text-[#0D4194] hover:underline"
          >
            Voir tout
          </button>
        </div>

        <div
          onClick={() => onNavigate('programme')}
          className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 hover:border-blue-200 flex items-start gap-3 cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#EBF2FC] text-[#0D4194] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-slate-800">
              Répétition générale samedi
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">
              Rendez-vous à 15h au temple central. Soyez ponctuels.
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block font-medium">
              Il y a 2 heures
            </span>
          </div>
        </div>
      </div>

      {/* 5. "Prochain programme" Section (Exactly as in screenshot) */}
      <div className="px-4 space-y-2.5">
        <h3 className="font-extrabold text-xs text-slate-800 tracking-wide">
          Prochain programme
        </h3>

        <div
          onClick={() => onNavigate('programme')}
          className="bg-gradient-to-r from-[#0E4191] to-[#1253B3] rounded-3xl p-4 text-white shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex-1 pr-3">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">
              CULTE DOMINICAL
            </span>
            <h4 className="font-serif font-extrabold text-base text-white mt-0.5 leading-snug">
              Dimanche 9h00
            </h4>
            <p className="text-xs text-blue-100 mt-1">
              Temple central — Toliara
            </p>
            <div className="text-[11px] text-amber-300 font-semibold mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span>12 chants au programme</span>
            </div>
          </div>

          {/* Date Badge: DIM. 07 */}
          <div className="w-14 h-14 rounded-full bg-[#0A3370] border border-blue-400/30 flex flex-col items-center justify-center text-white shrink-0 shadow-inner">
            <span className="text-[9px] font-bold text-blue-200 uppercase tracking-tight">
              DIM.
            </span>
            <span className="text-lg font-black leading-none text-white mt-0.5">
              07
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
