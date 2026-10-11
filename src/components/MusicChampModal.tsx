import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Star,
  MoreVertical,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Music,
  Check,
  Edit2,
  Volume2,
} from 'lucide-react';
import { Song } from '../types.ts';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface MusicChampModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (song: Song) => void;
}

const teamPillColors: Record<string, { bg: string; text: string; label: string }> = {
  tomima: { bg: 'bg-[#F97316]', text: 'text-white', label: 'TOMIMA' },
  soalia: { bg: 'bg-[#9333EA]', text: 'text-white', label: 'SOALIA' },
  mpiantsa: { bg: 'bg-[#10B981]', text: 'text-white', label: 'MPIANTSA' },
  asafa: { bg: 'bg-[#2563EB]', text: 'text-white', label: 'ASAFA TOLIARA' },
  all: { bg: 'bg-[#1E40AF]', text: 'text-white', label: 'FIARAM' },
};

export const MusicChampModal: React.FC<MusicChampModalProps> = ({
  song,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { role, teamId: userTeamId } = useAuth();
  const { isPlaying, togglePlay, replaySong, currentTime, duration, seek } = useAudioPlayer();

  // Tab: 'paroles' (default in image) or 'audio'
  const [activeTab, setActiveTab] = useState<'paroles' | 'audio'>('paroles');
  const [fontSize, setFontSize] = useState<number>(15);
  const [isFavorite, setIsFavorite] = useState<boolean>(true); // Golden star in image
  const [copied, setCopied] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('paroles');
    }
  }, [isOpen, song?.id]);

  if (!isOpen || !song) return null;

  const teamPill = teamPillColors[song.teamId] || teamPillColors.tomima;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: `Henoy ny hira "${song.title}" ao amin'ny fampiharana ASAFA`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${song.title}\n\n${song.lyrics}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canEdit =
    role === 'admin' ||
    (role === 'president' && (song.teamId === userTeamId || song.teamId === 'all'));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs select-none animate-in fade-in duration-200"
    >
      <div className="bg-[#081D39] w-full max-w-md h-full sm:h-[96vh] sm:rounded-[36px] shadow-2xl flex flex-col relative overflow-hidden">
        {/* ========================================================
            1. TOP HEADER (Matching right screen in screenshot)
            < ChevronLeft | Song Title + Team Pill | Star + MoreVertical
            ======================================================== */}
        <div className="bg-[#081D39] px-4 pt-4 pb-2.5 flex items-center justify-between text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
            title="Miverina (Retour)"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex flex-col items-center max-w-[210px] text-center">
            <h3 className="font-bold text-sm text-white truncate">
              {song.title}
            </h3>
            <span
              className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full mt-1 shadow-xs tracking-wider ${teamPill.bg} ${teamPill.text}`}
            >
              {teamPill.label}
            </span>
          </div>

          <div className="flex items-center gap-1 relative">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-9 h-9 rounded-full hover:bg-white/10 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              title="Tianao (Favoris)"
            >
              <Star
                className={`w-5 h-5 ${
                  isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 rounded-full hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
              title="Safidy (Options)"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className="absolute top-11 right-0 bg-[#0B2545] border border-blue-900 rounded-2xl p-1.5 shadow-2xl z-20 min-w-[140px] text-xs">
                {canEdit && onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onClose();
                      onEdit(song);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-slate-200 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Hanova hira</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    replaySong();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hamerina (Replay)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            2. TABS (Paroles vs Audio)
            "Paroles" has solid amber underline when active
            ======================================================== */}
        <div className="bg-[#081D39] px-6 flex justify-around text-xs font-bold shrink-0 border-b border-blue-900/30">
          <button
            type="button"
            onClick={() => setActiveTab('paroles')}
            className={`py-2.5 px-4 transition-all relative cursor-pointer ${
              activeTab === 'paroles'
                ? 'text-white font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Paroles</span>
            {activeTab === 'paroles' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`py-2.5 px-4 transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audio'
                ? 'text-white font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio</span>
            {activeTab === 'audio' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        </div>

        {/* ========================================================
            3. MAIN WHITE SHEET CARD (Rounded top, matching screenshot)
            ======================================================== */}
        <div className="flex-1 overflow-y-auto bg-white rounded-t-[32px] sm:rounded-[32px] p-6 text-slate-900 shadow-inner flex flex-col">
          {activeTab === 'paroles' ? (
            /* A. PAROLES / LYRICS VIEW (Matching right screen in screenshot) */
            <div className="space-y-4 text-slate-800 flex-1">
              {/* Song Title in bold serif */}
              <h2 className="font-serif text-2xl font-bold text-[#0B2545] tracking-tight">
                {song.title}
              </h2>

              {/* Formatted Lyrics content */}
              <div
                style={{ fontSize: `${fontSize}px` }}
                className="font-serif leading-relaxed text-slate-800 whitespace-pre-wrap select-text font-normal space-y-4"
              >
                {song.lyrics}
              </div>

              {/* End separator with 3 dots */}
              <div className="text-center py-6 text-slate-400 font-bold tracking-widest select-none">
                — • • • —
              </div>
            </div>
          ) : (
            /* B. AUDIO PLAYER TAB VIEW */
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-6">
              {/* Spinning Disc Record */}
              <div className="relative">
                <div className="w-44 h-44 rounded-full bg-gradient-to-tr from-[#081D39] via-[#0F356B] to-[#0A244E] shadow-2xl p-2.5 border-4 border-amber-300/80 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-2 rounded-full border border-white/10" />
                  <div className="absolute inset-5 rounded-full border border-dashed border-white/20" />
                  <div className="absolute inset-8 rounded-full border border-white/10" />

                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 border-4 border-white shadow-md flex items-center justify-center text-slate-950 ${
                      isPlaying ? 'animate-spin [animation-duration:6s]' : ''
                    }`}
                  >
                    <Music className="w-8 h-8 text-slate-950" />
                  </div>

                  <div className="w-4 h-4 rounded-full bg-[#081D39] absolute border-2 border-white" />
                </div>

                {isPlaying && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md animate-pulse">
                    Mandeha ny hira
                  </span>
                )}
              </div>

              {/* Title & info */}
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-slate-900">{song.title}</h3>
                <p className="text-xs text-slate-500">
                  {song.author} • {song.keySignature || 'Feo fototra'}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-[#081D39] text-xs font-bold">
                    <Volume2 className="w-3.5 h-3.5 text-[#1D63D8]" />
                    <span>{song.audioUrl ? 'Fandraisam-peo Tena Izy' : 'Mélodie Sacrée (Synth)'}</span>
                  </span>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="w-full max-w-xs space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration > 0 ? duration : 100}
                  value={currentTime}
                  onChange={e => seek(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#081D39]"
                />
                <div className="flex justify-between text-xs font-mono font-bold text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Replay action */}
              <button
                type="button"
                onClick={replaySong}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#081D39] hover:bg-slate-100 px-4 py-2 rounded-full cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Hamerina hatrany am-boalohany (Replay)</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            4. BOTTOM DEEP-BLUE DOCK (Matching right screen in screenshot)
            Aa Taille | Big Golden Play/Pause "Audio" | Share2 Partager
            ======================================================== */}
        <div className="bg-[#081D39] px-8 py-3.5 flex items-center justify-between text-white shrink-0 border-t border-blue-900/30">
          {/* Left: Font Size Adjuster (Aa + Taille) */}
          <button
            type="button"
            onClick={() => setFontSize(prev => (prev >= 21 ? 13 : prev + 3))}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="font-serif font-black text-lg leading-none group-hover:scale-110 transition-transform">
              Aa
            </span>
            <span className="text-[11px] font-semibold text-slate-300 tracking-tight">
              Taille
            </span>
          </button>

          {/* Center: Big Golden Circle Play / Pause Button with "Audio" text */}
          <div className="flex flex-col items-center -mt-6">
            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 flex items-center justify-center shadow-xl active:scale-95 transition-all ring-4 ring-[#081D39] cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>
            <span className="text-[11px] font-bold text-slate-200 mt-1">Audio</span>
          </div>

          {/* Right: Share Button (Partager) */}
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer group"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[11px] font-semibold text-slate-300 tracking-tight">
              {copied ? 'Voadika' : 'Partager'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
