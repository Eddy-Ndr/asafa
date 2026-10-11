import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, ShieldCheck, Download, Share2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { User, TeamId } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface BadgeModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onTestVerify?: (token: string) => void;
}

const teamNames: Record<TeamId, string> = {
  soalia: 'ÉQUIPE SOALIA',
  mpiantsa: 'ÉQUIPE MPIANTSA',
  tomima: 'ÉQUIPE TOMIMA',
  asafa: 'BIRAO FOIBE ASAFA',
};

export const BadgeModal: React.FC<BadgeModalProps> = ({ user, isOpen, onClose, onTestVerify }) => {
  const { t } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadedQr, setDownloadedQr] = useState<boolean>(false);

  useEffect(() => {
    if (user && user.qrCodeToken) {
      // Real verification URL
      const origin = window.location.origin;
      const verifyUrl = `${origin}/verify/${user.qrCodeToken}`;
      QRCode.toDataURL(verifyUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0D47A1',
          light: '#FFFFFF',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate QR code:', err));
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isPending = user.status === 'pending';
  const isSuspended = user.status === 'suspended' || user.status === 'rejected';

  const copyToken = () => {
    if (user.qrCodeToken) {
      navigator.clipboard.writeText(user.qrCodeToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const filename = `asafa-qr-${user.memberId || user.name.replace(/\s+/g, '_')}.png`;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedQr(true);
    setTimeout(() => setDownloadedQr(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Digital PVC Card */}
        <div className="p-4 bg-slate-100 flex flex-col items-center">
          <div className="w-full rounded-2xl overflow-hidden shadow-xl border-2 border-blue-300/60 bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#0288D1] text-white relative flex flex-col">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

            {/* Card Header */}
            <div className="p-4 pb-2 border-b border-white/20 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white text-[#1565C0] flex items-center justify-center font-black text-sm shadow">
                  A
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wider leading-none">ASAFA</h3>
                  <p className="text-[9px] text-blue-200 tracking-tight font-medium mt-0.5">
                    CARTE OFFICIELLE DE MEMBRE
                  </p>
                </div>
              </div>

              {/* Holographic style seal badge */}
              <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-300/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-amber-300" />
                <span>HOMOLOGUÉ</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex flex-col items-center text-center relative z-10">
              {/* Member Photo */}
              <div className="relative mb-2">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover ring-3 ring-white/90 shadow-md bg-white"
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      user.status === 'active'
                        ? 'bg-emerald-500'
                        : isPending
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              <h4 className="font-extrabold text-base leading-snug">{user.name}</h4>
              <div className="bg-white/20 backdrop-blur-xs text-blue-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide mt-1">
                {teamNames[user.teamId]}
              </div>

              {/* Member ID and Status */}
              <div className="w-full bg-white/10 rounded-xl p-2.5 mt-3 border border-white/15 flex items-center justify-around">
                <div>
                  <div className="text-[10px] text-blue-200 uppercase font-semibold">Identifiant</div>
                  <div className="font-mono font-black text-xs tracking-wider text-white">
                    {user.memberId || 'EN ATTENTE'}
                  </div>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <div className="text-[10px] text-blue-200 uppercase font-semibold">Statut</div>
                  <div
                    className={`text-[11px] font-black uppercase ${
                      user.status === 'active' ? 'text-emerald-300' : 'text-amber-300'
                    }`}
                  >
                    {user.status}
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-2.5 rounded-xl shadow-lg mt-3.5 flex flex-col items-center border border-slate-200">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 object-contain" />
                ) : (
                  <div className="w-36 h-36 flex flex-col items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs">
                    <AlertTriangle className="w-6 h-6 mb-1 text-amber-500" />
                    <span>Génération en attente</span>
                  </div>
                )}
                <div className="text-[10px] font-mono text-slate-500 mt-1 select-all">
                  {user.qrCodeToken || 'TOKEN-NON-GÉNÉRÉ'}
                </div>

                {/* Quick Download QR button right under QR code */}
                {qrDataUrl && (
                  <button
                    type="button"
                    onClick={downloadQrCode}
                    className="mt-2 bg-blue-50 hover:bg-blue-100 text-[#0D4194] border border-blue-200 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Download className="w-3 h-3 text-[#0D4194]" />
                    <span>{downloadedQr ? '✓ Voasintona (Téléchargé) !' : 'Télécharger le QR Code'}</span>
                  </button>
                )}
              </div>

              <p className="text-[9px] text-blue-200 mt-2 font-medium">
                Scannez pour vérifier l'authenticité sur le serveur ASAFA
              </p>
            </div>

            {/* Card Footer */}
            <div className="bg-[#093275] px-4 py-2 text-[10px] flex items-center justify-between text-blue-200 font-medium">
              <span>ASAFA MADAGASCAR</span>
              <span>2026 - 2027</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
          {/* Main Download QR Code Button */}
          {qrDataUrl && (
            <button
              onClick={downloadQrCode}
              className="w-full bg-gradient-to-r from-[#0D4194] to-[#1565C0] hover:from-[#0A3370] hover:to-[#0D4194] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>{downloadedQr ? '✓ QR Code voasintona (Téléchargé) !' : 'Télécharger le QR Code (PNG)'}</span>
            </button>
          )}

          {user.qrCodeToken && onTestVerify && (
            <button
              onClick={() => onTestVerify(user.qrCodeToken!)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#1565C0]" />
              <span>Tester la vérification serveur</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={copyToken}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Token copié !' : 'Copier Token'}</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-xl font-semibold text-xs transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
