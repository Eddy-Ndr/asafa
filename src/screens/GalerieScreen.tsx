import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Play,
  Trash2,
  X,
  Upload,
  Calendar,
  User as UserIcon,
  Layers,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { GalleryItem, TeamId } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

const teamCrests: Record<TeamId, { title: string; subtitle: string; bg: string; color: string; badgeBg: string }> = {
  soalia: {
    title: 'SOALIA',
    subtitle: 'Mpihira sy Mpidera',
    bg: 'from-blue-700 to-blue-900',
    color: '#1565C0',
    badgeBg: 'bg-blue-600',
  },
  mpiantsa: {
    title: 'MPIANTSA',
    subtitle: 'Antso ho an\'ny Firenena',
    bg: 'from-indigo-800 to-slate-900',
    color: '#0D47A1',
    badgeBg: 'bg-indigo-700',
  },
  tomima: {
    title: 'TOMIMA',
    subtitle: 'Herin\'ny Tanora',
    bg: 'from-sky-700 to-blue-900',
    color: '#1976D2',
    badgeBg: 'bg-sky-600',
  },
  asafa: {
    title: 'ASAFA',
    subtitle: 'Birao Foibe Mpandrindra',
    bg: 'from-blue-900 to-slate-950',
    color: '#0288D1',
    badgeBg: 'bg-blue-800',
  },
};

export const GalerieScreen: React.FC = () => {
  const { user, role, teamId } = useAuth();
  const { t } = useLanguage();

  // Selected team section ('all' or specific team)
  const [selectedTeam, setSelectedTeam] = useState<TeamId | 'landing'>('landing');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Lightbox preview
  const [activeMedia, setActiveMedia] = useState<GalleryItem | null>(null);

  // Upload modal
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCaption, setFormCaption] = useState<string>('');
  const [formTeamId, setFormTeamId] = useState<TeamId>('soalia');
  const [formMediaType, setFormMediaType] = useState<'photo' | 'video'>('photo');
  const [formMediaUrl, setFormMediaUrl] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const loadGallery = async (tId?: TeamId) => {
    setLoading(true);
    try {
      const data = await api.getGallery(tId);
      setItems(data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeam !== 'landing') {
      loadGallery(selectedTeam);
    }
  }, [selectedTeam]);

  const canUploadForTeam = (targetTeam: TeamId) => {
    if (role === 'admin') return true;
    if (role === 'president' && teamId === targetTeam) return true;
    return false;
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalUrl = formMediaUrl.trim();

      // If user selected a file to upload
      if (uploadFile) {
        const upRes = await api.uploadMedia(uploadFile);
        finalUrl = upRes.url;
      }

      if (!finalUrl) {
        alert('Ampidiro azafady ny rohy na safidio ny sary');
        setIsUploading(false);
        return;
      }

      await api.createGalleryItem({
        teamId: formTeamId,
        title: formTitle,
        caption: formCaption,
        mediaType: formMediaType,
        mediaUrl: finalUrl,
      });

      setIsUploadOpen(false);
      setFormTitle('');
      setFormCaption('');
      setFormMediaUrl('');
      setUploadFile(null);
      if (selectedTeam !== 'landing') {
        loadGallery(selectedTeam);
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading media');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Tena hofafana ve ity sary ity ?')) return;
    try {
      await api.deleteGalleryItem(id);
      if (activeMedia?.id === id) setActiveMedia(null);
      if (selectedTeam !== 'landing') {
        loadGallery(selectedTeam);
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting item');
    }
  };

  return (
    <div className="p-4 space-y-3 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 tracking-wide flex items-center gap-1.5">
            <ImageIcon className="w-5 h-5 text-[#1565C0]" />
            <span>{t('galerie_title')}</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            Sary sy horonantsary isaky ny ekipa
          </p>
        </div>

        {(role === 'admin' || role === 'president') && (
          <button
            onClick={() => {
              setFormTeamId(
                selectedTeam !== 'landing'
                  ? selectedTeam
                  : role === 'president' && teamId
                  ? teamId
                  : 'soalia'
              );
              setIsUploadOpen(true);
            }}
            className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ampidiro</span>
          </button>
        )}
      </div>

      {/* Landing: 4 Selectable Team Sections */}
      {selectedTeam === 'landing' ? (
        <div className="space-y-3 flex-1 overflow-y-auto">
          <p className="text-xs text-slate-500 font-medium">
            {t('select_team_gallery')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {(['soalia', 'mpiantsa', 'tomima', 'asafa'] as TeamId[]).map(tId => {
              const meta = teamCrests[tId];
              return (
                <div
                  key={tId}
                  onClick={() => setSelectedTeam(tId)}
                  className={`cursor-pointer rounded-2xl p-4 bg-gradient-to-br ${meta.bg} text-white shadow-md hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between min-h-[130px] relative overflow-hidden group`}
                >
                  <div className="relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm mb-2 shadow-xs">
                      {meta.title[0]}
                    </div>
                    <h3 className="font-extrabold text-sm tracking-wider uppercase leading-tight">
                      {meta.title}
                    </h3>
                    <p className="text-[10px] text-blue-200 mt-0.5 line-clamp-1 font-medium">
                      {meta.subtitle}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-[11px] font-bold text-blue-100 mt-2">
                    <span>Hijerena sary</span>
                    <span>→</span>
                  </div>

                  <div className="absolute -right-4 -bottom-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none group-hover:scale-125 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Team-specific Gallery Grid */
        <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
          {/* Back to landing + Team pill switcher */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTeam('landing')}
              className="text-xs font-bold text-[#1565C0] hover:underline flex items-center gap-1"
            >
              <span>← Ireo Ekipa rehetra</span>
            </button>
            <span className="text-xs font-black uppercase bg-blue-100 text-[#1565C0] px-2.5 py-0.5 rounded-full">
              Équipe {selectedTeam}
            </span>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">
                {t('loading')}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-500 border border-slate-200">
                Mbola tsy misy sary ao amin'ny ekipa {selectedTeam.toUpperCase()}.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setActiveMedia(item)}
                    className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 shadow-xs cursor-pointer flex flex-col relative transition-all"
                  >
                    <div className="aspect-square w-full bg-slate-100 relative overflow-hidden">
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                      {item.mediaType === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/90 text-[#1565C0] flex items-center justify-center shadow">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h4 className="font-extrabold text-xs text-slate-800 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {item.eventDate} • {item.authorName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative max-h-[85vh]">
            <div className="bg-[#1565C0] text-white p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-200">
                  Équipe {activeMedia.teamId}
                </span>
                <h3 className="font-extrabold text-xs truncate max-w-[240px]">
                  {activeMedia.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black flex items-center justify-center max-h-[50vh] overflow-hidden">
              <img
                src={activeMedia.mediaUrl}
                alt={activeMedia.title}
                className="w-full h-auto max-h-[50vh] object-contain"
              />
            </div>

            <div className="p-3 bg-white space-y-1 text-xs">
              <p className="text-slate-700 leading-relaxed font-medium">
                {activeMedia.caption || activeMedia.title}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Nampidiran'i: {activeMedia.authorName}</span>
                <span>{activeMedia.eventDate}</span>
              </div>
            </div>

            {/* Delete button if allowed */}
            {(role === 'admin' || (role === 'president' && activeMedia.teamId === teamId)) && (
              <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDeleteItem(activeMedia.id)}
                  className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 px-3 py-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Fafao ity sary ity</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative max-h-[90vh]">
            <div className="bg-[#1565C0] text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">{t('upload_media')}</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lohateny *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Lohatenin'ny sary..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#1565C0] text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ekipa *
                </label>
                <select
                  value={formTeamId}
                  onChange={e => setFormTeamId(e.target.value as TeamId)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800"
                >
                  <option value="soalia">SOALIA</option>
                  <option value="mpiantsa">MPIANTSA</option>
                  <option value="tomima">TOMIMA</option>
                  <option value="asafa">ASAFA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Safidio ny rakitra (Upload)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-[#1565C0] hover:file:bg-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Na rohy URL (Unsplash, sns)
                </label>
                <input
                  type="url"
                  value={formMediaUrl}
                  onChange={e => setFormMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fanamarihana / Légende
                </label>
                <textarea
                  rows={2}
                  value={formCaption}
                  onChange={e => setFormCaption(e.target.value)}
                  placeholder="Fanazavana kely..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-2 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? t('loading') : t('save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
