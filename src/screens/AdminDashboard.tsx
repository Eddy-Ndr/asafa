import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Coins,
  Music,
  CalendarDays,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { User, Team, FinancialSummary, TeamId } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { NavTab } from '../components/BottomNav.tsx';

interface AdminDashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenBadge: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onOpenBadge }) => {
  const { t } = useLanguage();
  const [members, setMembers] = useState<User[]>([]);
  const [pending, setPending] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [finSummary, setFinSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, pendingData, teamsData, finData] = await Promise.all([
        api.getMembers(),
        api.getPendingMembers(),
        api.getTeams(),
        api.getFinancialSummary(),
      ]);
      setMembers(membersData);
      setPending(pendingData);
      setTeams(teamsData);
      setFinSummary(finData);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    try {
      const res = await api.approveMember(id);
      setActionSuccess(`Mpikambana ${name} nankatoavina ! Member ID: ${res.user.memberId}`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Tena holavina ve ny fangatahan'i ${name} ?`)) return;
    try {
      await api.rejectMember(id);
      setActionSuccess(`Nolavina ny fangatahan'i ${name}`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

  const activeMembers = members.filter(m => m.status === 'active');

  const teamColors: Record<TeamId, string> = {
    soalia: 'bg-blue-600',
    mpiantsa: 'bg-indigo-700',
    tomima: 'bg-sky-600',
    asafa: 'bg-blue-800',
  };

  return (
    <div className="p-4 space-y-4">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>{t('admin_overview')}</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-wide">
            Birao Mpandrindra Foibe ASAFA
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Fitantanana ankapobeny ireo ekipa 4, mpikambana, teti-bola sy fandaharam-potoana.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1565C0] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {t('total_members')}
            </div>
            <div className="text-lg font-black text-slate-800">
              {activeMembers.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {t('pending_approvals')}
            </div>
            <div className="text-lg font-black text-amber-600">
              {pending.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {t('net_balance')}
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
              {t('nav_chants')}
            </div>
            <div className="text-lg font-black text-slate-800">
              5 Hira
            </div>
          </div>
        </div>
      </div>

      {/* Pending Member Approvals Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              {t('pending_approvals')} ({pending.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Fankatoavana & Fanomezana Karatra
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-500 font-medium">
            {t('no_pending_members')}
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map(p => (
              <div
                key={p.id}
                className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover border border-amber-300"
                  />
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">{p.email} • {p.phone}</p>
                    <span className="inline-block bg-blue-100 text-[#1565C0] text-[9px] font-black px-1.5 py-0.5 rounded uppercase mt-0.5">
                      Équipe {p.teamId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleApprove(p.id, p.name)}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{t('approve')}</span>
                  </button>
                  <button
                    onClick={() => handleReject(p.id, p.name)}
                    className="flex-1 sm:flex-none bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{t('reject')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4 Teams Member Distribution */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
          {t('team_breakdown')} (SOALIA, MPIANTSA, TOMIMA, ASAFA)
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {(['soalia', 'mpiantsa', 'tomima', 'asafa'] as TeamId[]).map(tId => {
            const count = members.filter(m => m.teamId === tId && m.status === 'active').length;
            return (
              <div
                key={tId}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-black uppercase text-slate-800">{tId}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Mpikambana mavitrika</div>
                </div>
                <span className={`text-xs font-black text-white px-2 py-0.5 rounded-lg ${teamColors[tId]}`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Quick Shortcuts */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
        <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
          Hetsika sy Fitantanana Haingana
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('chants')}
            className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left text-xs font-bold text-[#1565C0] flex items-center justify-between"
          >
            <span>Mitantana Hira</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('programme')}
            className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left text-xs font-bold text-[#1565C0] flex items-center justify-between"
          >
            <span>Fandaharana</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('finances')}
            className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left text-xs font-bold text-[#1565C0] flex items-center justify-between"
          >
            <span>Tatitra Ara-bola</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('galerie')}
            className="p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left text-xs font-bold text-[#1565C0] flex items-center justify-between"
          >
            <span>Tahiry Sary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
