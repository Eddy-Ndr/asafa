import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Music,
  CalendarDays,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Song, Programme, TeamId } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { NavTab } from '../components/BottomNav.tsx';

interface MemberDashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenBadge: () => void;
}

const teamNames: Record<TeamId, string> = {
  soalia: 'ÉQUIPE SOALIA',
  mpiantsa: 'ÉQUIPE MPIANTSA',
  tomima: 'ÉQUIPE TOMIMA',
  asafa: 'BIRAO FOIBE ASAFA',
};

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ onNavigate, onOpenBadge }) => {
  const { user, teamId } = useAuth();
  const { t } = useLanguage();

  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [upcomingProgrammes, setUpcomingProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadMemberData = async () => {
      setLoading(true);
      try {
        const [songsData, progData] = await Promise.all([
          api.getSongs({ teamId: teamId || 'all' }),
          api.getProgrammes(teamId || 'all'),
        ]);
        setRecentSongs(songsData.slice(0, 3));
        setUpcomingProgrammes(progData.slice(0, 2));
      } catch (err) {
        console.error('Failed to load member dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMemberData();
  }, [teamId]);

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#1976D2] text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-blue-200 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('member_welcome')}</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-wide">
            {user?.name}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-white/20 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase">
              {teamId ? teamNames[teamId] : 'ASAFA'}
            </span>
            <span className="bg-emerald-400/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              ID: {user?.memberId || 'Actif'}
            </span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Digital Membership Badge Card Shortcut */}
      <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[#1565C0] font-black text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-[#1565C0]" />
              <span>{t('badge_title')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-[210px]">
              Karatra maha-mpikambana ofisialy misy QR Code azo hamarinina.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EAF3FF] text-[#1565C0] flex items-center justify-center shrink-0">
            <QrCode className="w-7 h-7" />
          </div>
        </div>

        <button
          onClick={onOpenBadge}
          className="w-full mt-3.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
        >
          <span>{t('view_my_badge')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Upcoming Programmes & Events */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-[#1565C0]" />
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              {t('upcoming_events')}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('programme')}
            className="text-[11px] font-bold text-[#1565C0] hover:underline"
          >
            Hijerena rehetra
          </button>
        </div>

        {upcomingProgrammes.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">
            Tsy misy fandaharana ho avy amin'izao fotoana izao.
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingProgrammes.map(prog => (
              <div
                key={prog.id}
                onClick={() => onNavigate('programme')}
                className="bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-slate-200/80 rounded-xl p-3 transition-all"
              >
                <div className="flex items-center justify-between text-[10px] text-blue-700 font-bold uppercase mb-1">
                  <span>Équipe {prog.teamId}</span>
                  {prog.eventDate && (
                    <span className="text-slate-500 font-medium">
                      {new Date(prog.eventDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">
                  {prog.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                  {prog.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Added Songs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Music className="w-4 h-4 text-[#1565C0]" />
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              {t('recent_songs')}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('chants')}
            className="text-[11px] font-bold text-[#1565C0] hover:underline"
          >
            Fihirana rehetra
          </button>
        </div>

        <div className="space-y-2">
          {recentSongs.map(song => (
            <div
              key={song.id}
              onClick={() => onNavigate('chants')}
              className="bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between transition-all"
            >
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">
                  {song.title}
                </h4>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {song.category} • {song.keySignature || 'Feo fototra'}
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-[#1565C0] bg-blue-50 px-2 py-1 rounded">
                {song.teamId}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onNavigate('resadresaka')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-xs flex items-center gap-2.5 text-left transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1565C0] flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">Resadresaka</div>
            <div className="text-[10px] text-slate-400">Hafatra & Dinika</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('galerie')}
          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-xs flex items-center gap-2.5 text-left transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1565C0] flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">Tahiry Sary</div>
            <div className="text-[10px] text-slate-400">Sary & Fahatsiarovana</div>
          </div>
        </button>
      </div>
    </div>
  );
};
