import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  User as UserIcon,
  Check,
  Loader2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState<string>(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever modal opens or user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || '');
      setSelectedFile(null);
      setFilePreview(null);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Mila sary (JPG, PNG, WEBP) no fidina');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Tsy mahazo mihoatra ny 20MB ny sary');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Mila fenoina ny anarana');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      let finalAvatarUrl = avatarUrl;

      // If user selected a file from device, upload it first
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await api.uploadMedia(selectedFile);
        finalAvatarUrl = uploadResult.url;
        setIsUploading(false);
      }

      await updateProfile({
        name: name.trim(),
        avatarUrl: finalAvatarUrl,
      });

      setSuccessMsg('Voatahiry soa aman-tsara ny fanovana !');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Nisy olana teo am-pitahirizana ny profil');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const currentPreview = filePreview || avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative animate-in zoom-in-95 duration-200 max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A3370] via-[#0E4191] to-[#124FA6] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">Modifier mon Profil</h3>
              <p className="text-[10px] text-blue-200">Hanova ny anarana sy ny sary</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative group">
              <img
                src={currentPreview}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#0E4191] shadow-md bg-slate-100"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0D4194] hover:bg-[#1565C0] text-white border-2 border-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                title="Mampakatra sary avy amin'ny finday/solosaina"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-50 hover:bg-blue-100 text-[#0D4194] border border-blue-200 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Safidio amin'ny finday / PC</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Modely</span>
              </button>
            </div>

            {selectedFile && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1.5 text-center">
                ✓ Sary voafidy: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          {/* Preset Avatars Toggle */}
          {showPresets && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Misafidiana sary efa vonona:
              </span>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(url);
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className={`rounded-full overflow-hidden aspect-square border-2 transition-all ${
                      avatarUrl === url && !filePreview
                        ? 'border-[#0D4194] ring-2 ring-blue-300 scale-105'
                        : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Anarana feno (Nom complet) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ohatra: Faly Rivo Randrianarivelo"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4194] transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Ity anarana ity no hiseho amin'ny karatra, dinika, ary hafatra rehetra.
            </p>
          </div>

          {/* Readonly info pills */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-400">Mailaka (Email):</span>
              <span className="font-medium text-slate-800 truncate max-w-[180px]">{user.email}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-400">Ekipa:</span>
              <span className="font-bold text-[#0D4194] uppercase">{user.teamId}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-400">Rôle:</span>
              <span className="font-bold text-slate-800 capitalize">{user.role}</span>
            </div>
            {user.memberId && (
              <div className="flex justify-between text-slate-600 font-mono text-[10px]">
                <span className="text-slate-400 font-sans">ID Membre:</span>
                <span className="text-blue-700 font-bold">{user.memberId}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              disabled={isSaving || isUploading}
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Aoka ihany (Annuler)
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex-1 bg-gradient-to-r from-[#0D4194] to-[#1565C0] hover:from-[#0A3370] hover:to-[#0D4194] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSaving || isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Mampiditra...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tahirizo (Enregistrer)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
