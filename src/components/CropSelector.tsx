import React, { useState, useMemo, useEffect } from 'react';
import { Language, FarmerProfile } from '../types';
import cropsData from '../data/crops.json';
import { t } from '../services/translations';
import {
  Sprout,
  Search,
  Check,
  X,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';

export interface CropItemDef {
  id: string;
  icon: string;
  name_en: string;
  name_or: string;
  name_hi: string;
  name_te: string;
  name_bn: string;
  name_ta: string;
  has_advice?: boolean;
  categoryId: string;
}

export interface CropCategoryDef {
  id: string;
  icon: string;
  name: Record<string, string>;
  items: CropItemDef[];
}

const SESSION_CROP_KEY = 'krushak_session_selected_crop_id';
const LAST_USED_CROP_KEY = 'krushak_last_used_crop_id';

// Rich offline-ready illustrated card themes for each farming type category
const CATEGORY_CARD_STYLES: Record<
  string,
  { gradient: string; accent: string; patternColor: string }
> = {
  vegetables: {
    gradient: 'from-emerald-700 via-emerald-800 to-green-900',
    accent: 'bg-emerald-500/25 border-emerald-400/40',
    patternColor: '#34d399',
  },
  fruits: {
    gradient: 'from-amber-600 via-orange-700 to-amber-900',
    accent: 'bg-amber-400/25 border-amber-300/40',
    patternColor: '#fbbf24',
  },
  flowers: {
    gradient: 'from-rose-600 via-pink-700 to-rose-900',
    accent: 'bg-rose-400/25 border-rose-300/40',
    patternColor: '#fb7185',
  },
  cereals_millets: {
    gradient: 'from-yellow-700 via-amber-800 to-stone-900',
    accent: 'bg-yellow-400/25 border-yellow-300/40',
    patternColor: '#facc15',
  },
  pulses: {
    gradient: 'from-teal-700 via-emerald-800 to-teal-950',
    accent: 'bg-teal-400/25 border-teal-300/40',
    patternColor: '#2dd4bf',
  },
  oilseeds: {
    gradient: 'from-amber-700 via-yellow-800 to-amber-950',
    accent: 'bg-amber-400/25 border-amber-300/40',
    patternColor: '#f59e0b',
  },
  spices: {
    gradient: 'from-red-700 via-orange-800 to-red-950',
    accent: 'bg-red-400/25 border-red-300/40',
    patternColor: '#f87171',
  },
  cash_plantation: {
    gradient: 'from-green-800 via-emerald-900 to-stone-900',
    accent: 'bg-green-400/25 border-green-300/40',
    patternColor: '#4ade80',
  },
  fodder_grass: {
    gradient: 'from-lime-700 via-green-800 to-emerald-950',
    accent: 'bg-lime-400/25 border-lime-300/40',
    patternColor: '#a3e635',
  },
  medicinal_aromatic: {
    gradient: 'from-teal-800 via-cyan-900 to-emerald-950',
    accent: 'bg-cyan-400/25 border-cyan-300/40',
    patternColor: '#22d3ee',
  },
  trees_timber: {
    gradient: 'from-stone-700 via-emerald-950 to-stone-900',
    accent: 'bg-emerald-400/25 border-emerald-300/40',
    patternColor: '#6ee7b7',
  },
  mushrooms: {
    gradient: 'from-amber-800 via-stone-800 to-stone-950',
    accent: 'bg-amber-300/25 border-amber-200/40',
    patternColor: '#fcd34d',
  },
  nursery_ornamental: {
    gradient: 'from-emerald-600 via-teal-800 to-emerald-950',
    accent: 'bg-emerald-300/25 border-emerald-200/40',
    patternColor: '#5eead4',
  },
  other: {
    gradient: 'from-stone-700 via-stone-800 to-stone-950',
    accent: 'bg-stone-400/25 border-stone-300/40',
    patternColor: '#d6d3d1',
  },
};

export function getAllCropsCatalog(): {
  categories: CropCategoryDef[];
  byId: Map<string, CropItemDef>;
  byNameLower: Map<string, CropItemDef>;
} {
  const byId = new Map<string, CropItemDef>();
  const byNameLower = new Map<string, CropItemDef>();
  const categories: CropCategoryDef[] = (cropsData.categories || []).map((cat: any) => {
    const items: CropItemDef[] = (cat.items || []).map((item: any) => {
      const enriched: CropItemDef = {
        id: item.id,
        icon: item.icon || '🌱',
        name_en: item.name_en,
        name_or: item.name_or || item.name_en,
        name_hi: item.name_hi || item.name_en,
        name_te: item.name_te || item.name_en,
        name_bn: item.name_bn || item.name_en,
        name_ta: item.name_ta || item.name_en,
        has_advice: item.has_advice,
        categoryId: cat.id,
      };
      if (!byId.has(enriched.id)) {
        byId.set(enriched.id, enriched);
      }
      byNameLower.set(enriched.name_en.toLowerCase(), enriched);
      byNameLower.set(enriched.id.toLowerCase(), enriched);
      return enriched;
    });
    return {
      id: cat.id,
      icon: cat.icon || '🌾',
      name: cat.name || { en: cat.id },
      items,
    };
  });

  return { categories, byId, byNameLower };
}

export function getLocalizedCropName(crop: CropItemDef, lang: Language): string {
  switch (lang) {
    case 'or':
      return crop.name_or || crop.name_en;
    case 'hi':
      return crop.name_hi || crop.name_en;
    case 'te':
      return crop.name_te || crop.name_en;
    case 'bn':
      return crop.name_bn || crop.name_en;
    case 'ta':
      return crop.name_ta || crop.name_en;
    default:
      return crop.name_en;
  }
}

export function getInitialSelectedCropId(profile?: FarmerProfile | null): string {
  try {
    const sessionSaved = sessionStorage.getItem(SESSION_CROP_KEY);
    if (sessionSaved) return sessionSaved;
    const lastUsed = localStorage.getItem(LAST_USED_CROP_KEY);
    if (lastUsed) return lastUsed;
  } catch {}

  const { byId, byNameLower } = getAllCropsCatalog();
  const profileIds = profile?.cropIds || profile?.primaryCrops || profile?.crops || [];
  for (const raw of profileIds) {
    const clean = String(raw).trim();
    if (byId.has(clean)) return clean;
    const matched = byNameLower.get(clean.toLowerCase());
    if (matched) return matched.id;
  }
  return 'paddy';
}

export function persistSelectedCropId(cropId: string): void {
  try {
    sessionStorage.setItem(SESSION_CROP_KEY, cropId);
    localStorage.setItem(LAST_USED_CROP_KEY, cropId);
  } catch {}
}

interface CropSelectorProps {
  lang: Language;
  profile?: FarmerProfile | null;
  selectedCropId: string;
  onSelectCrop: (cropId: string, saveToProfile?: boolean) => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  lang,
  profile,
  selectedCropId,
  onSelectCrop,
}) => {
  const { categories, byId, byNameLower } = useMemo(() => getAllCropsCatalog(), []);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToMyCrops, setSaveToMyCrops] = useState(true);

  // Resolve farmer's profile crops into CropItemDef list
  const farmerCropChips = useMemo(() => {
    const rawList: string[] = [
      ...(profile?.cropIds || []),
      ...(profile?.primaryCrops || []),
      ...(profile?.crops || []),
    ];
    const resolved: CropItemDef[] = [];
    const seen = new Set<string>();

    for (const raw of rawList) {
      const key = String(raw || '').trim();
      if (!key) continue;
      const found = byId.get(key) || byNameLower.get(key.toLowerCase());
      if (found && !seen.has(found.id)) {
        seen.add(found.id);
        resolved.push(found);
      }
    }

    // Ensure currently selected crop is always visible in the chips row
    const activeCrop = byId.get(selectedCropId) || byNameLower.get(selectedCropId.toLowerCase());
    if (activeCrop && !seen.has(activeCrop.id)) {
      seen.add(activeCrop.id);
      resolved.unshift(activeCrop);
    }

    // Fallback default crops if farmer profile has none yet
    if (resolved.length === 0) {
      for (const fallbackId of ['paddy', 'tomato', 'moong', 'brinjal']) {
        const item = byId.get(fallbackId);
        if (item && !seen.has(item.id)) {
          seen.add(item.id);
          resolved.push(item);
        }
      }
    }

    return resolved;
  }, [profile, selectedCropId, byId, byNameLower]);

  useEffect(() => {
    if (selectedCropId) {
      persistSelectedCropId(selectedCropId);
    }
  }, [selectedCropId]);

  const handleChipClick = (cropId: string) => {
    persistSelectedCropId(cropId);
    onSelectCrop(cropId, false);
  };

  const handlePickFromModal = (crop: CropItemDef) => {
    persistSelectedCropId(crop.id);
    onSelectCrop(crop.id, saveToMyCrops);
    setIsPickerOpen(false);
    setSearchQuery('');
  };

  // Filtered items in modal
  const filteredModalCrops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list: CropItemDef[] = [];
    const seen = new Set<string>();

    const targetCategories =
      selectedCategoryId && !q
        ? categories.filter((c) => c.id === selectedCategoryId)
        : categories;

    for (const cat of targetCategories) {
      for (const item of cat.items) {
        if (seen.has(item.id)) continue;
        if (!q) {
          seen.add(item.id);
          list.push(item);
        } else {
          const matches =
            item.name_en.toLowerCase().includes(q) ||
            item.name_or.toLowerCase().includes(q) ||
            item.name_hi.toLowerCase().includes(q) ||
            item.name_te.toLowerCase().includes(q) ||
            item.name_bn.toLowerCase().includes(q) ||
            item.name_ta.toLowerCase().includes(q);
          if (matches) {
            seen.add(item.id);
            list.push(item);
          }
        }
      }
    }
    return list;
  }, [categories, selectedCategoryId, searchQuery]);

  return (
    <div className="rounded-3xl bg-white border-2 border-emerald-700/20 p-4 sm:p-5 shadow-xs text-left">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-sm sm:text-base font-black text-stone-900">
            {t('what_are_you_growing', lang)}
          </h2>
        </div>

        <button
          onClick={() => {
            setSelectedCategoryId(null);
            setSearchQuery('');
            setIsPickerOpen(true);
          }}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t('change_crop_btn', lang)}</span>
        </button>
      </div>

      {/* Farmer's Profile Crops as Interactive Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {farmerCropChips.map((crop) => {
          const isSelected = crop.id === selectedCropId;
          return (
            <button
              key={crop.id}
              onClick={() => handleChipClick(crop.id)}
              className={`inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer border-2 ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm scale-[1.01]'
                  : 'bg-stone-50 hover:bg-emerald-50 text-stone-800 border-stone-200'
              }`}
            >
              <span className="text-base leading-none">{crop.icon}</span>
              <span className="whitespace-nowrap">{getLocalizedCropName(crop, lang)}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />}
            </button>
          );
        })}
      </div>

      {/* Picker Modal: Step 1 Farming Types Picture Cards -> Step 2 Searchable Item List */}
      {isPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedCategoryId && (
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className="p-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white cursor-pointer"
                    title={t('back_btn', lang)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h3 className="text-base font-black leading-tight">
                    {t('what_are_you_growing', lang)}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {selectedCategoryId
                      ? t('pick_crop_item_title', lang)
                      : t('pick_farming_type_title', lang)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPickerOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar & "Save to my crops" Toggle */}
            <div className="p-3.5 sm:p-4 bg-stone-50 border-b border-stone-200 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_crops_placeholder', lang)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-white border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:border-emerald-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-xs font-extrabold text-stone-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveToMyCrops}
                    onChange={(e) => setSaveToMyCrops(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-700 cursor-pointer"
                  />
                  <span>{t('save_to_my_crops', lang)}</span>
                </label>

                {selectedCategoryId && (
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className="text-xs font-black text-emerald-800 underline cursor-pointer"
                  >
                    {t('all_categories_tab', lang)}
                  </button>
                )}
              </div>
            </div>

            {/* Body: Either Farming Types Picture Cards OR Searchable Crop List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {!selectedCategoryId && !searchQuery.trim() ? (
                <div>
                  <div className="text-xs font-black text-stone-600 mb-2.5">
                    {t('pick_farming_type_title', lang)}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories
                      .filter((c) => c.items.length > 0)
                      .map((cat) => {
                        const style =
                          CATEGORY_CARD_STYLES[cat.id] || CATEGORY_CARD_STYLES.other;
                        const catTitle = cat.name[lang] || cat.name.en || cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} text-white p-3.5 min-h-[104px] flex flex-col justify-between text-left shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer border border-white/15`}
                          >
                            {/* Botanical SVG Illustration Backdrop */}
                            <svg
                              viewBox="0 0 120 120"
                              className="w-20 h-20 absolute -right-3 -bottom-3 opacity-20 pointer-events-none group-hover:scale-110 transition-transform"
                              fill="none"
                            >
                              <circle
                                cx="60"
                                cy="60"
                                r="48"
                                stroke={style.patternColor}
                                strokeWidth="6"
                              />
                              <path
                                d="M60 15 C80 40, 80 80, 60 105 C40 80, 40 40, 60 15 Z"
                                fill={style.patternColor}
                              />
                            </svg>

                            <div className="flex items-center justify-between w-full relative z-10">
                              <span
                                className={`w-10 h-10 rounded-xl ${style.accent} border flex items-center justify-center text-2xl shadow-2xs`}
                              >
                                {cat.icon}
                              </span>
                              <span className="text-[11px] font-bold text-white/85 tabular-nums">
                                {cat.items.length}
                              </span>
                            </div>

                            <div className="relative z-10 mt-2">
                              <div className="text-xs sm:text-sm font-black leading-snug line-clamp-2">
                                {catTitle}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {filteredModalCrops.map((crop) => {
                      const isCurrent = crop.id === selectedCropId;
                      return (
                        <button
                          key={crop.id}
                          onClick={() => handlePickFromModal(crop)}
                          className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer min-h-[56px] ${
                            isCurrent
                              ? 'bg-emerald-50 border-emerald-700 text-emerald-950 shadow-2xs'
                              : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-900'
                          }`}
                        >
                          <span className="text-2xl shrink-0">{crop.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-black truncate">
                              {getLocalizedCropName(crop, lang)}
                            </div>
                            {lang !== 'en' && (
                              <div className="text-[10px] text-stone-500 font-semibold truncate">
                                {crop.name_en}
                              </div>
                            )}
                          </div>
                          {isCurrent && (
                            <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {filteredModalCrops.length === 0 && (
                    <div className="p-8 text-center text-xs text-stone-500 font-bold">
                      No matching crops found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
