import React, { useState, useEffect } from 'react';
import {
  Language,
  FarmerProfile,
  LockedFieldCorrectionRequest,
} from '../types';
import {
  submitLockedFieldCorrectionRequest,
  getFarmerCorrectionRequestsLocal,
} from '../services/localFirstSyncEngine';
import { getMergedOdishaState } from '../services/locationService';
import {
  Lock,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Send,
  ShieldAlert,
} from 'lucide-react';

interface LockedFieldsCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FarmerProfile | null;
  lang: Language;
}

export const LockedFieldsCorrectionModal: React.FC<LockedFieldsCorrectionModalProps> = ({
  isOpen,
  onClose,
  profile,
  lang,
}) => {
  const [district, setDistrict] = useState(profile?.district || 'Cuttack');
  const [block, setBlock] = useState(profile?.block || '');
  const [village, setVillage] = useState(profile?.village || '');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [history, setHistory] = useState<LockedFieldCorrectionRequest[]>([]);

  useEffect(() => {
    if (isOpen && profile) {
      setDistrict(profile.district || 'Cuttack');
      setBlock(profile.block || '');
      setVillage(profile.village || '');
      setSubmittedSuccess(false);
      getFarmerCorrectionRequestsLocal(profile.mobile).then(setHistory);
    }
  }, [isOpen, profile]);

  if (!isOpen || !profile) return null;

  const odishaState = getMergedOdishaState();
  const selectedDistrictObj =
    odishaState.districts.find((d) => d.name_en === district) || odishaState.districts[0];
  const blocks = selectedDistrictObj?.blocks || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) return;
    setSubmitting(true);
    try {
      await submitLockedFieldCorrectionRequest({
        mobile: profile.mobile,
        farmerId: profile.id,
        farmerName: profile.name,
        requestedChanges: {
          state: 'Odisha',
          district,
          block: block.trim(),
          village: village.trim(),
        },
        reason: reason.trim(),
      });
      const updated = await getFarmerCorrectionRequestsLocal(profile.mobile);
      setHistory(updated);
      setReason('');
      setSubmittedSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-lg max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                Locked Address & GPS Correction Request
              </h3>
              <p className="text-[11px] text-emerald-200">
                Server Master Record Conflict Rule • Admin Approval Required
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Explanation of Rule 4 */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Why are these fields locked?</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              For locked fields (<strong>Mobile Number, State, District, Block, Village, GPS Location</strong>), the server master value always wins and the app cannot overwrite them directly. Submit a correction request below for Admin approval.
            </p>
          </div>

          {/* Current Locked Values on Server */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
              Current Locked Server Values ({profile.id}):
            </span>
            <div className="grid grid-cols-2 gap-2 font-semibold text-stone-800">
              <div>📱 Mobile: +91 {profile.mobile}</div>
              <div>🏛️ State: {profile.state || 'Odisha'}</div>
              <div>📍 District: {profile.district}</div>
              <div>🏘️ Block: {profile.block || '—'}</div>
              <div>🌾 Village: {profile.village || '—'}</div>
              <div>
                🛰️ GPS:{' '}
                {profile.gpsLocation
                  ? `${profile.gpsLocation.lat.toFixed(4)}, ${profile.gpsLocation.lon.toFixed(4)} (±${profile.gpsLocation.accuracyMeters}m)`
                  : 'Not set'}
              </div>
            </div>
          </div>

          {submittedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Correction request saved on phone and queued for Central Server Admin review!
              </span>
            </div>
          )}

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  New District
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setBlock('');
                  }}
                  className="w-full rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-xs font-bold text-stone-900"
                >
                  {odishaState.districts.map((d) => (
                    <option key={d.name_en} value={d.name_en}>
                      {d.name_en} ({d.name_or})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  New Block
                </label>
                <input
                  type="text"
                  list="corr-blocks-list"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="Enter block"
                  className="w-full rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-xs font-bold text-stone-900"
                />
                <datalist id="corr-blocks-list">
                  {blocks.map((b) => (
                    <option key={b.name_en} value={b.name_en} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  New Village
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Enter village"
                  className="w-full rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-xs font-bold text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Reason for Correction Request (Required)
              </label>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., My farm plot is in Salepur block, selected wrong block during initial setup..."
                className="w-full rounded-xl border border-stone-300 bg-stone-50 p-2.5 text-xs font-semibold text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || reason.trim().length < 3}
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Locked-Field Correction Request'}</span>
            </button>
          </form>

          {/* Previous Correction Requests */}
          {history.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <span className="text-[11px] font-black uppercase text-stone-500 block">
                Your Correction Requests ({history.length})
              </span>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-stone-900">
                        {item.requestedChanges.district}
                        {item.requestedChanges.block ? ` → ${item.requestedChanges.block}` : ''}
                        {item.requestedChanges.village ? ` → ${item.requestedChanges.village}` : ''}
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">"{item.reason}"</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 flex items-center gap-1 ${
                        item.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {item.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {item.status === 'pending' && <Clock className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
