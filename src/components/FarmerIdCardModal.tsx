import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Language, FarmerProfile } from '../types';
import { t, translatePlaceName, translateCropName, formatLocalizedUnit } from '../services/translations';
import {
  X,
  Download,
  Share2,
  CheckCircle2,
  MapPin,
  Sprout,
  Play,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface FarmerIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FarmerProfile | null;
  lang: Language;
  isPostRegistration?: boolean;
  onStartTraining?: () => void;
  onSignOut?: () => void;
}

export function getInitials(name: string): string {
  const parts = (name || 'Farmer').trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const FarmerIdCardModal: React.FC<FarmerIdCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  lang,
  isPostRegistration = false,
  onStartTraining,
  onSignOut
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (!profile || !profile.id) return;
    // STRICT RULE: The QR must contain ONLY the farmer ID, never personal data.
    QRCode.toDataURL(profile.id, {
      width: 240,
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [profile]);

  if (!isOpen || !profile) return null;

  const initials = getInitials(profile.name);
  const showPhoto = Boolean(profile.photoDataUrl && profile.photoConsentGiven !== false);

  /**
   * Renders the Farmer ID Card to an HTML5 Canvas and returns a PNG data URL
   */
  const generateCardPngDataUrl = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 900, 540);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.6, '#115e59');
    grad.addColorStop(1, '#022c22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 540);

    // Gold border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 876, 516);

    // Top Header Banner
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('KRUSHAK BANI ODISHA – FARMER ID CARD', 40, 62);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '18px sans-serif';
    ctx.fillText('Official Digital Farmer Identification • QR Contains Only Farmer ID', 40, 92);

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 112);
    ctx.lineTo(860, 112);
    ctx.stroke();

    // Round Avatar or Photo (Center at 120, 230, radius 70)
    const cx = 120;
    const cy = 230;
    const r = 70;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (showPhoto && profile.photoDataUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = profile.photoDataUrl!;
        });
        ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
      } catch {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
    } else {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, cx, cy);
    }
    ctx.restore();

    // Circle border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Farmer details text
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(profile.name, 220, 190);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(`ID: ${profile.id}`, 220, 232);

    ctx.fillStyle = '#d1fae5';
    ctx.font = '22px sans-serif';
    const locationStr = [profile.village, profile.block, profile.district, profile.state]
      .filter(Boolean)
      .join(', ');
    ctx.fillText(`Location: ${locationStr}`, 220, 275);

    const fieldStr = profile.fieldSize
      ? `${profile.fieldSize.enteredValue} ${profile.fieldSize.unit} (${profile.landholdingAcres} Acres)`
      : `${profile.landholdingAcres} Acres`;
    ctx.fillText(`Field Size: ${fieldStr}`, 220, 312);

    // Main Crops Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(40, 355, 580, 130);
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('MAIN CROPS:', 60, 390);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    const cropsText = (profile.primaryCrops || []).slice(0, 6).join(', ') || 'General Farming';
    ctx.fillText(cropsText.slice(0, 48), 60, 428);
    if (cropsText.length > 48) {
      ctx.fillText(cropsText.slice(48, 96), 60, 460);
    }

    // Draw QR code on the right
    if (qrDataUrl) {
      try {
        const qrImg = new Image();
        await new Promise<void>((resolve) => {
          qrImg.onload = () => resolve();
          qrImg.onerror = () => resolve();
          qrImg.src = qrDataUrl;
        });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(660, 280, 190, 190);
        ctx.drawImage(qrImg, 670, 290, 170, 170);
        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(profile.id, 755, 492);
      } catch {}
    }

    return canvas.toDataURL('image/png');
  };

  const handleSaveAsImage = async () => {
    const dataUrl = await generateCardPngDataUrl();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `KrushakBani-ID-${profile.id}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage('ID Card saved as image!');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleShare = async () => {
    try {
      const dataUrl = await generateCardPngDataUrl();
      if (navigator.share) {
        if (dataUrl) {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `KrushakBani-ID-${profile.id}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Krushak Bani Farmer ID – ${profile.id}`,
              text: `${profile.name} (${profile.id}) – ${profile.district}, ${profile.state}`,
              files: [file]
            });
            return;
          }
        }
        await navigator.share({
          title: `Krushak Bani Farmer ID – ${profile.id}`,
          text: `Farmer Name: ${profile.name}\nFarmer ID: ${profile.id}\nLocation: ${profile.village ? profile.village + ', ' : ''}${profile.district}\nCrops: ${profile.primaryCrops.join(', ')}`
        });
        return;
      }
      // Fallback: download image
      await handleSaveAsImage();
    } catch {
      await handleSaveAsImage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col text-left max-h-[94vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-lg">
              🪪
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {t('farmer_id_card', lang)}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {t('qr_only_id_note', lang, { id: profile.id })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-400 relative overflow-hidden">
            {/* Top Badge Row */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/60">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xs shadow-sm p-1">
                  <img src="/icon.svg" alt="Krushak Bani Odisha" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-amber-300 uppercase tracking-wider">
                    {t('app_title', lang)}
                  </h4>
                  <p className="text-[10px] text-emerald-200">
                    {t('farmer_id_card', lang)}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-800 text-amber-300 border border-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {t('verified_badge', lang)}
              </span>
            </div>

            {/* Round Photo / Initials + Farmer Name & ID */}
            <div className="my-5 flex items-center gap-4">
              {showPhoto ? (
                <img
                  src={profile.photoDataUrl}
                  alt={profile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shrink-0 shadow-lg border-4 border-amber-400"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-lg border-4 border-white/60">
                  {initials}
                </div>
              )}

              <div className="space-y-1.5 min-w-0 flex-1">
                <h5 className="font-black text-xl sm:text-2xl text-white truncate">
                  {profile.name}
                </h5>
                <div className="inline-block bg-black/40 border border-amber-400/50 px-3 py-1 rounded-xl">
                  <p className="text-xs sm:text-sm text-amber-300 font-mono font-black tracking-wide">
                    {profile.id}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-100 pt-0.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {[
                      profile.village ? translatePlaceName(profile.village, lang) : '',
                      profile.district ? translatePlaceName(profile.district, lang) : '',
                      profile.state ? translatePlaceName(profile.state, lang) : ''
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Crops & Unique QR Code (contains ONLY Farmer ID) */}
            <div className="pt-4 border-t border-emerald-700/60 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold uppercase">
                  <Sprout className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('main_crops_label', lang)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(profile.primaryCrops || []).slice(0, 6).map((crop) => (
                    <span
                      key={crop}
                      className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-800/90 text-white border border-emerald-600"
                    >
                      {translateCropName(crop, lang)}
                    </span>
                  ))}
                  {(profile.primaryCrops || []).length > 6 && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-900 text-amber-300">
                      +{(profile.primaryCrops || []).length - 6}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-200/90 pt-1">
                  {t('field_size_label', lang)}:{' '}
                  {formatLocalizedUnit(profile.landholdingAcres, 'acres', lang)}
                </p>
              </div>

              {/* QR Code Box */}
              <div className="flex flex-col items-center bg-white text-stone-950 p-2 rounded-2xl shadow-lg shrink-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${profile.id}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-xs font-mono text-stone-500">
                    {profile.id}
                  </div>
                )}
                <span className="text-[9px] font-mono font-black text-emerald-950 mt-0.5">
                  {profile.id}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Assurance Note */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{t('qr_only_id_note', lang, { id: profile.id })}</span>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black text-center">
              ✓ {statusMessage}
            </div>
          )}

          {/* Save as Image & Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSaveAsImage}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('save_as_image', lang)}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('share_card', lang)}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
          {onSignOut && !isPostRegistration ? (
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('sign_out', lang)}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 ml-auto">
            {onStartTraining && (
              <button
                onClick={onStartTraining}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 text-xs sm:text-sm font-black shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t('start_training_btn', lang)}</span>
              </button>
            )}

            {!isPostRegistration && (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
              >
                {t('close_btn', lang)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
