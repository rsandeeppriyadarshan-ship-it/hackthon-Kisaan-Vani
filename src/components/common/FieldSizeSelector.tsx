import React, { useState, useEffect, useRef } from 'react';
import { Language, FieldSizeUnit, FieldSizeValue } from '../../types';
import {
  convertFieldSizeToAcres,
  getCurrentSignedInFarmer,
  registerAndSignInFarmer,
} from '../../services/authDatabaseService';
import { t } from '../../services/translations';
import { VoiceMicButton } from './VoiceInputField';
import { Check, HelpCircle } from 'lucide-react';

export const FIELD_SIZE_UNITS: { unit: FieldSizeUnit; labelKey: string }[] = [
  { unit: 'Acre', labelKey: 'unit_acre' },
  { unit: 'Hectare', labelKey: 'unit_hectare' },
  { unit: 'Decimal', labelKey: 'unit_decimal' },
  { unit: 'Cent', labelKey: 'unit_cent' },
  { unit: 'Guntha', labelKey: 'unit_guntha' },
  { unit: 'Bigha', labelKey: 'unit_bigha' },
  { unit: 'Katha', labelKey: 'unit_katha' },
  { unit: 'Square feet', labelKey: 'unit_sqft' },
  { unit: 'Square metre', labelKey: 'unit_sqm' },
];

const SAVED_FIELD_SIZE_KEY = 'krushak_saved_field_size_v1';
const BIGHA_KATHA_MEMORY_KEY = 'krushak_bigha_katha_memory_v1';

interface BighaKathaMemory {
  Bigha?: number; // remembered acres per 1 Bigha (only after farmer answers once)
  Katha?: number; // remembered acres per 1 Katha (only after farmer answers once)
}

function loadBighaKathaMemory(): BighaKathaMemory {
  try {
    const raw = localStorage.getItem(BIGHA_KATHA_MEMORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveBighaKathaMemory(unit: 'Bigha' | 'Katha', acresPerOneUnit: number): void {
  if (acresPerOneUnit <= 0) return;
  try {
    const current = loadBighaKathaMemory();
    current[unit] = Number(acresPerOneUnit.toFixed(4));
    localStorage.setItem(BIGHA_KATHA_MEMORY_KEY, JSON.stringify(current));
  } catch {}
}

export function getSavedFieldSizeDefault(): FieldSizeValue {
  try {
    const signedIn = getCurrentSignedInFarmer();
    if (signedIn?.fieldSize && signedIn.fieldSize.acres > 0) {
      return signedIn.fieldSize;
    }
    const raw = localStorage.getItem(SAVED_FIELD_SIZE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FieldSizeValue;
      if (parsed && parsed.acres > 0 && parsed.unit) {
        return parsed;
      }
    }
    if (signedIn && signedIn.landholdingAcres > 0) {
      return {
        enteredValue: signedIn.landholdingAcres,
        unit: 'Acre',
        acres: signedIn.landholdingAcres,
      };
    }
  } catch {}
  return {
    enteredValue: 2,
    unit: 'Acre',
    acres: 2,
  };
}

export function persistFieldSizeGlobally(
  fieldSize: FieldSizeValue,
  syncToProfile = false
): void {
  try {
    localStorage.setItem(SAVED_FIELD_SIZE_KEY, JSON.stringify(fieldSize));
    if (syncToProfile) {
      const current = getCurrentSignedInFarmer();
      if (current) {
        registerAndSignInFarmer(
          {
            ...current,
            fieldSize,
            landholdingAcres: fieldSize.acres,
            landAcres: fieldSize.acres,
          },
          ['fieldSize', 'landholdingAcres', 'landAcres']
        );
      }
    }
  } catch {}
}

interface FieldSizeSelectorProps {
  lang: Language;
  valueAcres?: number;
  initialFieldSize?: FieldSizeValue;
  onChange: (acres: number, fieldSize: FieldSizeValue) => void;
  syncToFarmerProfile?: boolean;
  compact?: boolean;
  label?: string;
}

export const FieldSizeSelector: React.FC<FieldSizeSelectorProps> = ({
  lang,
  initialFieldSize,
  onChange,
  syncToFarmerProfile = false,
  compact = false,
  label,
}) => {
  const defaultVal = initialFieldSize || getSavedFieldSizeDefault();

  const [dontKnowSize, setDontKnowSize] = useState<boolean>(
    Boolean(defaultVal.unknownSizeChoice)
  );
  const [unknownChoice, setUnknownChoice] = useState<'small' | 'medium' | 'large'>(
    defaultVal.unknownSizeChoice || 'medium'
  );
  const [enteredStr, setEnteredStr] = useState<string>(
    String(defaultVal.enteredValue || 2)
  );
  const [unit, setUnit] = useState<FieldSizeUnit>(defaultVal.unit || 'Acre');

  // Bigha / Katha "ask once: about how many acres?"
  const memory = loadBighaKathaMemory();
  const [manualApproxAcresStr, setManualApproxAcresStr] = useState<string>(() => {
    if (defaultVal.unit === 'Bigha' || defaultVal.unit === 'Katha') {
      return String(defaultVal.acres || 1);
    }
    const memFactor = memory.Bigha || memory.Katha;
    if (memFactor) {
      return String(Number(((defaultVal.enteredValue || 1) * memFactor).toFixed(2)));
    }
    return '';
  });
  const [editingBighaKathaAcres, setEditingBighaKathaAcres] = useState<boolean>(false);

  const numInputRef = useRef<HTMLInputElement | null>(null);
  const approxInputRef = useRef<HTMLInputElement | null>(null);

  const isBighaOrKatha = unit === 'Bigha' || unit === 'Katha';
  const rememberedUnitFactor = isBighaOrKatha ? loadBighaKathaMemory()[unit] : undefined;

  // Compute acres using exact factors from spec:
  // 1 acre = 100 decimal = 100 cent = 40 guntha = 43,560 sq ft;
  // 1 hectare = 2.471 acre;
  // 1 sq m = 10.7639 sq ft;
  // Bigha / Katha: never guess — use farmer's answered approximate acres
  const enteredNum = Math.max(0, parseFloat(enteredStr) || 0);
  let computedAcres = 0;

  if (dontKnowSize) {
    computedAcres = unknownChoice === 'small' ? 0.5 : unknownChoice === 'medium' ? 2.0 : 5.0;
  } else if (isBighaOrKatha) {
    const manualNum = parseFloat(manualApproxAcresStr);
    if (!isNaN(manualNum) && manualNum > 0) {
      computedAcres = Number(manualNum.toFixed(3));
    } else if (rememberedUnitFactor && enteredNum > 0) {
      computedAcres = Number((enteredNum * rememberedUnitFactor).toFixed(3));
    } else {
      computedAcres = 0;
    }
  } else {
    computedAcres = convertFieldSizeToAcres(enteredNum, unit);
  }

  // Emit change whenever value, unit, or picture choice updates
  useEffect(() => {
    const effectiveAcres = computedAcres > 0 ? computedAcres : 0.5;
    const fieldSizePayload: FieldSizeValue = dontKnowSize
      ? {
          enteredValue: effectiveAcres,
          unit: 'Acre',
          acres: effectiveAcres,
          unknownSizeChoice: unknownChoice,
        }
      : {
          enteredValue: enteredNum || effectiveAcres,
          unit,
          acres: effectiveAcres,
        };

    persistFieldSizeGlobally(fieldSizePayload, syncToFarmerProfile);
    onChange(effectiveAcres, fieldSizePayload);
  }, [dontKnowSize, unknownChoice, enteredNum, unit, computedAcres]);

  const handleUnitChange = (newUnit: FieldSizeUnit) => {
    setUnit(newUnit);
    if (newUnit === 'Bigha' || newUnit === 'Katha') {
      const mem = loadBighaKathaMemory()[newUnit];
      if (mem && enteredNum > 0) {
        setManualApproxAcresStr(String(Number((enteredNum * mem).toFixed(2))));
        setEditingBighaKathaAcres(false);
      } else {
        setEditingBighaKathaAcres(true);
      }
    }
  };

  const handleSaveBighaKathaApprox = () => {
    if (!isBighaOrKatha) return;
    const approx = parseFloat(manualApproxAcresStr);
    if (!isNaN(approx) && approx > 0 && enteredNum > 0) {
      saveBighaKathaMemory(unit, approx / enteredNum);
      setEditingBighaKathaAcres(false);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 ${
        compact ? 'p-3 space-y-2.5' : 'p-3.5 sm:p-4 space-y-3'
      }`}
    >
      {/* Header Row + "I don't know my field size" Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-xs font-black text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
          <span>{label || t('field_size_label', lang)}</span>
        </label>

        <button
          type="button"
          onClick={() => setDontKnowSize(!dontKnowSize)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
            dontKnowSize
              ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-2xs'
              : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100/60'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {dontKnowSize ? '✓ ' : ''}
            {t('dont_know_field_size', lang)}
          </span>
        </button>
      </div>

      {!dontKnowSize ? (
        <div className="space-y-2.5">
          {/* Number + Unit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-6">
              <span className="text-[11px] font-bold text-stone-600 block mb-1">
                {t('enter_value_label', lang)}
              </span>
              <div className="flex items-start gap-1.5">
                <input
                  ref={numInputRef}
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={enteredStr}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEnteredStr(val);
                    if (isBighaOrKatha && rememberedUnitFactor && !editingBighaKathaAcres) {
                      const n = parseFloat(val);
                      if (!isNaN(n) && n > 0) {
                        setManualApproxAcresStr(String(Number((n * rememberedUnitFactor).toFixed(2))));
                      }
                    }
                  }}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white border-2 border-stone-300 focus:border-emerald-600 focus:outline-none text-sm font-black text-stone-900"
                />
                <VoiceMicButton
                  lang={lang}
                  size="sm"
                  expectNumber={true}
                  inputRef={numInputRef}
                  screenTopic="field size value"
                  fieldLabel="field size"
                  onTranscript={(txt) => {
                    const n = parseFloat(txt);
                    if (!isNaN(n) && n > 0) {
                      setEnteredStr(String(n));
                    }
                  }}
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <span className="text-[11px] font-bold text-stone-600 block mb-1">
                {t('select_unit_label', lang)}
              </span>
              <select
                value={unit}
                onChange={(e) => handleUnitChange(e.target.value as FieldSizeUnit)}
                className="w-full px-3 py-2 rounded-xl bg-white border-2 border-stone-300 focus:border-emerald-600 focus:outline-none text-sm font-black text-stone-900 cursor-pointer"
              >
                {FIELD_SIZE_UNITS.map((u) => (
                  <option key={u.unit} value={u.unit}>
                    {t(u.labelKey, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Special rule for Bigha & Katha: Do NOT guess (varies by state). Ask once "about how many acres?" */}
          {isBighaOrKatha && (
            <div className="p-3 rounded-xl bg-amber-100/90 border-2 border-amber-400 space-y-2">
              {rememberedUnitFactor && !editingBighaKathaAcres && computedAcres > 0 ? (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-stone-900">
                    ✓ {enteredNum} {unit} ≈ <strong>{computedAcres}</strong> {t('unit_acre', lang)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingBighaKathaAcres(true)}
                    className="text-[11px] font-black text-emerald-900 underline cursor-pointer"
                  >
                    {t('edit_btn', lang)}
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-stone-900">
                    {t('about_how_many_acres', lang, { unit })}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={approxInputRef}
                      type="number"
                      step="0.05"
                      min="0.05"
                      value={manualApproxAcresStr}
                      onChange={(e) => setManualApproxAcresStr(e.target.value)}
                      placeholder="e.g. 1.5"
                      className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white border-2 border-stone-800 text-xs font-black text-stone-900"
                    />
                    <VoiceMicButton
                      lang={lang}
                      size="sm"
                      expectNumber={true}
                      inputRef={approxInputRef}
                      screenTopic="approximate acres for bigha or katha"
                      fieldLabel="approximate acres"
                      onTranscript={(txt) => {
                        const n = parseFloat(txt);
                        if (!isNaN(n) && n > 0) {
                          setManualApproxAcresStr(String(n));
                          if (enteredNum > 0) {
                            saveBighaKathaMemory(unit, n / enteredNum);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveBighaKathaApprox}
                      className="px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>OK</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Internal Conversion Badge Showing Entered Value + Unit + Converted Acres */}
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-emerald-950 bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span>
              {enteredNum || 0} {unit} →{' '}
              <strong className="font-black text-emerald-800">
                {computedAcres > 0 ? computedAcres : 0} {t('unit_acre', lang)}
              </strong>
            </span>
            <span className="text-[10px] text-stone-500">
              {t('internal_calc_acres', lang, { acres: computedAcres > 0 ? computedAcres : 0 })}
            </span>
          </div>
        </div>
      ) : (
        /* Three Illustrated Picture Choices: Small, Medium, Large */
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: 'small' as const,
                acres: 0.5,
                title: t('size_small_title', lang),
                sub: t('size_small_sub', lang),
                svg: (
                  <svg viewBox="0 0 64 44" className="w-12 h-9 mx-auto mb-1" aria-hidden="true">
                    <rect x="10" y="14" width="44" height="24" rx="4" fill="#bbf7d0" stroke="#15803d" strokeWidth="2" />
                    <path d="M22 30 C22 20, 32 18, 32 18 C32 18, 42 20, 42 30" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="32" cy="18" r="4" fill="#16a34a" />
                  </svg>
                ),
              },
              {
                id: 'medium' as const,
                acres: 2.0,
                title: t('size_medium_title', lang),
                sub: t('size_medium_sub', lang),
                svg: (
                  <svg viewBox="0 0 64 44" className="w-12 h-9 mx-auto mb-1" aria-hidden="true">
                    <rect x="4" y="10" width="56" height="28" rx="4" fill="#86efac" stroke="#15803d" strokeWidth="2" />
                    <line x1="32" y1="10" x2="32" y2="38" stroke="#15803d" strokeWidth="1.5" strokeDasharray="3 2" />
                    <line x1="4" y1="24" x2="60" y2="24" stroke="#15803d" strokeWidth="1.5" strokeDasharray="3 2" />
                    <circle cx="18" cy="17" r="3" fill="#166534" />
                    <circle cx="46" cy="17" r="3" fill="#166534" />
                    <circle cx="18" cy="31" r="3" fill="#166534" />
                    <circle cx="46" cy="31" r="3" fill="#166534" />
                  </svg>
                ),
              },
              {
                id: 'large' as const,
                acres: 5.0,
                title: t('size_large_title', lang),
                sub: t('size_large_sub', lang),
                svg: (
                  <svg viewBox="0 0 64 44" className="w-12 h-9 mx-auto mb-1" aria-hidden="true">
                    <rect x="2" y="8" width="60" height="32" rx="4" fill="#4ade80" stroke="#14532d" strokeWidth="2" />
                    <path d="M6 32 L58 14 M6 22 L42 10 M22 38 L58 24" stroke="#14532d" strokeWidth="1.5" />
                    <rect x="24" y="16" width="16" height="10" rx="2" fill="#f59e0b" stroke="#1c1917" strokeWidth="1.5" />
                    <circle cx="27" cy="28" r="3.5" fill="#1c1917" />
                    <circle cx="37" cy="27" r="4.5" fill="#1c1917" />
                  </svg>
                ),
              },
            ].map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setUnknownChoice(card.id)}
                className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  unknownChoice === card.id
                    ? 'bg-emerald-900 text-white border-amber-400 shadow-md scale-[1.02]'
                    : 'bg-white text-stone-900 border-stone-200 hover:bg-emerald-50'
                }`}
              >
                {card.svg}
                <div className="font-black text-xs leading-tight">{card.title}</div>
                <div
                  className={`text-[10px] font-bold mt-0.5 ${
                    unknownChoice === card.id ? 'text-amber-300' : 'text-stone-500'
                  }`}
                >
                  {card.sub}
                </div>
              </button>
            ))}
          </div>

          <div className="text-[11px] font-bold text-emerald-950 bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200 text-center">
            {t('internal_calc_acres', lang, { acres: computedAcres })}
          </div>
        </div>
      )}
    </div>
  );
};
