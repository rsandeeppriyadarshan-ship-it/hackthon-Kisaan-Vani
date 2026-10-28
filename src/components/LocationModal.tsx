import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Language } from '../types';
import {
  requestAccurateUserLocation,
  reverseGeocodeCoordinates,
  buildUserLocationFromCoords,
  getGeolocationPermissionStatus,
  getMergedOdishaState,
  fetchAndStoreBlockVillages,
  searchAndStoreOdishaPlacesOnline,
  saveLearnedOdishaPlace,
  lookupPincodeData,
  UserLocation,
  GeolocationPermissionState,
  findNearestPoi
} from '../services/locationService';
import { t, translatePlaceName, formatLocalizedUnit } from '../services/translations';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  X,
  CheckCircle2,
  AlertTriangle,
  Search,
  Building2,
  Plane,
  FlaskConical,
  Loader2,
  Check,
  RefreshCw
} from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentDistrict: string;
  currentBlock?: string;
  currentVillage?: string;
  onSelectDistrict: (districtName: string) => void;
  onSelectPlace?: (place: {
    district: string;
    block: string;
    village: string;
    lat?: number;
    lon?: number;
    accuracyMeters?: number;
    placeName?: string;
    placeNameOr?: string;
    confirmed?: boolean;
  }) => void;
  onLocationDetected: (location: UserLocation) => void;
  savedLocation?: {
    lat: number;
    lon: number;
    accuracyMeters: number;
    placeName?: string;
    placeNameOr?: string;
    village?: string;
    block?: string;
    district?: string;
    confirmed?: boolean;
  } | null;
}

const attributionIds = ['gmp_mcp_codeassist_v1_aistudio'];

/**
 * Interactive Leaflet + OpenStreetMap fallback map with a draggable pin
 * when no Google Maps API key is present or when quota is exceeded.
 */
const LeafletPinMap: React.FC<{
  lat: number;
  lon: number;
  onPinMoved: (newLat: number, newLon: number) => void;
}> = ({ lat, lon, onPinMoved }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 14,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'krushak-draggable-pin',
      html: `<div style="width:32px;height:32px;border-radius:50%;background:#059669;border:3px solid #fbbf24;box-shadow:0 4px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([lat, lon], {
      draggable: true,
      icon: pinIcon
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onPinMoved(
        Math.round(pos.lat * 100000) / 100000,
        Math.round(pos.lng * 100000) / 100000
      );
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: cLat, lng: cLng } = e.latlng;
      marker.setLatLng([cLat, cLng]);
      onPinMoved(
        Math.round(cLat * 100000) / 100000,
        Math.round(cLng * 100000) / 100000
      );
    });

    mapRef.current = map;
    markerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const cur = markerRef.current.getLatLng();
      if (Math.abs(cur.lat - lat) > 0.0001 || Math.abs(cur.lng - lon) > 0.0001) {
        markerRef.current.setLatLng([lat, lon]);
        mapRef.current.setView([lat, lon], mapRef.current.getZoom());
      }
    }
  }, [lat, lon]);

  return <div ref={containerRef} className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden z-0" />;
};

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentDistrict,
  currentBlock,
  currentVillage,
  onSelectDistrict,
  onSelectPlace,
  onLocationDetected,
  savedLocation
}) => {
  const [addressVersion, setAddressVersion] = useState<number>(0);
  useEffect(() => {
    const onUpdated = () => setAddressVersion((v) => v + 1);
    window.addEventListener('krushak:addresses-updated', onUpdated);
    return () => window.removeEventListener('krushak:addresses-updated', onUpdated);
  }, []);

  const odishaState = useMemo(() => getMergedOdishaState(), [addressVersion]);

  const [selectedDistrict, setSelectedDistrict] = useState<string>(currentDistrict || 'Cuttack');
  const [selectedBlock, setSelectedBlock] = useState<string>(currentBlock || 'Cuttack Sadar');
  const [selectedVillage, setSelectedVillage] = useState<string>(currentVillage || 'Kandarpur');
  const [isCustomVillage, setIsCustomVillage] = useState<boolean>(false);
  const [customVillageText, setCustomVillageText] = useState<string>('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const [permState, setPermState] = useState<GeolocationPermissionState>('prompt');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [detectedLoc, setDetectedLoc] = useState<UserLocation | null>(null);
  const [pinCoords, setPinCoords] = useState<{ lat: number; lon: number }>({
    lat: savedLocation?.lat || 20.4625,
    lon: savedLocation?.lon || 85.883
  });
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(
    savedLocation?.accuracyMeters ?? null
  );
  const [geocodedPlaceLabel, setGeocodedPlaceLabel] = useState<string>('');
  const [geocodedPlaceOr, setGeocodedPlaceOr] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  const gmapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  const useGoogleMap = Boolean(gmapsApiKey && !gmpQuotaExceeded);

  useEffect(() => {
    const onQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  const [pincodeInput, setPincodeInput] = useState<string>('');
  const [pincodeAutoBanner, setPincodeAutoBanner] = useState<string>('');

  // Automatically lookup PIN Code when user types or inputs a 6-digit PIN Code in search or PIN input
  useEffect(() => {
    const rawTarget = pincodeInput || globalSearchQuery;
    const cleanPin = rawTarget.replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(cleanPin)) {
      setPincodeAutoBanner('');
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      lookupPincodeData(cleanPin).then((res) => {
        if (!active || !res) return;
        setSelectedDistrict(res.district_en);
        setSelectedBlock(res.block_en);
        if (res.villages && res.villages.length > 0 && res.villages[0].name_en) {
          setSelectedVillage(res.villages[0].name_en);
          setIsCustomVillage(false);
        }
        if (res.lat && res.lon) {
          setPinCoords({ lat: res.lat, lon: res.lon });
        }
        setGeocodedPlaceLabel('');
        const bannerMsg =
          lang === 'or'
            ? `✓ ପିନ୍ କୋଡ୍ ${cleanPin}: ଜିଲ୍ଲା ${res.district_or || res.district_en}, ବ୍ଲକ ${res.block_or || res.block_en} ସ୍ୱୟଂଚାଳିତ ଭାବେ ସେଟ୍ ହେଲା!`
            : `✓ PIN Code ${cleanPin} Verified: District ${res.district_en}, Block ${res.block_en} auto-populated!`;
        setPincodeAutoBanner(bannerMsg);
      });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [pincodeInput, globalSearchQuery]);

  // Dynamically fetch & store villages for the selected Block from Map APIs
  useEffect(() => {
    if (isOpen && selectedDistrict && selectedBlock) {
      fetchAndStoreBlockVillages(selectedDistrict, selectedBlock).catch(() => {});
    }
  }, [isOpen, selectedDistrict, selectedBlock]);

  // Dynamically search & store any Village or Block typed in the search box
  useEffect(() => {
    const q = globalSearchQuery.trim();
    if (!isOpen || q.length < 2) return;
    const timer = window.setTimeout(() => {
      searchAndStoreOdishaPlacesOnline(q, selectedDistrict, selectedBlock).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timer);
  }, [isOpen, globalSearchQuery, selectedDistrict, selectedBlock]);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      getGeolocationPermissionStatus().then(setPermState);
      setErrorMsg(null);
      const distObj =
        odishaState.districts.find((d) => d.name_en === currentDistrict) ||
        odishaState.districts[0];
      setSelectedDistrict(distObj.name_en);

      const blkObj =
        distObj.blocks.find((b) => b.name_en === currentBlock) || distObj.blocks[0];
      setSelectedBlock(blkObj.name_en);

      let vilObj = blkObj.villages[0];
      if (currentVillage) {
        const foundVil = blkObj.villages.find((v) => v.name_en === currentVillage);
        if (foundVil) {
          setIsCustomVillage(false);
          setSelectedVillage(currentVillage);
          vilObj = foundVil;
        } else {
          setSelectedVillage(blkObj.villages[0]?.name_en || '');
        }
      } else if (blkObj.villages[0]) {
        setSelectedVillage(blkObj.villages[0].name_en);
      }

      if (savedLocation?.lat && savedLocation?.lon) {
        setPinCoords({ lat: savedLocation.lat, lon: savedLocation.lon });
        setAccuracyMeters(savedLocation.accuracyMeters ?? 25);
        const loc = buildUserLocationFromCoords(
          savedLocation.lat,
          savedLocation.lon,
          savedLocation.accuracyMeters ?? 25,
          Date.now(),
          true
        );
        setDetectedLoc(loc);
      } else if (vilObj) {
        setPinCoords({ lat: vilObj.lat, lon: vilObj.lon });
      }
    }
  }, [isOpen, currentDistrict, currentBlock, currentVillage, odishaState.districts, savedLocation]);

  const currentDistrictObj = useMemo(() => {
    return (
      odishaState.districts.find((d) => d.name_en === selectedDistrict) ||
      odishaState.districts[0]
    );
  }, [odishaState.districts, selectedDistrict]);

  const currentBlockObj = useMemo(() => {
    return (
      currentDistrictObj.blocks.find((b) => b.name_en === selectedBlock) ||
      currentDistrictObj.blocks[0]
    );
  }, [currentDistrictObj, selectedBlock]);

  // Unified search across all Odisha Villages, Blocks & Districts
  const quickSearchMatches = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{
      districtEn: string;
      districtOr: string;
      blockEn: string;
      blockOr: string;
      villageEn: string;
      villageOr: string;
      lat: number;
      lon: number;
    }> = [];

    for (const d of odishaState.districts) {
      for (const b of d.blocks) {
        const blockOr = (b as { name_or?: string }).name_or || b.name_en;
        for (const v of b.villages) {
          const villageOr = (v as { name_or?: string }).name_or || v.name_en;
          if (
            v.name_en.toLowerCase().includes(q) ||
            villageOr.toLowerCase().includes(q) ||
            b.name_en.toLowerCase().includes(q) ||
            blockOr.toLowerCase().includes(q) ||
            d.name_en.toLowerCase().includes(q) ||
            (d.name_or && d.name_or.toLowerCase().includes(q))
          ) {
            results.push({
              districtEn: d.name_en,
              districtOr: d.name_or || d.name_en,
              blockEn: b.name_en,
              blockOr,
              villageEn: v.name_en,
              villageOr,
              lat: v.lat,
              lon: v.lon
            });
            if (results.length >= 24) return results;
          }
        }
      }
    }
    return results;
  }, [globalSearchQuery, odishaState.districts]);

  const localizedSelectedPlace = useMemo(() => {
    const vName = isCustomVillage ? customVillageText || selectedVillage : selectedVillage;
    return [
      translatePlaceName(vName, lang),
      translatePlaceName(selectedBlock, lang),
      translatePlaceName(selectedDistrict, lang)
    ]
      .filter(Boolean)
      .join(', ');
  }, [isCustomVillage, customVillageText, selectedVillage, selectedBlock, selectedDistrict, lang]);

  if (!isOpen) return null;

  const applyReverseGeocodedCoords = async (
    lat: number,
    lon: number,
    acc: number,
    autoApplyToParent = true
  ) => {
    setIsReverseGeocoding(true);
    try {
      const rev = await reverseGeocodeCoordinates(lat, lon, lang);
      setGeocodedPlaceLabel(rev.formatted_localized);
      setGeocodedPlaceOr(rev.formatted_or);

      setSelectedDistrict(rev.district_en);
      setSelectedBlock(rev.block_en);
      setSelectedVillage(rev.village_en);
      setIsCustomVillage(false);

      const updatedLoc = buildUserLocationFromCoords(lat, lon, acc, Date.now(), true);
      updatedLoc.nearestBlock = { name_en: rev.block_en, name_or: rev.block_or };
      updatedLoc.nearestVillage = { name_en: rev.village_en, name_or: rev.village_or };
      updatedLoc.placeNameEn = rev.formatted_en;
      updatedLoc.placeNameOr = rev.formatted_or;
      setDetectedLoc(updatedLoc);

      if (autoApplyToParent) {
        onLocationDetected(updatedLoc);
        onSelectDistrict(rev.district_en);
        if (onSelectPlace) {
          onSelectPlace({
            district: rev.district_en,
            block: rev.block_en,
            village: rev.village_en,
            lat,
            lon,
            accuracyMeters: acc,
            placeName: rev.formatted_localized,
            placeNameOr: rev.formatted_or,
            confirmed: true
          });
        }
      }
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // High-accuracy GPS detection (getCurrentPosition + watchPosition, lowest accuracy reading)
  const handleRequestAccurateGps = async () => {
    setIsDetecting(true);
    setErrorMsg(null);
    try {
      const loc = await requestAccurateUserLocation(3000, (progressLoc) => {
        setPinCoords({ lat: progressLoc.latitude, lon: progressLoc.longitude });
        setAccuracyMeters(progressLoc.accuracy);
      });
      setDetectedLoc(loc);
      setPinCoords({ lat: loc.latitude, lon: loc.longitude });
      setAccuracyMeters(loc.accuracy);
      setPermState('granted');
      await applyReverseGeocodedCoords(loc.latitude, loc.longitude, loc.accuracy, true);
    } catch (err: any) {
      if (err.message === 'PERMISSION_DENIED') {
        setPermState('denied');
        setErrorMsg(t('location_perm_denied_odia_guide', lang));
      } else {
        setErrorMsg(t('gps_signal_unavailable_msg', lang));
      }
    } finally {
      setIsDetecting(false);
    }
  };

  // Handle pin drag or map click
  const handlePinMovedOnMap = async (newLat: number, newLon: number) => {
    setPinCoords({ lat: newLat, lon: newLon });
    // Pin manually positioned by farmer -> high precision (~10m)
    const nextAcc = accuracyMeters && accuracyMeters < 30 ? accuracyMeters : 15;
    setAccuracyMeters(nextAcc);
    await applyReverseGeocodedCoords(newLat, newLon, nextAcc, false);
  };

  // Confirm location button: saves lat, lon, placeName, and accuracy to profile & weather
  const handleConfirmLocation = () => {
    const finalVillage = isCustomVillage
      ? customVillageText.trim() || selectedVillage
      : selectedVillage;
    const finalAcc = accuracyMeters ?? 25;

    const vilLoc = translatePlaceName(finalVillage, lang);
    const blkLoc = translatePlaceName(selectedBlock, lang);
    const distLoc = translatePlaceName(selectedDistrict, lang);

    const vilOr = translatePlaceName(finalVillage, 'or');
    const blkOr = translatePlaceName(selectedBlock, 'or');
    const distOr = translatePlaceName(selectedDistrict, 'or');

    saveLearnedOdishaPlace({
      district_en: selectedDistrict,
      district_or: distOr,
      block_en: selectedBlock,
      block_or: blkOr,
      village_en: finalVillage,
      village_or: vilOr,
      lat: pinCoords.lat,
      lon: pinCoords.lon
    });

    const confirmedUserLoc = buildUserLocationFromCoords(
      pinCoords.lat,
      pinCoords.lon,
      finalAcc,
      Date.now(),
      true
    );
    confirmedUserLoc.nearestBlock = { name_en: selectedBlock, name_or: blkOr };
    confirmedUserLoc.nearestVillage = { name_en: finalVillage, name_or: vilOr };
    confirmedUserLoc.placeNameEn = `${finalVillage}, ${selectedBlock}, ${selectedDistrict}`;
    confirmedUserLoc.placeNameOr = geocodedPlaceOr || `${vilOr}, ${blkOr}, ${distOr}`;

    onLocationDetected(confirmedUserLoc);
    onSelectDistrict(selectedDistrict);
    if (onSelectPlace) {
      onSelectPlace({
        district: selectedDistrict,
        block: selectedBlock,
        village: finalVillage,
        lat: pinCoords.lat,
        lon: pinCoords.lon,
        accuracyMeters: finalAcc,
        placeName: geocodedPlaceLabel || `${vilLoc}, ${blkLoc}, ${distLoc}`,
        placeNameOr: geocodedPlaceOr || `${vilOr}, ${blkOr}, ${distOr}`,
        confirmed: true
      });
    }
    onClose();
  };

  const nearestHospital = findNearestPoi(pinCoords.lat, pinCoords.lon, 'hospital');
  const nearestDrone = findNearestPoi(pinCoords.lat, pinCoords.lon, 'chc_drone');
  const nearestKvk = findNearestPoi(pinCoords.lat, pinCoords.lon, 'kvk_lab');

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border-2 border-emerald-600 animate-in zoom-in-95 duration-200 my-auto max-h-[94vh] flex flex-col text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-stone-950 rounded-2xl shadow-md">
              <MapPin className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {t('select_accurate_place_title', lang)}
              </h2>
              <p className="text-xs text-emerald-200">
                {t('select_accurate_place_subtitle', lang)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label={t('close_btn', lang)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Selected Place & Accuracy Bar + "Update location" Button */}
          <div className="bg-emerald-50/90 border-2 border-emerald-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-emerald-300 shadow-2xs flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    {t('selected_place_label', lang)}
                  </span>
                  {accuracyMeters !== null && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        accuracyMeters > 500
                          ? 'bg-amber-200 text-amber-950 border border-amber-400'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {t('accuracy_badge', lang, { meters: accuracyMeters })}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-black text-stone-900 truncate mt-0.5">
                  📍 {geocodedPlaceLabel || localizedSelectedPlace}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestAccurateGps}
                disabled={isDetecting}
                className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                {isDetecting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>
                  {isDetecting
                    ? t('detecting_best_gps', lang)
                    : t('update_location_btn', lang)}
                </span>
              </button>
            </div>

            {/* Warning if accuracy is worse than 500m */}
            {accuracyMeters !== null && accuracyMeters > 500 && (
              <div className="p-2.5 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 text-xs font-black flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{t('location_not_exact_warn', lang)}</span>
              </div>
            )}

            {/* Interactive Map with Draggable Pin (Google Maps JS API or Leaflet OpenStreetMap) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                <span>🗺️ {t('drag_pin_instruction', lang)}</span>
                {isReverseGeocoding && (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </span>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm bg-stone-100">
                {useGoogleMap ? (
                  <APIProvider apiKey={gmapsApiKey} language={lang}>
                    <div className="w-full h-56 sm:h-64">
                      <Map
                        defaultCenter={{ lat: pinCoords.lat, lng: pinCoords.lon }}
                        defaultZoom={14}
                        mapId="DEMO_MAP_ID"
                        internalUsageAttributionIds={attributionIds}
                        gestureHandling="greedy"
                        disableDefaultUI={false}
                        onClick={(ev) => {
                          const latLng = ev.detail?.latLng;
                          if (latLng) {
                            handlePinMovedOnMap(
                              Math.round(latLng.lat * 100000) / 100000,
                              Math.round(latLng.lng * 100000) / 100000
                            );
                          }
                        }}
                      >
                        <AdvancedMarker
                          position={{ lat: pinCoords.lat, lng: pinCoords.lon }}
                          draggable={true}
                          onDragEnd={(e) => {
                            if (e.latLng) {
                              handlePinMovedOnMap(
                                Math.round(e.latLng.lat() * 100000) / 100000,
                                Math.round(e.latLng.lng() * 100000) / 100000
                              );
                            }
                          }}
                        >
                          <Pin
                            background="#059669"
                            borderColor="#fbbf24"
                            glyphColor="#ffffff"
                          />
                        </AdvancedMarker>
                      </Map>
                    </div>
                  </APIProvider>
                ) : (
                  <LeafletPinMap
                    lat={pinCoords.lat}
                    lon={pinCoords.lon}
                    onPinMoved={handlePinMovedOnMap}
                  />
                )}
              </div>
            </div>

            {/* Confirm Location Button */}
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {t('confirm_location_btn', lang)} ({localizedSelectedPlace})
              </span>
            </button>
          </div>

          {/* Permission Denied or GPS Error Message in Odia */}
          {(errorMsg || permState === 'denied') && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{errorMsg || t('location_perm_denied_odia_guide', lang)}</span>
            </div>
          )}

          {/* Manual Fallback: Search PIN Code, Village, Block or District Selectors */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder={`🔍 ${t('search_village_block_district', lang)}`}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-stone-300 bg-white text-xs sm:text-sm font-bold text-stone-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="📮 PIN Code (753001)"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 text-xs sm:text-sm font-mono font-black text-emerald-950 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            {pincodeAutoBanner && (
              <div className="p-2.5 rounded-xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 text-xs font-black flex items-center justify-between">
                <span>{pincodeAutoBanner}</span>
                <button
                  type="button"
                  onClick={() => setPincodeAutoBanner('')}
                  className="p-1 text-emerald-800 hover:text-emerald-950 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {quickSearchMatches.length > 0 && (
              <div className="max-h-40 overflow-y-auto bg-white rounded-xl border-2 border-emerald-500 divide-y divide-stone-100 shadow-md">
                {quickSearchMatches.map((m, idx) => (
                  <button
                    key={`${m.districtEn}-${m.blockEn}-${m.villageEn}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedDistrict(m.districtEn);
                      setSelectedBlock(m.blockEn);
                      setSelectedVillage(m.villageEn);
                      setPinCoords({ lat: m.lat, lon: m.lon });
                      setGeocodedPlaceLabel('');
                      setIsCustomVillage(false);
                      setGlobalSearchQuery('');
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 flex items-center justify-between gap-2 text-xs cursor-pointer"
                  >
                    <div>
                      <span className="font-black text-emerald-950">
                        {lang === 'or' ? m.villageOr : m.villageEn}
                      </span>
                      <span className="text-stone-600 font-semibold ml-1.5">
                        • {lang === 'or' ? m.blockOr : m.blockEn} •{' '}
                        {lang === 'or' ? m.districtOr : m.districtEn}
                      </span>
                    </div>
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. District */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-stone-700">
                  1. {t('district_label', lang)}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    const nextDist = e.target.value;
                    setSelectedDistrict(nextDist);
                    setGeocodedPlaceLabel('');
                    const dObj = odishaState.districts.find((d) => d.name_en === nextDist);
                    if (dObj && dObj.blocks[0]) {
                      setSelectedBlock(dObj.blocks[0].name_en);
                      if (dObj.blocks[0].villages[0]) {
                        const v0 = dObj.blocks[0].villages[0];
                        setSelectedVillage(v0.name_en);
                        setPinCoords({ lat: v0.lat, lon: v0.lon });
                        setIsCustomVillage(false);
                      }
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-stone-300 bg-white font-bold text-xs sm:text-sm text-stone-900 focus:border-emerald-600 focus:outline-none cursor-pointer"
                >
                  {odishaState.districts.map((d) => (
                    <option key={d.code} value={d.name_en}>
                      {lang === 'or' ? d.name_or : translatePlaceName(d.name_en, lang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Block */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase text-stone-700">
                  2. {t('block_label', lang)}
                </label>
                <select
                  value={selectedBlock}
                  onChange={(e) => {
                    const nextBlk = e.target.value;
                    setSelectedBlock(nextBlk);
                    setGeocodedPlaceLabel('');
                    const bObj = currentDistrictObj.blocks.find((b) => b.name_en === nextBlk);
                    if (bObj && bObj.villages[0]) {
                      const v0 = bObj.villages[0];
                      setSelectedVillage(v0.name_en);
                      setPinCoords({ lat: v0.lat, lon: v0.lon });
                      setIsCustomVillage(false);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-stone-300 bg-white font-bold text-xs sm:text-sm text-stone-900 focus:border-emerald-600 focus:outline-none cursor-pointer"
                >
                  {currentDistrictObj.blocks.map((b) => {
                    const blkOr = (b as { name_or?: string }).name_or || b.name_en;
                    return (
                      <option key={b.name_en} value={b.name_en}>
                        {lang === 'or' ? blkOr : translatePlaceName(b.name_en, lang)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 3. Village */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black uppercase text-stone-700">
                    3. {t('village_label', lang)}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomVillage(!isCustomVillage)}
                    className="text-[10px] font-black text-emerald-800 underline cursor-pointer"
                  >
                    {isCustomVillage
                      ? t('choose_from_list', lang)
                      : t('village_not_listed', lang)}
                  </button>
                </div>

                {!isCustomVillage ? (
                  <select
                    value={selectedVillage}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomVillage(true);
                      } else {
                        const nextV = e.target.value;
                        setSelectedVillage(nextV);
                        setGeocodedPlaceLabel('');
                        const vObj = currentBlockObj.villages.find((v) => v.name_en === nextV);
                        if (vObj) {
                          setPinCoords({ lat: vObj.lat, lon: vObj.lon });
                        }
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-stone-300 bg-white font-bold text-xs sm:text-sm text-stone-900 focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    {currentBlockObj.villages.map((v) => {
                      const vilOr = (v as { name_or?: string }).name_or || v.name_en;
                      return (
                        <option key={v.name_en} value={v.name_en}>
                          {lang === 'or' ? vilOr : translatePlaceName(v.name_en, lang)}
                        </option>
                      );
                    })}
                    <option value="__CUSTOM__">+ {t('village_not_listed', lang)}</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customVillageText}
                    onChange={(e) => setCustomVillageText(e.target.value)}
                    placeholder={t('type_village_placeholder', lang)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-amber-500 bg-white font-bold text-xs sm:text-sm text-stone-900"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Nearest Emergency & Farm Hubs Summary */}
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            {nearestHospital && (
              <div className="bg-red-50 p-2.5 rounded-xl border border-red-100">
                <div className="font-bold text-red-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('hospital_label', lang)}</span>
                </div>
                <div className="text-stone-700 font-bold mt-0.5">
                  {formatLocalizedUnit(nearestHospital.distanceKm, 'km', lang)}
                </div>
              </div>
            )}
            {nearestDrone && (
              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                <div className="font-bold text-blue-800 flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('chc_drone_label', lang)}</span>
                </div>
                <div className="text-stone-700 font-bold mt-0.5">
                  {formatLocalizedUnit(nearestDrone.distanceKm, 'km', lang)}
                </div>
              </div>
            )}
            {nearestKvk && (
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                <div className="font-bold text-amber-900 flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('kvk_soil_lab_label', lang)}</span>
                </div>
                <div className="text-stone-700 font-bold mt-0.5">
                  {formatLocalizedUnit(nearestKvk.distanceKm, 'km', lang)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
