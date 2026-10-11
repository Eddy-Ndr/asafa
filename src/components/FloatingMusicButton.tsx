import React from 'react';
import { Play, Pause, RotateCcw, Music, Maximize2 } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';

const teamBadgeStyles: Record<string, { bg: string; text: string }> = {
  tomima: { bg: 'bg-[#F97316]', text: 'text-white' },
  soalia: { bg: 'bg-[#9333EA]', text: 'text-white' },
  mpiantsa: { bg: 'bg-[#10B981]', text: 'text-white' },
  asafa: { bg: 'bg-[#2563EB]', text: 'text-white' },
  all: { bg: 'bg-[#0D3877]', text: 'text-white' },
};

export const FloatingMusicButton: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    replaySong,
    isMusicChampOpen,
    openMusicChamp,
    currentTime,
    duration,
  } = useAudioPlayer();

  // Only appear when a song has been selected / played AND Music Champ is closed (back to the list)
  if (!currentSong || isMusicChampOpen) return null;

  const teamStyle = teamBadgeStyles[currentSong.teamId] || teamBadgeStyles.all;
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <aside
      aria-label="Lecteur audio flottant"
      className="fixed bottom-[74px] right-3 sm:right-6 z-40 flex items-center gap-1.5 select-none animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      {/* 1. Song Title Chip / Tap to open Music Champ */}
      <button
        type="button"
        onClick={openMusicChamp}
        className="hidden xs:flex items-center gap-1.5 bg-[#091E3D]/95 hover:bg-[#0C274E] text-white backdrop-blur-md pl-3 pr-2.5 py-1.5 rounded-full border border-blue-800/60 shadow-xl transition-all max-w-[150px] sm:max-w-[180px] group text-left cursor-pointer"
        title="Sokafy ny Music Champ (Ouvrir le lecteur)"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
        <span className="text-[11px] font-bold truncate text-slate-100 group-hover:text-amber-300">
          {currentSong.title}
        </span>
        <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-white shrink-0 ml-auto" />
      </button>

      {/* 2. Quick Replay Circle Button */}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          replaySong();
        }}
        className="w-10 h-10 rounded-full bg-[#0A2655] hover:bg-[#103675] active:scale-95 text-amber-300 hover:text-amber-200 border border-blue-700/60 flex items-center justify-center shadow-lg transition-all group relative cursor-pointer"
        title="Hamerina hatrany am-boalohany (Replay)"
      >
        <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-45" />
        <span className="sr-only">Replay</span>
      </button>

      {/* 3. Main Floating Circle Play / Pause & Disc Button */}
      <div className="relative">
        {/* SVG Circular Progress Ring */}
        <svg className="w-[58px] h-[58px] -rotate-90 pointer-events-none absolute -inset-[3px]">
          <circle
            cx="29"
            cy="29"
            r="26"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="3"
            fill="transparent"
          />
          <circle
            cx="29"
            cy="29"
            r="26"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeDasharray={2 * Math.PI * 26}
            strokeDashoffset={2 * Math.PI * 26 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-200"
          />
        </svg>

        {/* The Core Floating Circle Button */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            togglePlay();
          }}
          className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 relative overflow-hidden border-2 border-white/80 cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-tr from-[#F59E0B] via-[#FBBF24] to-[#D97706] text-slate-950 ring-4 ring-amber-400/30'
              : 'bg-gradient-to-tr from-[#0D3877] via-[#1554A8] to-[#0A2655] text-white ring-4 ring-blue-900/40'
          }`}
          title={isPlaying ? 'Atsaharo kely (Pause)' : 'Alefaso ny hira (Play)'}
        >
          {/* Subtle spinning vinyl ring inside */}
          {isPlaying && (
            <div className="absolute inset-0.5 rounded-full border border-dashed border-black/25 animate-spin [animation-duration:4s] pointer-events-none" />
          )}

          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current relative z-10" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5 relative z-10" />
          )}
        </button>

        {/* Small Team Badge Pill on the floating button */}
        <span
          onClick={openMusicChamp}
          className={`absolute -bottom-1 -right-1 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border border-white shadow-xs cursor-pointer ${teamStyle.bg} ${teamStyle.text}`}
          title={currentSong.teamId.toUpperCase()}
        >
          {currentSong.teamId.slice(0, 3)}
        </span>
      </div>
    </aside>
  );
};
