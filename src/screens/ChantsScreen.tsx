import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Music,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Star,
  MoreVertical,
  Clock,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  X,
  FileAudio,
  Check,
  Download,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Song, TeamId } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAudioPlayer } from '../context/AudioPlayerContext.tsx';

interface TeamSquircleItem {
  id: string;
  name: string;
  subName?: string;
  color: string;
  iconBg: string;
}

const teamsSquircleList: TeamSquircleItem[] = [
  { id: 'all', name: 'Tous', color: '#0B2545', iconBg: '#0B2545' },
  { id: 'asafa', name: 'ASAFA', subName: 'TOLIARA', color: '#1D63D8', iconBg: '#1D63D8' },
  { id: 'tomima', name: 'TOMIMA', color: '#F97316', iconBg: '#F97316' },
  { id: 'mpiantsa', name: 'MPIANTSA', color: '#10B981', iconBg: '#10B981' },
  { id: 'soalia', name: 'SOALIA', color: '#9333EA', iconBg: '#9333EA' },
  { id: 'fiaram', name: 'FIARAM', color: '#0B2545', iconBg: '#0B2545' },
  { id: 'fiaram-toliara', name: 'FIARAM', subName: 'TOLIARA', color: '#CA8A04', iconBg: '#CA8A04' },
];

const categoryPillsList = ['Tous', 'Louange', 'Adoration', 'Noël', 'Offrande', 'Invocation'];

const teamColorStyles: Record<string, { squircleBg: string; pillBg: string; pillText: string; label: string }> = {
  tomima: { squircleBg: 'bg-[#F97316]', pillBg: 'bg-orange-100', pillText: 'text-orange-700', label: 'TOMIMA' },
  soalia: { squircleBg: 'bg-[#8B5CF6]', pillBg: 'bg-purple-100', pillText: 'text-purple-700', label: 'SOALIA' },
  mpiantsa: { squircleBg: 'bg-[#10B981]', pillBg: 'bg-emerald-100', pillText: 'text-emerald-700', label: 'MPIANTSA' },
  asafa: { squircleBg: 'bg-[#2563EB]', pillBg: 'bg-blue-100', pillText: 'text-blue-700', label: 'ASAFA TOLIARA' },
  all: { squircleBg: 'bg-[#0B2545]', pillBg: 'bg-slate-100', pillText: 'text-slate-700', label: 'FIARAM' },
  fiaram: { squircleBg: 'bg-[#4F46E5]', pillBg: 'bg-indigo-100', pillText: 'text-indigo-700', label: 'FIARAM' },
  'fiaram-toliara': { squircleBg: 'bg-[#CA8A04]', pillBg: 'bg-amber-100', pillText: 'text-amber-700', label: 'FIARAM TOLIARA' },
};

const categoryBadgeStyles: Record<string, { bg: string; text: string }> = {
  Adoration: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Invocation: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  Louange: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Noël: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Offrande: { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Hira Faneva': { bg: 'bg-blue-100', text: 'text-blue-700' },
  Fiderana: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Fanoloran_tena: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Vavaka: { bg: 'bg-sky-100', text: 'text-sky-700' },
};

export const ChantsScreen: React.FC = () => {
  const { user, role, teamId } = useAuth();
  const { t } = useLanguage();
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    openMusicChamp,
  } = useAudioPlayer();

  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);

  // Favorites state for icons
  const [favoriteIds, setFavoriteIds] = useState<Record<string, boolean>>({
    'sng-img-3': true, // Ho an'ny Tompo has yellow star in screenshot
  });

  // Modal for Admin/President Add & Edit
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formTeamId, setFormTeamId] = useState<TeamId | 'all'>('tomima');
  const [formCategory, setFormCategory] = useState<string>('Adoration');
  const [formNumber, setFormNumber] = useState<string>('');
  const [formKeySignature, setFormKeySignature] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('');
  const [formLyrics, setFormLyrics] = useState<string>('');
  const [formAudioUrl, setFormAudioUrl] = useState<string>('');
  const [formDuration, setFormDuration] = useState<string>('5:00');

  // File upload state for Admin
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const data = await api.getSongs();
      setSongs(data);
    } catch (err) {
      console.error('Failed to load songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const canManageSong = (song?: Song) => {
    if (role === 'admin') return true;
    if (role === 'president') {
      if (!song) return true;
      return song.teamId === teamId || song.teamId === 'all';
    }
    return false;
  };

  const handleOpenAdd = () => {
    setEditingSongId(null);
    setFormTitle('');
    setFormTeamId(role === 'president' && teamId ? teamId : 'tomima');
    setFormCategory('Adoration');
    setFormNumber('');
    setFormKeySignature('');
    setFormAuthor(user?.name || '');
    setFormLyrics('');
    setFormAudioUrl('/uploads/hymn-tomima.wav');
    setFormDuration('5:00');
    setUploadSuccess(false);
    setUploadedFileName('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (s: Song) => {
    setEditingSongId(s.id);
    setFormTitle(s.title);
    setFormTeamId(s.teamId);
    setFormCategory(s.category);
    setFormNumber(s.number || '');
    setFormKeySignature(s.keySignature || '');
    setFormAuthor(s.author);
    setFormLyrics(s.lyrics);
    setFormAudioUrl(s.audioUrl || '');
    setFormDuration(s.duration || '5:00');
    setUploadSuccess(false);
    setUploadedFileName('');
    setIsEditorOpen(true);
  };

  // Real Audio file upload by Admin
  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);
    try {
      const res = await api.uploadMedia(file);
      setFormAudioUrl(res.url);
      setUploadedFileName(file.name);
      setUploadSuccess(true);

      const tempAudio = new Audio(res.url);
      tempAudio.addEventListener('loadedmetadata', () => {
        if (tempAudio.duration) {
          const m = Math.floor(tempAudio.duration / 60);
          const s = Math.floor(tempAudio.duration % 60);
          setFormDuration(`${m}:${s < 10 ? '0' : ''}${s}`);
        }
      });
    } catch (err: any) {
      alert(err.message || 'Tsy nahomby ny fampidirana feon-kira');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formTitle.trim(),
        teamId: formTeamId,
        category: formCategory.trim() || 'Adoration',
        number: formNumber.trim(),
        keySignature: formKeySignature.trim(),
        author: formAuthor.trim() || user?.name || 'ASAFA',
        lyrics: formLyrics.trim(),
        audioUrl: formAudioUrl || null,
        duration: formDuration || '5:00',
      };

      if (editingSongId) {
        await api.updateSong(editingSongId, payload);
      } else {
        await api.createSong(payload);
      }
      setIsEditorOpen(false);
      await loadSongs();
    } catch (err: any) {
      alert(err.message || 'Error saving song');
    }
  };

  const handleDeleteSong = async (id: string, title: string) => {
    if (!confirm(`Tena hofafana ve ny hira "${title}" ?`)) return;
    try {
      await api.deleteSong(id);
      loadSongs();
    } catch (err: any) {
      alert(err.message || 'Error deleting song');
    }
  };

  // Clicking any song card plays it and opens the right screen (Music Champ)!
  const handleCardClick = (song: Song) => {
    playSong(song, true);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter songs
  const filteredSongs = songs
    .filter(song => {
      // Team filter
      if (selectedTeam !== 'all') {
        if (selectedTeam === 'fiaram' || selectedTeam === 'fiaram-toliara') {
          if (song.teamId !== 'all') return false;
        } else if (song.teamId !== selectedTeam && song.teamId !== 'all') {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'Tous') {
        const catLower = song.category.toLowerCase();
        const selLower = selectedCategory.toLowerCase();
        if (!catLower.includes(selLower)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = song.title.toLowerCase().includes(q);
        const matchLyrics = song.lyrics.toLowerCase().includes(q);
        const matchAuthor = song.author.toLowerCase().includes(q);
        if (!matchTitle && !matchLyrics && !matchAuthor) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.title.localeCompare(b.title);
      return b.title.localeCompare(a.title);
    });

  // Next / Previous song handlers for the mini player
  const handleNextSong = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (filteredSongs.length === 0) return;
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong?.id);
    const nextSong = filteredSongs[(currentIndex + 1) % filteredSongs.length];
    playSong(nextSong, false);
  };

  const handlePrevSong = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (filteredSongs.length === 0) return;
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + filteredSongs.length) % filteredSongs.length;
    const prevSong = filteredSongs[prevIndex];
    playSong(prevSong, false);
  };

  const selectedTeamName =
    teamsSquircleList.find(t => t.id === selectedTeam)?.name || 'Tous';

  return (
    <div className="flex-1 flex flex-col bg-[#F5F8FC] min-h-full select-none relative">
      {/* ========================================================
          1. TOP HEADER (Matching Left Screen of Screenshot)
          "Chants" in Serif + "Bibliothèque : Tous"
          Right: Search Icon Button + Menu Icon Button
          ======================================================== */}
      <div className="px-5 pt-4 pb-2 bg-[#F5F8FC]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-black text-[#0B2545] tracking-tight leading-none">
              Chants
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Bibliothèque :{' '}
              <span className="text-[#1D63D8] font-bold">
                {selectedTeamName}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Icon Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              title="Fikarohana (Recherche)"
            >
              <Search className="w-5 h-5 text-slate-700" />
            </button>

            {/* Menu Icon Button (Dark Navy circle with 3 lines) */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="w-10 h-10 rounded-full bg-[#0B2545] hover:bg-[#071933] active:scale-95 flex items-center justify-center text-white shadow-sm transition-all cursor-pointer"
              title={canManageSong() ? 'Hampiditra Hira Vaovao' : 'Menu'}
            >
              {canManageSong() ? (
                <Plus className="w-5 h-5 text-white" />
              ) : (
                <div className="space-y-1">
                  <div className="w-4 h-0.5 bg-white rounded-full" />
                  <div className="w-4 h-0.5 bg-white rounded-full" />
                  <div className="w-4 h-0.5 bg-white rounded-full" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <div className="mt-3 relative animate-in fade-in slide-in-from-top-2 duration-200">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Mitadiava hira, tononkira..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D63D8] shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          2. TEAM SELECTOR SQUIRCLE CAROUSEL (Matching Screenshot)
          [★ Tous] | [ASAFA TOLIARA] | [TOMIMA] | [MPIANTSA] | [SOALIA] | [FIARAM]
          ======================================================== */}
      <div className="px-5 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2.5 shrink-0">
        {teamsSquircleList.map(item => {
          const isSelected = selectedTeam === item.id;

          if (item.id === 'all') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedTeam(item.id)}
                className={`w-[66px] h-[76px] rounded-2xl flex flex-col items-center justify-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-[#0B2545] text-white ring-2 ring-blue-900/30'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-bold">Tous</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedTeam(item.id)}
              className={`w-[66px] h-[76px] rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs p-1 text-center ${
                isSelected
                  ? 'bg-[#0B2545] text-white ring-2 ring-blue-900/30 border-transparent'
                  : 'bg-white text-slate-800 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {/* Circular Team Emblem */}
              <div
                style={{ backgroundColor: item.iconBg }}
                className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-2xs mb-1"
              >
                <Music className="w-4 h-4 text-white" />
              </div>

              <span className="text-[10px] font-extrabold leading-tight tracking-tight">
                {item.name}
              </span>
              {item.subName && (
                <span className={`text-[7px] font-bold leading-none uppercase ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                  {item.subName}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. CATEGORY PILLS ROW (Matching Screenshot)
          [Tous] [Louange] [Adoration] [Noël] [Offrande] [Invocation] + Filter icon
          ======================================================== */}
      <div className="px-5 py-1.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categoryPillsList.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B2545] text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200/80 font-semibold hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter Sliders Icon */}
        <button
          type="button"
          onClick={() => {
            // Cycle category or reset
            setSelectedCategory('Tous');
            setSelectedTeam('all');
          }}
          className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0 hover:bg-slate-50 cursor-pointer shadow-2xs"
          title="Avereno ny sivana rehetra"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ========================================================
          4. COUNTER & SORT SUB-BAR (Matching Screenshot)
          "🎵 142 chants" on left | "A -> Z ⌵" on right
          ======================================================== */}
      <div className="px-5 pt-2 pb-1.5 flex items-center justify-between text-xs text-slate-400 font-medium shrink-0">
        <div className="flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-slate-400" />
          <span>{filteredSongs.length} chants</span>
        </div>

        <button
          type="button"
          onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
        >
          <span>{sortOrder === 'asc' ? 'A → Z' : 'Z → A'}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ========================================================
          5. SONG CARDS LIST (Matching Left Screen in Screenshot)
          Squircle colored icon | Title + Tags (Category & Team) + Clock Duration | Icons
          ======================================================== */}
      <div className="flex-1 overflow-y-auto px-5 space-y-2.5 pb-24">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#1D63D8]" />
            <span>Eo am-pametrahana ny hira...</span>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-500 border border-slate-200/80 space-y-2 shadow-2xs">
            <Music className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold">Tsy misy hira mifanaraka amin'ny sivana.</p>
            <p className="text-[11px] text-slate-400">Andramo esorina ny sivana na tsindrio ny "Tous".</p>
          </div>
        ) : (
          filteredSongs.map(song => {
            const teamStyle = teamColorStyles[song.teamId] || teamColorStyles.all;
            const catStyle = categoryBadgeStyles[song.category] || { bg: 'bg-blue-100', text: 'text-blue-700' };
            const isFav = favoriteIds[song.id];
            const isPlayingThis = currentSong?.id === song.id && isPlaying;

            return (
              <div
                key={song.id}
                onClick={() => handleCardClick(song)}
                className={`bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] ${
                  currentSong?.id === song.id ? 'ring-2 ring-blue-500/20 border-blue-200' : ''
                }`}
              >
                {/* Left Side: Squircle colored icon + Song details */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Vibrant Rounded Squircle with Music Note */}
                  <div
                    className={`w-12 h-12 rounded-2xl ${teamStyle.squircleBg} flex items-center justify-center text-white shrink-0 shadow-sm relative`}
                  >
                    <Music className="w-6 h-6 stroke-[2]" />
                    {isPlayingThis && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-ping" />
                    )}
                  </div>

                  {/* Title and Badges */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 truncate leading-tight group-hover:text-[#1D63D8] transition-colors">
                      {song.title}
                    </h3>

                    {/* Tags row: Category Pill + Team Pill */}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}
                      >
                        {song.category}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${teamStyle.pillBg} ${teamStyle.pillText}`}
                      >
                        {teamStyle.label}
                      </span>
                    </div>

                    {/* Clock + Duration + Document Icon */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{song.duration || '4:30'}</span>
                      <FileText className="w-3 h-3 text-slate-400 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Right Side Action: Star or Download or MoreVertical */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Yellow Star if favorited */}
                  {isFav ? (
                    <button
                      type="button"
                      onClick={e => toggleFavorite(song.id, e)}
                      className="p-1 text-amber-400 hover:text-amber-500 cursor-pointer"
                      title="Voatahiry"
                    >
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </button>
                  ) : song.id === 'sng-img-5' ? (
                    /* Download icon as seen on "Ny Fahasoavanao" in screenshot */
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        alert('Voatahiry ao amin\'ny fitaovanao ity hira ity!');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Ampidino"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    /* 3 vertical dots icon as seen in screenshot */
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        if (canManageSong(song)) {
                          handleOpenEdit(song);
                        } else {
                          toggleFavorite(song.id, e);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={canManageSong(song) ? 'Hanova' : 'Safidy'}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete button for Admin */}
                  {canManageSong(song) && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteSong(song.id, song.title);
                      }}
                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hamafa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          6. FLOATING MINI-PLAYER DOCK (Matching Left Screen in Screenshot)
          Docked above bottom nav: Dark navy background | Album art | Title & Team | SkipBack Play SkipForward
          ======================================================== */}
      {currentSong && (
        <aside
          aria-label="Mini-lecteur audio"
          onClick={openMusicChamp}
          className="fixed bottom-[58px] left-3 right-3 sm:left-auto sm:right-auto sm:w-[390px] z-30 bg-[#0B2545] text-white rounded-2xl p-2.5 px-3.5 shadow-2xl flex items-center justify-between cursor-pointer border border-blue-900/40 select-none animate-in slide-in-from-bottom-2 duration-200 pointer-events-auto"
        >
          {/* Left: Vinyl disc artwork */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 to-blue-950 border border-white/30 flex items-center justify-center shrink-0 relative overflow-hidden shadow-sm">
              <div
                className={`w-full h-full rounded-full border border-dashed border-white/40 flex items-center justify-center ${
                  isPlaying ? 'animate-spin [animation-duration:6s]' : ''
                }`}
              >
                <Music className="w-4 h-4 text-white" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute border border-white" />
            </div>

            {/* Middle: Title & Team */}
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-white truncate leading-tight">
                {currentSong.title}
              </h4>
              <p className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider truncate">
                {currentSong.teamId}
              </p>
            </div>
          </div>

          {/* Right: Media Controls (SkipBack, Circular White Play/Pause, SkipForward) */}
          <div
            className="flex items-center gap-2 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            {/* Previous track */}
            <button
              type="button"
              onClick={handlePrevSong}
              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white cursor-pointer active:scale-95"
              title="Hira teo aloha"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Circular White Play/Pause Button */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-8 h-8 rounded-full bg-white text-[#0B2545] flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next track */}
            <button
              type="button"
              onClick={handleNextSong}
              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white cursor-pointer active:scale-95"
              title="Hira manaraka"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </aside>
      )}

      {/* ========================================================
          7. ADMIN / PRESIDENT ADD & EDIT MODAL (With Real Audio Upload)
          ======================================================== */}
      {isEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative max-h-[92vh]">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                <Music className="w-4 h-4 text-amber-300" />
                <span>{editingSongId ? 'Hanova Hira' : 'Hampiditra Hira Vaovao'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSong} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lohatenin'ny Hira *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Lohateny (oh: Andriamanitra Tsara)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1D63D8] text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ekipa
                  </label>
                  <select
                    value={formTeamId}
                    onChange={e => setFormTeamId(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-bold"
                  >
                    <option value="tomima">TOMIMA</option>
                    <option value="soalia">SOALIA</option>
                    <option value="mpiantsa">MPIANTSA</option>
                    <option value="asafa">ASAFA TOLIARA</option>
                    <option value="all">FIARAM (Iombonana)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sokajy
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option value="Adoration">Adoration</option>
                    <option value="Louange">Louange</option>
                    <option value="Invocation">Invocation</option>
                    <option value="Noël">Noël</option>
                    <option value="Offrande">Offrande</option>
                    <option value="Hira Faneva">Hira Faneva</option>
                    <option value="Vavaka">Vavaka</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Laharana
                  </label>
                  <input
                    type="text"
                    value={formNumber}
                    onChange={e => setFormNumber(e.target.value)}
                    placeholder="TOM-05, SOA-12..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Faharetana (Durée)
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                    placeholder="5:03, 4:21..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Real Audio Upload section */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-[#0B2545] flex items-center gap-1.5">
                    <FileAudio className="w-4 h-4 text-[#1D63D8]" />
                    <span>Feon-kira Tena Izy (Audio MP3)</span>
                  </label>
                  <span className="text-[10px] bg-blue-200 text-[#0B2545] font-bold px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*,.mp3,.wav,.m4a"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full bg-white hover:bg-slate-50 border border-blue-300 text-[#0B2545] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D63D8]" />
                      <span>Mampakatra...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-[#1D63D8]" />
                      <span>Safidio ny rakitra audio (MP3 / WAV)</span>
                    </>
                  )}
                </button>

                {uploadSuccess && (
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Tafakatra: {uploadedFileName}</span>
                  </div>
                )}
              </div>

              {/* Full Lyrics */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tononkira feno *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formLyrics}
                  onChange={e => setFormLyrics(e.target.value)}
                  placeholder="Soraty eto ny tononkira..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-serif focus:ring-2 focus:ring-[#1D63D8] text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0B2545] hover:bg-[#071933] text-white font-bold py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
