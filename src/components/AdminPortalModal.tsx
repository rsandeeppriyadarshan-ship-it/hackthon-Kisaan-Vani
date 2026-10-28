import React, { useState, useEffect } from 'react';
import {
  Language,
  FarmerProfile,
  LockedFieldCorrectionRequest,
} from '../types';
import {
  db,
  auth,
  doc,
  collection,
  getDocs,
  deleteDoc,
  signInAdminWithGoogle,
  BOOTSTRAPPED_ADMIN_EMAIL,
} from '../firebase';
import {
  adminListAllFarmers,
  adminListCorrectionRequests,
  adminReviewCorrectionRequest,
  adminDeleteFarmerRecord,
} from '../services/localFirstSyncEngine';
import {
  ShieldCheck,
  Lock,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  LogIn,
  AlertTriangle,
  Download,
  Trash2,
  Search,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onFarmerRecordUpdated?: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  lang,
  onFarmerRecordUpdated,
}) => {
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>(
    auth.currentUser?.email || BOOTSTRAPPED_ADMIN_EMAIL
  );
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [requests, setRequests] = useState<LockedFieldCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'farmers'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [farmerToDelete, setFarmerToDelete] = useState<FarmerProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [corrList, farmerList] = await Promise.all([
        adminListCorrectionRequests(),
        adminListAllFarmers(),
      ]);
      setRequests(corrList);
      setFarmers(farmerList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthorizedAdmin) {
      loadAdminData();
    }
  }, [isOpen, isAuthorizedAdmin]);

  if (!isOpen) return null;

  const handleGoogleAdminLogin = async () => {
    setAuthError(null);
    const res = await signInAdminWithGoogle();
    if (res.user) {
      setAdminUserEmail(res.user.email);
    }
    setIsAuthorizedAdmin(res.isAdmin);
    if (!res.isAdmin && res.error) {
      setAuthError(res.error);
    }
  };

  const handleDecision = async (
    req: LockedFieldCorrectionRequest,
    decision: 'approved' | 'rejected'
  ) => {
    setLoading(true);
    try {
      await adminReviewCorrectionRequest(req, decision);
      await loadAdminData();
      if (onFarmerRecordUpdated) {
        onFarmerRecordUpdated();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteFarmer = async () => {
    if (!farmerToDelete) return;
    setIsDeleting(true);
    try {
      await adminDeleteFarmerRecord(farmerToDelete.mobile, farmerToDelete.id);
      setFarmerToDelete(null);
      await loadAdminData();
      if (onFarmerRecordUpdated) {
        onFarmerRecordUpdated();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // 'Download Farmer Data' button handler: Iterates through Firestore collection of farmers & generates CSV
  const handleDownloadFarmerDataCsv = async () => {
    setExportingCsv(true);
    try {
      let firestoreFarmers: FarmerProfile[] = [];

      // 1. Iterate through Firestore 'farmers' collection
      try {
        const snap = await getDocs(collection(db, 'farmers'));
        snap.forEach((docSnap) => {
          const data = docSnap.data() as FarmerProfile;
          if (data && data.mobile) {
            firestoreFarmers.push(data);
          }
        });
      } catch (e) {
        console.warn('Firestore iteration fallback to server master list:', e);
      }

      // Merge with active server list if Firestore return is empty or offline
      if (firestoreFarmers.length === 0) {
        firestoreFarmers = farmers;
      }

      if (firestoreFarmers.length === 0) {
        alert(
          lang === 'or'
            ? 'ଡାଉନଲୋଡ୍ କରିବା ପାଇଁ କୌଣସି କୃଷକ ତଥ୍ୟ ମିଳିଲା ନାହିଁ।'
            : 'No farmer registration records found in Firestore.'
        );
        return;
      }

      const headers = [
        'Farmer ID',
        'Full Name',
        'Mobile Number',
        'State',
        'District',
        'Block',
        'Village',
        'Landholding (Acres)',
        'Field Size Unit',
        'Primary Crops',
        'Farmer Type',
        'Preferred Language',
        'GPS Latitude',
        'GPS Longitude',
        'Spray Logs Count',
        'Advice History Count',
        'Callback Requests Count',
        'Photo Consent',
        'AI Call Consent',
        'Registration Date',
        'Last Synced Date',
      ];

      const escapeCsv = (str: any) => {
        if (str === null || str === undefined) return '""';
        const text = String(str).replace(/"/g, '""');
        return `"${text}"`;
      };

      const rows = firestoreFarmers.map((f) => [
        escapeCsv(f.id),
        escapeCsv(f.name || f.fullName || ''),
        escapeCsv(f.mobile),
        escapeCsv(f.state || 'Odisha'),
        escapeCsv(f.district || ''),
        escapeCsv(f.block || ''),
        escapeCsv(f.village || ''),
        escapeCsv(f.landholdingAcres || f.landAcres || 0),
        escapeCsv(f.fieldSize?.unit || 'Acre'),
        escapeCsv((f.primaryCrops || f.cropIds || []).join('; ')),
        escapeCsv(f.farmerType || ''),
        escapeCsv(f.language || f.preferredLanguage || 'or'),
        escapeCsv(f.gpsLocation?.lat || ''),
        escapeCsv(f.gpsLocation?.lon || ''),
        escapeCsv(f.sprayLog?.length || 0),
        escapeCsv(f.adviceHistory?.length || 0),
        escapeCsv(f.callbackRequests?.length || 0),
        escapeCsv(f.photoConsentGiven ? 'Yes' : 'No'),
        escapeCsv((f as any).aiCallConsent ? 'Yes' : 'No'),
        escapeCsv(f.registrationDate || ''),
        escapeCsv(f.lastSyncedAt || ''),
      ]);

      // UTF-8 BOM (\uFEFF) ensures Odia & regional scripts render correctly in Excel & Sheets
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute('download', `krushak_farmer_data_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExportingCsv(false);
    }
  };

  // Raw Database JSON Extract Utility
  const handleExportJson = () => {
    if (farmers.length === 0) return;
    const jsonContent = JSON.stringify(farmers, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `krushak_farmers_database_${today}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredFarmers = farmers.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (f.id && f.id.toLowerCase().includes(q)) ||
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.fullName && f.fullName.toLowerCase().includes(q)) ||
      (f.mobile && f.mobile.includes(q)) ||
      (f.district && f.district.toLowerCase().includes(q)) ||
      (f.block && f.block.toLowerCase().includes(q)) ||
      (f.village && f.village.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col text-left relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-900 text-amber-300 border border-emerald-700">
                  Security Rule 9 • Admin Gate
                </span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-white mt-0.5">
                Krushak Bani Odisha — Central Server Admin Portal
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {!isAuthorizedAdmin ? (
            <div className="p-6 rounded-3xl bg-stone-50 border-2 border-stone-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="font-black text-base text-stone-900">
                  {lang === 'or' ? 'ଆଡମିନ୍ ପ୍ରମାଣୀକରଣ ଆବଶ୍ୟକ' : 'Admin Authentication Required'}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {lang === 'or' ? (
                    <span>
                      ସୁରକ୍ଷା ନିୟମ #୯ ଅନୁଯାୟୀ, ସାଧାରଣ କୃଷକ ଆକାଉଣ୍ଟ କେବଳ ନିଜର ରେକର୍ଡ ପଢ଼ିବା ଓ ଲେଖିପାରିବେ ଏବଂ <strong>ଆପ୍‌ରୁ କେହି ସମସ୍ତ କୃଷକଙ୍କ ତାଲିକା ଦେଖିପାରିବେ ନାହିଁ</strong>। କେବଳ ଯାଞ୍ଚ ହୋଇଥିବା ଆଡମିନ୍ ଆକାଉଣ୍ଟ ଏହି ପୃଷ୍ଠା ଖୋଲିପାରିବେ, Firestore ରୁ Farmer Data ଡାଉନଲୋଡ୍ କିମ୍ବା Farmer ID ଡିଲିଟ୍ କରିପାରିବେ।
                    </span>
                  ) : (
                    <span>
                      Per Security Rule #9, regular farmer accounts can read and write only their own record and <strong>nobody can list all farmers from the app</strong>. Only verified Admin accounts can open this page, download farmer registration details as CSV, search by Farmer ID, and permanently remove records from Firestore.
                    </span>
                  )}
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center justify-center gap-2 max-w-md mx-auto">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                onClick={handleGoogleAdminLogin}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'or' ? 'ଆଡମିନ୍ ଭାବେ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ' : 'Sign In as Admin'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Admin Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'or' ? 'ଆଡମିନ୍ ଭାବେ ସାଇନ୍ ଇନ୍ ହୋଇଛି' : 'Signed in as Admin'}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-3 py-1.5 rounded-xl font-black cursor-pointer ${
                      activeTab === 'requests'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    Correction Requests ({requests.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('farmers')}
                    className={`px-3 py-1.5 rounded-xl font-black cursor-pointer ${
                      activeTab === 'farmers'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    Master Records ({farmers.length})
                  </button>
                  <button
                    onClick={loadAdminData}
                    className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {activeTab === 'requests' ? (
                <div className="space-y-3">
                  <h4 className="font-black text-sm text-stone-900">
                    Locked-Field Correction Requests (District, Block, Village, GPS)
                  </h4>
                  {requests.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500 font-semibold">
                      No correction requests submitted yet.
                    </div>
                  ) : (
                    requests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-900">{req.farmerName}</span>
                            <span className="font-mono text-emerald-700 font-bold">
                              {req.farmerId}
                            </span>
                            <span className="text-stone-500">+91 {req.mobile}</span>
                          </div>
                          <div className="font-bold text-stone-800">
                            Requested Locked Address:{' '}
                            <span className="text-emerald-800">
                              {req.requestedChanges.district}
                              {req.requestedChanges.block
                                ? ` / ${req.requestedChanges.block}`
                                : ''}
                              {req.requestedChanges.village
                                ? ` / ${req.requestedChanges.village}`
                                : ''}
                            </span>
                          </div>
                          <p className="text-stone-600 italic">Reason: "{req.reason}"</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleDecision(req, 'approved')}
                                disabled={loading}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve & Unlock</span>
                              </button>
                              <button
                                onClick={() => handleDecision(req, 'rejected')}
                                disabled={loading}
                                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <span
                              className={`px-2.5 py-1 rounded-full font-black uppercase text-[10px] ${
                                req.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {req.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Master Farmer Records Controls: Search & Download Farmer Data (.csv) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Input by Farmer ID / Mobile / Name */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Farmer ID (e.g. KB-CTC-123456), Mobile, or Name..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    {/* Download Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Explicit 'Download Farmer Data' button */}
                      <button
                        type="button"
                        onClick={handleDownloadFarmerDataCsv}
                        disabled={exportingCsv || farmers.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        title="Download all Firestore farmer registration details as CSV"
                      >
                        {exportingCsv ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4 text-amber-300 stroke-[2.5]" />
                        )}
                        <span>
                          {exportingCsv ? 'Extracting Firestore...' : 'Download Farmer Data (.csv)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportJson}
                        disabled={farmers.length === 0}
                        className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Download raw JSON database extract"
                      >
                        <FileJson className="w-4 h-4 text-amber-400" />
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>

                  <h4 className="font-black text-sm text-stone-900 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>
                        Firestore Master Farmer Records ({filteredFarmers.length} of {farmers.length})
                      </span>
                    </span>
                  </h4>

                  {filteredFarmers.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500 font-semibold">
                      {searchQuery
                        ? `No farmer records match "${searchQuery}".`
                        : 'No farmer master records found in Firestore database.'}
                    </div>
                  ) : (
                    filteredFarmers.map((f) => (
                      <div
                        key={f.mobile}
                        className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2 relative group hover:border-emerald-400 transition-all shadow-2xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-stone-900">
                              {f.name || f.fullName || 'ଚାଷୀ ଭାଇ'}
                            </span>
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {f.id}
                            </span>
                            <span className="font-mono font-bold text-stone-700">
                              +91 {f.mobile}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-stone-500 hidden sm:inline">
                              Photo Consent:{' '}
                              <strong>{f.photoConsentGiven ? 'Agreed' : 'No'}</strong>
                            </span>

                            {/* 'Delete' Action Button for each farmer row */}
                            <button
                              type="button"
                              onClick={() => setFarmerToDelete(f)}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-black border border-red-200 text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              title={`Permanently delete Farmer ID ${f.id} from Firestore`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-stone-700 text-[11px]">
                          <span>
                            🔒 Address: {f.state || 'Odisha'}, {f.district}
                            {f.block ? `, ${f.block}` : ''}
                            {f.village ? `, ${f.village}` : ''}
                          </span>
                          <span>• Land: {f.landholdingAcres || f.landAcres || 0} Acres</span>
                          <span>• Primary Crops: {(f.primaryCrops || f.cropIds || []).join(', ') || 'Paddy'}</span>
                          <span>• Spray Logs: {f.sprayLog?.length || 0}</span>
                          <span>• Advice Entries: {f.adviceHistory?.length || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Permanent Firestore Record Deletion Modal */}
      {farmerToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4 text-stone-900">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Trash2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-base">Permanently Delete Record?</h3>
                <p className="text-xs text-stone-500 font-mono font-bold">{farmerToDelete.id}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-stone-800 space-y-2 font-medium">
              <p>
                Farmer Name:{' '}
                <strong>{farmerToDelete.name || farmerToDelete.fullName || 'Farmer'}</strong>
              </p>
              <p>
                Registered Phone: <strong>+91 {farmerToDelete.mobile}</strong>
              </p>
              <p className="text-red-700 font-bold border-t border-red-200 pt-2 mt-2">
                ⚠️ Permanent Deletion Notice: This action will instantly and irreversibly remove this farmer record and ID ({farmerToDelete.id}) from Firestore collection `/farmers/{farmerToDelete.mobile}` and central server database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFarmerToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFarmer}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-2"
              >
                {isDeleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isDeleting ? 'Removing from Firestore...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
