import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarDays,
  MapPin,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Trash2,
  X,
  FileText,
  Heart,
  Share2,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Clock,
  CheckCircle2,
  Bookmark,
  MoreVertical,
  ThumbsUp,
  Flame,
  Award,
  Upload,
  Camera,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Programme, TeamId } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { AsafaLogo } from '../components/AsafaLogo.tsx';

// Predefined creative background styles for social feed posts
const BACKGROUND_STYLES = [
  {
    id: 'classic',
    name: 'Fotsy Madio (Blanc)',
    class: 'bg-white border-slate-200 text-slate-800',
    headerText: 'text-slate-800',
    bodyText: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    isDark: false,
  },
  {
    id: 'gradient-blue',
    name: 'Manga ASAFA (Bleu Royal)',
    class: 'bg-gradient-to-br from-[#0F397A] via-[#164CA1] to-[#1E60CC] text-white border-transparent shadow-md',
    headerText: 'text-white',
    bodyText: 'text-blue-50 font-medium',
    badge: 'bg-white/20 text-white border border-white/30',
    isDark: true,
  },
  {
    id: 'gradient-sunset',
    name: 'Masoandro Mibaliaka (Sunset)',
    class: 'bg-gradient-to-br from-[#831843] via-[#BE185D] to-[#F59E0B] text-white border-transparent shadow-md',
    headerText: 'text-white',
    bodyText: 'text-amber-50 font-medium',
    badge: 'bg-white/20 text-white border border-white/30',
    isDark: true,
  },
  {
    id: 'gradient-purple',
    name: 'Volomparasy Kanto (Violet Royal)',
    class: 'bg-gradient-to-br from-[#31104B] via-[#581C87] to-[#7E22CE] text-white border-transparent shadow-md',
    headerText: 'text-white',
    bodyText: 'text-purple-50 font-medium',
    badge: 'bg-white/20 text-white border border-white/30',
    isDark: true,
  },
  {
    id: 'gradient-emerald',
    name: 'Maitso Vaovao (Émeraude)',
    class: 'bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#10B981] text-white border-transparent shadow-md',
    headerText: 'text-white',
    bodyText: 'text-emerald-50 font-medium',
    badge: 'bg-white/20 text-white border border-white/30',
    isDark: true,
  },
  {
    id: 'solid-dark',
    name: 'Alina Manga (Dark Navy)',
    class: 'bg-[#0B1E3B] text-white border-blue-900/50 shadow-md',
    headerText: 'text-white',
    bodyText: 'text-slate-200 font-medium',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-400/30',
    isDark: true,
  },
];

// Curated high quality presets for post images
const PRESET_IMAGES = [
  { label: 'Fivoriambe / Kolontsaina', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80' },
  { label: 'Fiderana am-bavaka', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=900&auto=format&fit=crop&q=80' },
  { label: 'Tanora mavitrika', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80' },
  { label: 'Fampirantiana & Fety', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&auto=format&fit=crop&q=80' },
  { label: 'Biraom-panjakana / Lapa', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=900&auto=format&fit=crop&q=80' },
];

const EMOJI_OPTIONS = [
  { emoji: '❤️', label: 'Tia' },
  { emoji: '👍', label: 'Mankasitraka' },
  { emoji: '🙏', label: 'Mivavaka' },
  { emoji: '🔥', label: 'Mavitrika' },
  { emoji: '👏', label: 'Mitehaka' },
];

export const ProgrammeScreen: React.FC = () => {
  const { user, role, teamId } = useAuth();
  const { t } = useLanguage();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // New publication modal (Admin only)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formTeamId, setFormTeamId] = useState<TeamId | 'all'>('all');
  const [formEventDate, setFormEventDate] = useState<string>('');
  const [formEventLocation, setFormEventLocation] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formBackgroundStyle, setFormBackgroundStyle] = useState<string>('classic');

  // Device image upload states (Admin uploading photo from device/mobile/PC)
  const [deviceImageFile, setDeviceImageFile] = useState<File | null>(null);
  const [deviceImagePreview, setDeviceImagePreview] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [showUrlOptions, setShowUrlOptions] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Sary (PNG, JPG, WEBP, GIF...) ihany no azo ampidirina.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert('Lehibe loatra ny sary. Tsy tokony hihoatra ny 25MB azafady.');
      return;
    }
    if (deviceImagePreview) {
      URL.revokeObjectURL(deviceImagePreview);
    }
    setDeviceImageFile(file);
    setDeviceImagePreview(URL.createObjectURL(file));
    setFormImageUrl(''); // prioritize local file
  };

  const handleDeviceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const clearDeviceImage = () => {
    if (deviceImagePreview) {
      URL.revokeObjectURL(deviceImagePreview);
    }
    setDeviceImageFile(null);
    setDeviceImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setFormEventDate('');
    setFormEventLocation('');
    setFormImageUrl('');
    setFormBackgroundStyle('classic');
    clearDeviceImage();
  };

  // Expanded comment sections per post
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  // Reaction picker state
  const [openReactionPicker, setOpenReactionPicker] = useState<string | null>(null);

  // Bookmarks / Saved posts local state
  const [savedPosts, setSavedPosts] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('asafa_saved_programmes') || '[]');
    } catch {
      return [];
    }
  });

  const toggleSavePost = (id: string) => {
    setSavedPosts(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('asafa_saved_programmes', JSON.stringify(next));
      return next;
    });
  };

  const loadProgrammes = async () => {
    setLoading(true);
    try {
      const data = await api.getProgrammes(selectedTeam !== 'all' ? selectedTeam : undefined);
      setProgrammes(data);
    } catch (err) {
      console.error('Failed to load programmes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgrammes();
  }, [selectedTeam]);

  // User explicitly instructed: "only admin can do that i ean can publish"
  const canPublish = role === 'admin';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) {
      alert('Ny Mpitantana (Admin) ihany no afaka mamoaka fandaharana.');
      return;
    }

    setIsSubmittingPost(true);
    try {
      let finalImageUrl: string | null = formImageUrl.trim() || null;

      // If user selected an image file from device, upload it first!
      if (deviceImageFile) {
        const uploadResult = await api.uploadMedia(deviceImageFile);
        finalImageUrl = uploadResult.url;
      }

      await api.createProgramme({
        title: formTitle,
        description: formDescription,
        teamId: formTeamId,
        eventDate: formEventDate || null,
        eventLocation: formEventLocation || null,
        imageUrl: finalImageUrl,
        backgroundStyle: formBackgroundStyle,
      });

      resetForm();
      loadProgrammes();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la publication');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tena hofafana ve ity fandaharana / publication ity ?')) return;
    try {
      await api.deleteProgramme(id);
      loadProgrammes();
    } catch (err: any) {
      alert(err.message || 'Error deleting programme');
    }
  };

  const handleAddComment = async (programmeId: string) => {
    const text = commentInputs[programmeId]?.trim();
    if (!text) return;

    setSubmittingComment(programmeId);
    try {
      await api.addProgrammeComment(programmeId, text);
      setCommentInputs(prev => ({ ...prev, [programmeId]: '' }));
      // Ensure comments section is opened
      setExpandedComments(prev => ({ ...prev, [programmeId]: true }));
      loadProgrammes();
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleReact = async (programmeId: string, emoji: string) => {
    setOpenReactionPicker(null);
    try {
      const res = await api.reactToProgramme(programmeId, emoji);
      // Optimistically update
      setProgrammes(prev =>
        prev.map(p => {
          if (p.id !== programmeId) return p;
          return {
            ...p,
            reactions: res.reactions,
          };
        })
      );
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  const getUserReaction = (prog: Programme) => {
    if (!user || !prog.reactions) return null;
    return prog.reactions.find(r => r.userId === user.id)?.emoji || null;
  };

  const getStyleObj = (styleId?: string | null) => {
    return BACKGROUND_STYLES.find(s => s.id === styleId) || BACKGROUND_STYLES[0];
  };

  const formatPostTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Vao teo';
    if (diffHours < 24) return `${diffHours}h lasa`;
    if (diffDays < 7) return `${diffDays}j lasa`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden relative">
      {/* ==================================================== */}
      {/* 1. TOP HEADER: DEEP NAVY BLUE ROUNDED CONTAINER      */}
      {/* ==================================================== */}
      <div className="bg-[#163F8A] rounded-b-[36px] px-5 pt-4 pb-6 shadow-md shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AsafaLogo className="w-11 h-11 shrink-0" size={44} />
            <div>
              <span className="text-blue-100 text-[11px] font-medium tracking-wide block">
                Fandaharana & Vaovao
              </span>
              <h1 className="font-serif text-2xl font-bold text-white tracking-tight -mt-0.5">
                Filazam-baovao
              </h1>
            </div>
          </div>

          {/* Admin Publish Button */}
          {canPublish && (
            <button
              onClick={() => {
                setFormTeamId('all');
                setIsModalOpen(true);
              }}
              className="bg-white/15 hover:bg-white/25 active:scale-95 text-white px-3.5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 border border-white/20 shadow-xs transition-all cursor-pointer backdrop-blur-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Hamoaka</span>
            </button>
          )}
        </div>

        {/* Team Filter Pills (Social Media style) */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Rehetra' },
            { id: 'asafa', label: 'ASAFA' },
            { id: 'soalia', label: 'SOALIA' },
            { id: 'mpiantsa', label: 'MPIANTSA' },
            { id: 'tomima', label: 'TOMIMA' },
          ].map(tab => {
            const isActive = selectedTeam === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTeam(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#163F8A] shadow-sm font-black'
                    : 'bg-white/15 text-white/90 hover:bg-white/25 border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Quick Post Banner if admin */}
      {canPublish && (
        <div className="px-4 pt-3 shrink-0">
          <div
            onClick={() => {
              setFormTeamId('all');
              setIsModalOpen(true);
            }}
            className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex items-center gap-3 cursor-pointer hover:border-blue-400 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-[#163F8A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 bg-slate-50 rounded-full px-4 py-2 text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
              Mizarà fandaharana, fampahafantarana na sary vaovao...
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormTeamId('all');
                  setIsModalOpen(true);
                  setTimeout(() => fileInputRef.current?.click(), 120);
                }}
                title="Hampiditra sary avy amin'ny fitaovana"
                className="p-1.5 rounded-full hover:bg-blue-50 text-[#163F8A] transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormTeamId('all');
                  setIsModalOpen(true);
                }}
                title="Hanova loko fototra"
                className="p-1.5 rounded-full hover:bg-slate-100 text-amber-500 cursor-pointer"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. SOCIAL MEDIA FEED (POST CARDS)                    */}
      {/* ==================================================== */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <div className="w-7 h-7 border-3 border-[#163F8A] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Maka ireo fandaharana...</span>
          </div>
        ) : programmes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200/80 shadow-xs space-y-2 mt-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#163F8A] mx-auto flex items-center justify-center">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Tsy misy fandaharana amin'izao</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Ireo vaovao na fandaharana avoakan'ny Mpitantana (Admin) dia hiseho eto.
            </p>
          </div>
        ) : (
          programmes.map(prog => {
            const style = getStyleObj(prog.backgroundStyle);
            const userReaction = getUserReaction(prog);
            const reactionsCount = prog.reactions?.length || 0;
            const commentsCount = prog.comments?.length || 0;
            const isCommentsExpanded = expandedComments[prog.id] || false;
            const isSaved = savedPosts.includes(prog.id);

            // Group reactions by emoji
            const reactionsSummary: Record<string, number> = {};
            prog.reactions?.forEach(r => {
              reactionsSummary[r.emoji] = (reactionsSummary[r.emoji] || 0) + 1;
            });

            return (
              <article
                key={prog.id}
                className={`rounded-3xl border transition-all overflow-hidden ${style.class} ${
                  style.isDark ? 'shadow-md' : 'shadow-xs border-slate-200/90'
                }`}
              >
                {/* 1. Post Header: Author, Team badge, Timestamp, Admin Menu */}
                <div className="p-4 pb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#163F8A] font-black text-sm flex items-center justify-center border-2 border-white/80 shadow-xs">
                        {prog.authorName[0]}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#163F8A] text-white flex items-center justify-center text-[9px] border border-white">
                        ✓
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className={`font-black text-xs leading-tight ${style.headerText}`}>
                          {prog.authorName}
                        </h4>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${style.badge}`}>
                          {prog.teamId}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] mt-0.5 ${
                        style.isDark ? 'text-white/70' : 'text-slate-400'
                      }`}>
                        <span className="capitalize font-semibold">{prog.authorRole}</span>
                        <span>•</span>
                        <Clock className="w-2.5 h-2.5 inline" />
                        <span>{formatPostTime(prog.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Admin delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSavePost(prog.id)}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        style.isDark ? 'hover:bg-white/20 text-white/80' : 'hover:bg-slate-100 text-slate-400'
                      }`}
                      title={isSaved ? 'Voatahiry' : 'Tehirizo'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {canPublish && (
                      <button
                        onClick={() => handleDelete(prog.id)}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${
                          style.isDark
                            ? 'hover:bg-rose-500/30 text-rose-300'
                            : 'hover:bg-rose-50 text-slate-300 hover:text-rose-500'
                        }`}
                        title="Fafao ity publication ity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Post Title & Description Body */}
                <div className="px-4 pb-3 space-y-2">
                  <h3 className={`font-serif text-base font-bold leading-snug tracking-tight ${style.headerText}`}>
                    {prog.title}
                  </h3>
                  <p className={`text-xs whitespace-pre-line leading-relaxed ${style.bodyText}`}>
                    {prog.description}
                  </p>
                </div>

                {/* 3. Event metadata badge (Date & Location) */}
                {(prog.eventDate || prog.eventLocation) && (
                  <div className="px-4 pb-3">
                    <div className={`rounded-2xl p-2.5 flex flex-wrap gap-3 text-xs ${
                      style.isDark
                        ? 'bg-black/25 backdrop-blur-xs border border-white/10 text-white'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-700'
                    }`}>
                      {prog.eventDate && (
                        <div className="flex items-center gap-1.5 font-bold text-[11px]">
                          <CalendarDays className={`w-3.5 h-3.5 ${style.isDark ? 'text-amber-300' : 'text-[#163F8A]'}`} />
                          <span>{new Date(prog.eventDate).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      )}
                      {prog.eventLocation && (
                        <div className="flex items-center gap-1.5 font-medium text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{prog.eventLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Attached Image (Social media style photo post) */}
                {prog.imageUrl && (
                  <div className="w-full max-h-80 overflow-hidden bg-black/10 relative">
                    <img
                      src={prog.imageUrl}
                      alt={prog.title}
                      className="w-full h-full object-cover max-h-80 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                      onClick={() => window.open(prog.imageUrl || '', '_blank')}
                      loading="lazy"
                    />
                  </div>
                )}

                {/* 5. Document Attachments */}
                {prog.attachments && prog.attachments.length > 0 && (
                  <div className="px-4 py-2 space-y-1.5">
                    {prog.attachments.map(att => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`rounded-2xl p-2.5 flex items-center justify-between text-xs font-semibold transition-all ${
                          style.isDark
                            ? 'bg-white/15 hover:bg-white/25 border border-white/20 text-white'
                            : 'bg-blue-50/70 hover:bg-blue-100 border border-blue-200 text-[#163F8A]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">{att.name}</span>
                        </div>
                        <span className="text-[10px] opacity-75 shrink-0 ml-2">Sokafy</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* 6. Reactions Summary Row (Icons count) */}
                {(reactionsCount > 0 || commentsCount > 0) && (
                  <div className={`px-4 py-2 flex items-center justify-between text-[11px] border-t ${
                    style.isDark ? 'border-white/10 text-white/80' : 'border-slate-100 text-slate-500'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {reactionsCount > 0 && (
                        <div className="flex items-center -space-x-1">
                          {Object.entries(reactionsSummary).map(([em, cnt]) => (
                            <span
                              key={em}
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-xs text-xs"
                              title={`${cnt} fanehoan-kevitra`}
                            >
                              {em}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="font-bold ml-1">
                        {reactionsCount} fanehoana
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedComments(prev => ({
                          ...prev,
                          [prog.id]: !prev[prog.id],
                        }))
                      }
                      className="hover:underline font-semibold"
                    >
                      {commentsCount} fanehoan-kevitra (commentaires)
                    </button>
                  </div>
                )}

                {/* 7. Action Bar: React, Comment, Share */}
                <div className={`px-3 py-1.5 border-t flex items-center justify-around relative ${
                  style.isDark ? 'border-white/10' : 'border-slate-100'
                }`}>
                  {/* Reaction Button with Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenReactionPicker(openReactionPicker === prog.id ? null : prog.id)
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        userReaction
                          ? 'text-rose-500 bg-rose-50 font-black'
                          : style.isDark
                          ? 'text-white/90 hover:bg-white/15'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {userReaction ? (
                        <span className="text-base leading-none">{userReaction}</span>
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                      <span>{userReaction ? 'Naneho hevitra' : 'Tiako'}</span>
                    </button>

                    {/* Emoji Picker Popup */}
                    {openReactionPicker === prog.id && (
                      <div className="absolute bottom-full left-0 mb-2 z-30 bg-white rounded-full shadow-2xl border border-slate-200 px-2 py-1.5 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        {EMOJI_OPTIONS.map(opt => (
                          <button
                            key={opt.emoji}
                            type="button"
                            onClick={() => handleReact(prog.id, opt.emoji)}
                            className="w-8 h-8 rounded-full hover:scale-125 hover:bg-slate-100 flex items-center justify-center text-lg transition-transform cursor-pointer"
                            title={opt.label}
                          >
                            {opt.emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comment Toggle Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedComments(prev => ({
                        ...prev,
                        [prog.id]: !prev[prog.id],
                      }))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      style.isDark ? 'text-white/90 hover:bg-white/15' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Haneho hevitra</span>
                  </button>

                  {/* Share button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: prog.title,
                          text: prog.description,
                        }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText?.(prog.title + '\n' + prog.description);
                        alert('Voakopaka ny rohy sy ny lahatsoratra!');
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      style.isDark ? 'text-white/90 hover:bg-white/15' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Hizara</span>
                  </button>
                </div>

                {/* 8. Comments Thread (Social media style) */}
                {(isCommentsExpanded || (prog.comments && prog.comments.length > 0)) && (
                  <div className={`p-4 pt-3 border-t space-y-3 ${
                    style.isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50/70 border-slate-100'
                  }`}>
                    {/* List of comments */}
                    {prog.comments && prog.comments.length > 0 ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {prog.comments.map(c => (
                          <div key={c.id} className="flex items-start gap-2.5 text-xs">
                            <div className="w-7 h-7 rounded-full bg-[#163F8A] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {c.authorName[0]}
                            </div>
                            <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xs">
                              <div className="flex items-center justify-between text-[11px] mb-0.5">
                                <span className="font-extrabold text-slate-800">{c.authorName}</span>
                                <span className="text-[10px] text-slate-400">
                                  {formatPostTime(c.createdAt)}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed text-[11px] whitespace-pre-wrap">
                                {c.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-[11px] italic text-center py-1 ${
                        style.isDark ? 'text-white/60' : 'text-slate-400'
                      }`}>
                        Mbola tsy misy fanehoan-kevitra. Aoka ianao ho voalohany!
                      </p>
                    )}

                    {/* Comment Input Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-7 h-7 rounded-full bg-[#163F8A] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        {user?.name?.[0] || 'M'}
                      </div>
                      <div className="flex-1 flex gap-1 bg-white border border-slate-300 rounded-full px-3 py-1.5 shadow-xs focus-within:ring-2 focus-within:ring-[#163F8A]">
                        <input
                          type="text"
                          value={commentInputs[prog.id] || ''}
                          onChange={e =>
                            setCommentInputs(prev => ({ ...prev, [prog.id]: e.target.value }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddComment(prog.id);
                          }}
                          placeholder="Manorata fanehoan-kevitra..."
                          className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(prog.id)}
                          disabled={submittingComment === prog.id || !commentInputs[prog.id]?.trim()}
                          className="text-[#163F8A] disabled:opacity-30 hover:scale-110 transition-transform cursor-pointer p-0.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* ==================================================== */}
      {/* 3. ADMIN PUBLICATION MODAL (Social Post Creator)     */}
      {/* ==================================================== */}
      {isModalOpen && canPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-[#163F8A] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-sm">Hamoaka Fandaharana Vaovao</h3>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreate} className="p-4 space-y-3.5 overflow-y-auto flex-1">
              {/* Author Tag */}
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-[#163F8A] text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{user?.name}</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold">Mpitantana (Admin) • Afaka mamoaka</span>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lohateny (Titre) *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ohatra: Fivoriambe lehibe, Fiofanana..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#163F8A] text-slate-800 focus:outline-none font-semibold"
                />
              </div>

              {/* Team Target */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ekipa kendrena
                </label>
                <select
                  value={formTeamId}
                  onChange={e => setFormTeamId(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="all">Ny Ekipa Rehetra (Iombonana)</option>
                  <option value="asafa">ASAFA</option>
                  <option value="soalia">SOALIA</option>
                  <option value="mpiantsa">MPIANTSA</option>
                  <option value="tomima">TOMIMA</option>
                </select>
              </div>

              {/* Choose Post Style / Background Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#163F8A]" />
                  <span>Endriky ny Publication (Loko fototra)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BACKGROUND_STYLES.map(st => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setFormBackgroundStyle(st.id)}
                      className={`h-12 rounded-xl p-1 text-[10px] font-bold border-2 transition-all flex items-center justify-center text-center cursor-pointer ${
                        st.class
                      } ${
                        formBackgroundStyle === st.id
                          ? 'border-[#163F8A] ring-2 ring-blue-400 scale-[1.03]'
                          : 'border-transparent opacity-85 hover:opacity-100'
                      }`}
                    >
                      <span className="truncate">{st.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload from Device (Admin Device Photo Picker) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#163F8A]" />
                    <span>Sary avy amin'ny fitaovana (Finday / Solosaina)</span>
                  </label>
                  {deviceImageFile && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Sary voasafidy
                    </span>
                  )}
                </div>

                {/* Hidden Native File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDeviceFileChange}
                  className="hidden"
                />

                {/* Device Upload Drag-Drop Box or Selected File Preview */}
                {!deviceImageFile && !deviceImagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      if (e.dataTransfer.files?.[0]) {
                        processSelectedFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      isDraggingOver
                        ? 'border-[#163F8A] bg-blue-100/70 scale-[1.01]'
                        : 'border-blue-200 hover:border-[#163F8A] bg-blue-50/50 hover:bg-blue-50/90'
                    }`}
                  >
                    <div className="w-11 h-11 mx-auto rounded-full bg-white shadow-xs flex items-center justify-center text-[#163F8A] mb-2 border border-blue-100">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Tsindrio hisafidianana sary avy amin'ny finday na solosainao
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Manohana JPG, PNG, WEBP, GIF (hatramin'ny 25MB)
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#163F8A] text-white text-[11px] font-bold shadow-xs hover:bg-[#123675] cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Hisafidy sary (Parcourir)</span>
                    </button>
                  </div>
                ) : (
                  <div className="border border-emerald-300 bg-emerald-50/50 rounded-2xl p-3 relative shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-300 shrink-0 bg-slate-900">
                        <img
                          src={deviceImagePreview!}
                          alt="Device preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate">{deviceImageFile?.name || 'Sary voafidy'}</span>
                        </div>
                        {deviceImageFile && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Habe: {formatFileSize(deviceImageFile.size)}
                          </p>
                        )}
                        <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          Hampiakarina avy hatrany rehefa tsindrina ny "Hamoaka"
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[10px] font-bold text-[#163F8A] bg-white rounded-lg border border-slate-200 hover:bg-slate-50 shadow-2xs cursor-pointer"
                        >
                          Hanova
                        </button>
                        <button
                          type="button"
                          onClick={clearDeviceImage}
                          className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-white rounded-lg border border-rose-200 hover:bg-rose-50 shadow-2xs cursor-pointer"
                        >
                          Esory
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alternative: URL / Preset images toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUrlOptions(!showUrlOptions)}
                    className="text-[10px] font-bold text-slate-500 hover:text-[#163F8A] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{showUrlOptions ? '▲ Afeno ny safidy rohy' : '▼ Na mampiasà rohin-tsary (URL) / sary modely'}</span>
                  </button>

                  {showUrlOptions && (
                    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <input
                        type="url"
                        value={formImageUrl}
                        onChange={e => {
                          setFormImageUrl(e.target.value);
                          if (e.target.value) clearDeviceImage();
                        }}
                        placeholder="https://... (rohin-tsary mivantana)"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#163F8A] text-slate-800 focus:outline-none"
                      />
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {PRESET_IMAGES.map((preset, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => {
                              clearDeviceImage();
                              setFormImageUrl(preset.url);
                            }}
                            className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                              formImageUrl === preset.url
                                ? 'bg-[#163F8A] text-white border-[#163F8A]'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      {formImageUrl && !deviceImageFile && (
                        <div className="h-20 rounded-lg overflow-hidden border border-slate-200">
                          <img src={formImageUrl} alt="Preview URL" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daty (raha hetsika)
                  </label>
                  <input
                    type="date"
                    value={formEventDate}
                    onChange={e => setFormEventDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Toerana
                  </label>
                  <input
                    type="text"
                    value={formEventLocation}
                    onChange={e => setFormEventLocation(e.target.value)}
                    placeholder="Lapan'ny Kolontsaina..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Content / Description textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lahatsoratra sy antsipiriany *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Soraty eto ny antsipirian'ny fandaharana..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#163F8A] text-slate-800 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  disabled={isSubmittingPost}
                  onClick={resetForm}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Aoka ihany (Annuler)
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className={`flex-1 bg-[#163F8A] hover:bg-[#123675] text-white font-bold py-2.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    isSubmittingPost ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmittingPost ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mampiakatra sary & Mamoaka...</span>
                    </>
                  ) : (
                    <span>Hamoaka (Publier)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
