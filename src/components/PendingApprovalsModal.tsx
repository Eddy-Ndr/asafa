import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, ShieldCheck, User } from 'lucide-react';
import { api } from '../services/api.ts';
import { User as UserType } from '../types.ts';

interface PendingApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprovalSuccess?: () => void;
}

export const PendingApprovalsModal: React.FC<PendingApprovalsModalProps> = ({
  isOpen,
  onClose,
  onApprovalSuccess,
}) => {
  const [pending, setPending] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingMembers();
      setPending(data);
    } catch (err) {
      console.error('Failed to load pending:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPending();
    }
  }, [isOpen]);

  const handleApprove = async (id: string, name: string) => {
    try {
      const res = await api.approveMember(id);
      setMessage(`Mpikambana ${name} nankatoavina ! Member ID: ${res.user.memberId}`);
      setTimeout(() => setMessage(null), 3500);
      loadPending();
      onApprovalSuccess?.();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Tena holavina ve ny fangatahan'i ${name} ?`)) return;
    try {
      await api.rejectMember(id);
      setMessage(`Nolavina ny fangatahana`);
      setTimeout(() => setMessage(null), 3500);
      loadPending();
      onApprovalSuccess?.();
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative max-h-[85vh]">
        <div className="bg-[#0E4191] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-sm">Inscriptions en attente</h3>
              <p className="text-[10px] text-blue-200">Fankatoavana & Fanomezana Karatra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {message && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 bg-slate-50">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Eo am-pakana ny lisitra...
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 bg-white rounded-2xl p-6 border border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">Tsy misy fangatahana miandry</p>
              <p className="text-[11px] text-slate-400 mt-1">Efa nankatoavina avokoa ny mpikambana rehetra.</p>
            </div>
          ) : (
            pending.map(p => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover border border-amber-300"
                  />
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">{p.email}</p>
                    <span className="inline-block bg-blue-50 text-[#0D4194] text-[9px] font-black px-1.5 py-0.5 rounded uppercase mt-0.5">
                      Équipe {p.teamId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleApprove(p.id, p.name)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => handleReject(p.id, p.name)}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejeter</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
