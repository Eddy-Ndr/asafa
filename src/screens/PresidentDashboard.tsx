import React, { useState, useEffect } from 'react';
import {
  Users,
  Coins,
  Music,
  CalendarDays,
  Image as ImageIcon,
  MessageSquare,
  Shield,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { User, Song, Programme, FinancialSummary, TeamId } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { NavTab } from '../components/BottomNav.tsx';

interface PresidentDashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenBadge: () => void;
}

export const PresidentDashboard: React.FC<PresidentDashboardProps> = ({ onNavigate, onOpenBadge }) => {
  const { user, teamId } = useAuth();
  const { t } = useLanguage();

  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [teamSongs, setTeamSongs] = useState<Song[]>([]);
  const [teamProgrammes, setTeamProgrammes] = useState<Programme[]>([]);
  const [finSummary, setFinSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const effectiveTeamId = teamId || 'soalia';

  useEffect(() => {
    const loadTeamData = async () => {
      setLoading(true);
      try {
        const [membersData, songsData, progData, finData] = await Promise.all([
          api.getMembers(),
          api.getSongs({ teamId: effectiveTeamId }),
          api.getProgrammes(effectiveTeamId),
          api.getFinancialSummary(effectiveTeamId),
        ]);
        // Backend filters members for president to their team!
        setTeamMembers(membersData);
        setTeamSongs(songsData);
        setTeamProgrammes(progData);
        setFinSummary(finData);
      } catch (err) {
        console.error('Failed to load president data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [effectiveTeamId]);

  return (
    <div className="p-4 space-y-4">
      {/* President Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-amber-300" />
            <span>{t('president_overview')}</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-wide uppercase">
            Équipe {effectiveTeamId}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Filohan'ny Ekipa: <span className="font-bold text-white">{user?.name}</span>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="bg-white/20 backdrop-blur-xs text-blue-100 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
              Alalana manokana ho an'ny {effectiveTeamId}
            </span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Metrics Scoped Strictly to Assigned Team */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1565C0] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {t('my_team_members')}
            </div>
            <div className="text-lg font-black text-slate-800">
              {teamMembers.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {t('team_finances')}
            </div>
            <div className="text-sm font-black text-emerald-700">
              {finSummary ? `${finSummary.netBalance.toLocaleString()} Ar` : '...'}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {t('team_songs')}
            </div>
            <div className="text-lg font-black text-slate-800">
              {teamSongs.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {t('team_programmes')}
            </div>
            <div className="text-lg font-black text-slate-800">
              {teamProgrammes.length}
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List (Scoped to Assigned Team) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
            {t('my_team_members')} ({teamMembers.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            {effectiveTeamId}
          </span>
        </div>

        <div className="space-y-2">
          {teamMembers.slice(0, 4).map(m => (
            <div
              key={m.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={m.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">{m.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{m.memberId || 'Pending'}</div>
                </div>
              </div>
              <span className="text-[10px] font-extrabold bg-blue-100 text-[#1565C0] px-2 py-0.5 rounded uppercase">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Team Management Actions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
        <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
          Fitantanana ny Ekipa {effectiveTeamId.toUpperCase()}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('chants')}
            className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left text-xs font-bold text-[#1565C0] flex items-center justify-between"
          >
            <span>Hiran'ny Ekipa</span>
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('programme')}
            className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left text-xs font-bold text-[#1565C0] flex items-center justify-between"
          >
            <span>Fandaharana</span>
            <CalendarDays className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('resadresaka')}
            className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left text-xs font-bold text-[#1565C0] flex items-center justify-between"
          >
            <span>Dinika Ekipa</span>
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('finances')}
            className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left text-xs font-bold text-[#1565C0] flex items-center justify-between"
          >
            <span>Volan'ny Ekipa</span>
            <Coins className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
