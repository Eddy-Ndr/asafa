import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, XCircle, ShieldCheck, AlertCircle, Building, UserCheck } from 'lucide-react';
import { api } from '../services/api.ts';
import { VerificationData } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  initialToken,
}) => {
  const { t } = useLanguage();
  const [tokenInput, setTokenInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialToken) {
      setTokenInput(initialToken);
      verifyToken(initialToken);
    }
  }, [initialToken]);

  const verifyToken = async (tokenToVerify: string) => {
    const clean = tokenToVerify.trim();
    if (!clean) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.verifyQrToken(clean);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Échec de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    verifyToken(tokenInput);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1565C0] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-200" />
            <h3 className="font-extrabold text-sm">{t('verify_badge')}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input for token */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="Collez ou saisissez le token QR..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1565C0] text-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !tokenInput.trim()}
              className="bg-[#1565C0] hover:bg-[#0D47A1] disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('verify_now')}</span>
            </button>
          </form>

          {/* Quick sample tokens */}
          <div className="mt-2 text-[10px] text-slate-500 flex flex-wrap gap-1 items-center">
            <span>Tokens d'exemples :</span>
            <button
              type="button"
              onClick={() => {
                setTokenInput('v-tok-admin-001-sec');
                verifyToken('v-tok-admin-001-sec');
              }}
              className="underline text-blue-600 hover:text-blue-800 font-mono"
            >
              Admin
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setTokenInput('v-tok-soalia-pres-88');
                verifyToken('v-tok-soalia-pres-88');
              }}
              className="underline text-blue-600 hover:text-blue-800 font-mono"
            >
              Soalia Pres
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setTokenInput('v-tok-miora-soa-101');
                verifyToken('v-tok-miora-soa-101');
              }}
              className="underline text-blue-600 hover:text-blue-800 font-mono"
            >
              Membre Soalia
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setTokenInput('token-invalide-test-404');
                verifyToken('token-invalide-test-404');
              }}
              className="underline text-rose-600 hover:text-rose-800 font-mono"
            >
              Token Invalide
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">{t('loading')}</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col items-center text-center">
              <XCircle className="w-10 h-10 text-rose-500 mb-2" />
              <h4 className="font-extrabold text-sm text-rose-800 mb-1">
                {t('badge_invalid')}
              </h4>
              <p className="text-xs text-rose-600">{error}</p>
            </div>
          )}

          {result && !loading && (
            <div>
              {result.valid ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="font-extrabold text-sm text-emerald-900">
                    {t('badge_valid')}
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    {result.officialSeal}
                  </p>

                  {/* Member details card */}
                  <div className="w-full bg-white rounded-xl p-3 border border-emerald-200 mt-3 text-left space-y-2">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                      <img
                        src={result.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={result.name}
                        className="w-12 h-12 rounded-full object-cover border border-emerald-300"
                      />
                      <div>
                        <div className="font-extrabold text-xs text-slate-800">{result.name}</div>
                        <div className="text-[11px] font-bold text-blue-700 uppercase">
                          {result.teamName}
                        </div>
                        <span className="inline-block bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase mt-0.5">
                          {result.role} • {result.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Identifiant :</span>
                        <span className="font-mono font-bold text-slate-800">{result.memberId}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Organisation :</span>
                        <span className="font-semibold text-slate-800">ASAFA Madagascar</span>
                      </div>
                      {result.approvedAt && (
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px]">Validé le :</span>
                          <span className="text-slate-600">
                            {new Date(result.approvedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col items-center text-center">
                  <XCircle className="w-10 h-10 text-rose-500 mb-2" />
                  <h4 className="font-extrabold text-sm text-rose-800 mb-1">
                    {t('badge_invalid')}
                  </h4>
                  <p className="text-xs text-rose-600">{result.message}</p>
                </div>
              )}
            </div>
          )}

          {!result && !error && !loading && (
            <div className="text-center py-6 text-slate-400 text-xs">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>Entrez un token pour tester la vérification en direct sur l'API serveur.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
