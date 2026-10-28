import React, { useState, useMemo, useEffect } from 'react';
import { Language } from '../../types';
import { ODISHA_DISTRICTS_GEO, OFFLINE_MAP_POINTS, MapPointOfInterest, DistrictGeo } from '../../data/offlineMapData';
import { AudioPlayerCard } from '../common/AudioPlayerCard';
import { 
  UserLocation, 
  requestUserLocation, 
  calculateHaversineDistance,
  findNearestPoi 
} from '../../services/locationService';
import {
  MapPin,
  PhoneCall,
  Search,
  Filter,
  Building2,
  HeartPulse,
  Compass,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  Locate,
  AlertCircle
} from 'lucide-react';

interface OfflineMapProps {
  lang: Language;
  currentDistrict?: string;
  onDistrictSelect?: (district: string) => void;
  userLocation?: UserLocation | null;
  onLocationUpdate?: (location: UserLocation) => void;
  onOpenLocationModal?: () => void;
}

export const OfflineMap: React.FC<OfflineMapProps> = ({
  lang,
  currentDistrict = 'Khordha',
  onDistrictSelect,
  userLocation: propUserLocation,
  onLocationUpdate,
  onOpenLocationModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hospital' | 'chc_drone' | 'kvk_lab'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePoi, setActivePoi] = useState<MapPointOfInterest | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictGeo | null>(null);

  // Local state for GPS if not provided from parent
  const [localLocation, setLocalLocation] = useState<UserLocation | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [sortByDistance, setSortByDistance] = useState<boolean>(true);

  const effectiveLocation = propUserLocation || localLocation;

  // Sync current district if passed as prop
  useEffect(() => {
    if (currentDistrict && currentDistrict !== 'all') {
      setSelectedDistrict(currentDistrict);
    }
  }, [currentDistrict]);

  // Handle GPS location request & permission
  const handleRequestGps = async () => {
    setIsDetectingGps(true);
    setGpsError(null);

    try {
      const loc = await requestUserLocation();
      setLocalLocation(loc);
      if (onLocationUpdate) {
        onLocationUpdate(loc);
      }
      // If user is near an Odisha district, offer or auto-switch to it
      if (onDistrictSelect && loc.nearestDistrict) {
        onDistrictSelect(loc.nearestDistrict.name_en);
        setSelectedDistrict(loc.nearestDistrict.name_en);
      }
    } catch (err: any) {
      if (err.message === 'PERMISSION_DENIED') {
        setGpsError(
          lang === 'or'
            ? 'ମାନଚିତ୍ର ଲୋକେସନ୍ ଅନୁମତି ଅସ୍ୱୀକୃତ। ବ୍ରାଉଜର ଠିକଣା ବାର୍ (Address Bar) ରେ ତାଲା 🔒 ବା ସେଟିଂସ୍ ଚିହ୍ନ ଛୁଇଁ Location କୁ "Allow" କରନ୍ତୁ।'
            : 'Map location permission denied. Tap the lock icon 🔒 in your browser address bar and enable Location access to turn on live GPS map.'
        );
      } else if (err.message === 'TIMEOUT') {
        setGpsError(
          lang === 'or'
            ? 'ଜିପିଏସ୍ ସଙ୍କେତ ସମୟ ସମାପ୍ତ (GPS Timeout)। ଦୟାକରି ଖୋଲା ସ୍ଥାନରେ ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।'
            : 'GPS acquisition timed out. Please retry outdoors with clear sky view.'
        );
      } else {
        setGpsError(
          lang === 'or'
            ? 'ଲୋକେସନ୍ ଅନୁମତି ପାଇବାରେ ଅସୁବିଧା ହେଲା। ଦୟାକରି ସ୍ଥାନ ତାଲିକାରୁ ବାଛନ୍ତୁ।'
            : 'Could not access device location. Please choose your district manually.'
        );
      }
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Find nearest key emergency POIs when GPS is active
  const nearestHospital = useMemo(() => {
    if (!effectiveLocation) return null;
    return findNearestPoi(effectiveLocation.latitude, effectiveLocation.longitude, 'hospital');
  }, [effectiveLocation]);

  const nearestDrone = useMemo(() => {
    if (!effectiveLocation) return null;
    return findNearestPoi(effectiveLocation.latitude, effectiveLocation.longitude, 'chc_drone');
  }, [effectiveLocation]);

  const nearestKvk = useMemo(() => {
    if (!effectiveLocation) return null;
    return findNearestPoi(effectiveLocation.latitude, effectiveLocation.longitude, 'kvk_lab');
  }, [effectiveLocation]);

  // Filtered Points of Interest with distance computation
  const filteredPois = useMemo(() => {
    const list = OFFLINE_MAP_POINTS.filter((poi) => {
      // Category filter
      if (selectedCategory !== 'all' && poi.type !== selectedCategory) {
        return false;
      }
      // District filter
      if (selectedDistrict !== 'all' && poi.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = poi.name_en.toLowerCase().includes(query) || poi.name_or.toLowerCase().includes(query);
        const matchesLoc = poi.block_or_location.toLowerCase().includes(query) || poi.district.toLowerCase().includes(query);
        const matchesPhone = poi.phone.includes(query);
        const matchesFeature = poi.features_en.some(f => f.toLowerCase().includes(query)) ||
                               poi.features_or.some(f => f.includes(query));
        return matchesName || matchesLoc || matchesPhone || matchesFeature;
      }
      return true;
    }).map((poi) => {
      let distanceKm: number | null = null;
      if (effectiveLocation) {
        distanceKm = calculateHaversineDistance(
          effectiveLocation.latitude,
          effectiveLocation.longitude,
          poi.coordinates.lat,
          poi.coordinates.lng
        );
      }
      return { ...poi, distanceKm };
    });

    if (effectiveLocation && sortByDistance) {
      list.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return list;
  }, [selectedCategory, selectedDistrict, searchQuery, effectiveLocation, sortByDistance]);

  const handleDistrictClick = (districtName: string) => {
    const nextDistrict = selectedDistrict.toLowerCase() === districtName.toLowerCase() ? 'all' : districtName;
    setSelectedDistrict(nextDistrict);
    if (onDistrictSelect && nextDistrict !== 'all') {
      onDistrictSelect(nextDistrict);
    }
  };

  const getPoiColor = (type: MapPointOfInterest['type']) => {
    switch (type) {
      case 'hospital':
        return {
          bg: 'bg-red-600',
          text: 'text-red-700',
          border: 'border-red-500',
          ring: 'ring-red-400',
          badge: 'bg-red-100 text-red-800 border-red-200',
          svgFill: '#DC2626'
        };
      case 'chc_drone':
        return {
          bg: 'bg-emerald-600',
          text: 'text-emerald-700',
          border: 'border-emerald-500',
          ring: 'ring-emerald-400',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          svgFill: '#059669'
        };
      case 'kvk_lab':
        return {
          bg: 'bg-blue-600',
          text: 'text-blue-700',
          border: 'border-blue-500',
          ring: 'ring-blue-400',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          svgFill: '#2563EB'
        };
    }
  };

  const audioGuideText = lang === 'or'
    ? 'ଓଡ଼ିଶା ଅଫଲାଇନ୍ ମାନଚିତ୍ର ସହାୟତା: ବିଲରେ ଇଣ୍ଟରନେଟ୍ ନଥିଲେ ମଧ୍ୟ ଏହି ମାନଚିତ୍ର ସମ୍ପୂର୍ଣ୍ଣ କାର୍ଯ୍ୟକ୍ଷମ। ଲାଇଭ୍ ଜିପିଏସ୍ ଅନ୍ କଲେ ଆପଣଙ୍କ ନିକଟତମ ହସ୍ପିଟାଲ ଓ ଡ୍ରୋନ୍ କେନ୍ଦ୍ରର ଦୂରତା ଦେଖାଯିବ। ସାପ କାମୁଡ଼ିଲେ ତୁରନ୍ତ ଲାଲ୍ ରଙ୍ଗର ହସ୍ପିଟାଲ୍ ଚିହ୍ନ ଛୁଇଁ ୧୦୮ କୁ କଲ୍ କରନ୍ତୁ।'
    : 'Odisha Offline Map Assistance: This interactive map works completely without internet in remote paddy fields. Turn on Live GPS to view distances to the nearest hospital and drone hubs. For snakebite emergencies, tap red hospital markers to dial 108 or hospital casualties directly.';

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden border border-emerald-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{lang === 'or' ? '୧୦୦% ଅଫଲାଇନ୍ ନେଟୱାର୍କ ବିନା କାର୍ଯ୍ୟକ୍ଷମ' : '100% Offline • Zero Tile Server Dependency'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {lang === 'or' ? 'ଓଡ଼ିଶା କୃଷି ଓ ଜରୁରୀକାଳୀନ ମାନଚିତ୍ର' : 'Odisha Farm & Emergency Map'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              {lang === 'or'
                ? '୩୦ଟି ଜିଲ୍ଲାର ୨୪x୭ ଆଣ୍ଟି-ସ୍ନେକ୍ ଭେନମ୍ (ASV) ଡାକ୍ତରଖାନା, କୃଷି ଡ୍ରୋନ୍ କେନ୍ଦ୍ର ଓ ମୃତ୍ତିକା ପରୀକ୍ଷାଗାର ତଥ୍ୟ।'
                : 'Interactive vector map of 30 districts locating 24x7 ASV snakebite casualty hospitals, Agri Drone CHC hubs, and KVK soil testing labs.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* GPS Turn On Button */}
            <button
              onClick={handleRequestGps}
              disabled={isDetectingGps}
              className={`inline-flex items-center gap-2 font-black px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
                effectiveLocation
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
              }`}
            >
              <Locate className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>
                {isDetectingGps
                  ? (lang === 'or' ? 'ଅନୁମତି ଯାଞ୍ଚ...' : 'Checking GPS...')
                  : effectiveLocation
                  ? (lang === 'or' ? 'ଜିପିଏସ୍ ସକ୍ରିୟ ✓' : 'Live GPS On ✓')
                  : (lang === 'or' ? 'ଜିପିଏସ୍ ଅନ୍ କରନ୍ତୁ' : 'Turn On Map GPS')}
              </span>
            </button>

            {/* Change Location Button */}
            <button
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm border border-white/20 transition-all active:scale-95"
            >
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>{lang === 'or' ? 'ସ୍ଥାନ ବଦଳାନ୍ତୁ' : 'Change Location'}</span>
            </button>

            {/* 108 Emergency */}
            <a
              href="tel:108"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>{lang === 'or' ? '୧୦୮' : '108 EMERGENCY'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Permission Denied / Error Banner */}
      {gpsError && (
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-4 sm:p-5 text-left text-red-900 shadow-sm animate-in fade-in space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{lang === 'or' ? 'ମାନଚିତ୍ର ଲୋକେସନ୍ ଅନୁମତି ଆବଶ୍ୟକ' : 'Map Geolocation Permission Needed'}</span>
            </div>
            <button
              onClick={() => setGpsError(null)}
              className="text-xs font-bold text-red-600 hover:text-red-900 px-2 py-0.5 rounded-md hover:bg-red-100"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-red-800 leading-relaxed font-medium">
            {gpsError}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleRequestGps}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-xs transition-colors"
            >
              {lang === 'or' ? 'ପୁନଃ ଅନୁମତି ମାଗନ୍ତୁ' : 'Retry Permission'}
            </button>
            <button
              onClick={onOpenLocationModal}
              className="px-3 py-1.5 rounded-xl bg-white border border-red-300 text-red-900 text-xs font-bold hover:bg-red-100/50 transition-colors"
            >
              {lang === 'or' ? 'ମାନୁଆଲି ଜିଲ୍ଲା ବାଛନ୍ତୁ' : 'Select District Manually'}
            </button>
          </div>
        </div>
      )}

      {/* Live GPS Active Status Bar */}
      {effectiveLocation && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-emerald-950 text-white rounded-3xl p-4 sm:p-5 shadow-md border border-blue-600/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-800/80">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <div>
                <h4 className="font-extrabold text-sm text-cyan-200">
                  {lang === 'or' ? 'ଲାଇଭ୍ ଜିପିଏସ୍ ସ୍ଥିତି (You Are Here)' : 'Live GPS Location Tracking Active'}
                </h4>
                <p className="text-[11px] text-blue-200 font-mono">
                  {effectiveLocation.latitude}°N, {effectiveLocation.longitude}°E • {lang === 'or' ? 'ସଠିକତା' : 'Accuracy'}: ±{effectiveLocation.accuracy}m
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-950 px-3 py-1 rounded-xl border border-blue-700 text-amber-300 font-bold">
                {lang === 'or' ? 'ନିକଟତମ:' : 'Nearest:'} {lang === 'or' ? effectiveLocation.nearestDistrict.name_or : effectiveLocation.nearestDistrict.name_en} ({effectiveLocation.distanceToDistrictKm} km)
              </span>
            </div>
          </div>

          {/* Quick Distances to Emergency Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            {nearestHospital && (
              <div 
                onClick={() => setActivePoi(nearestHospital.poi)}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-red-400/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-red-300 font-black uppercase flex items-center gap-1">
                    <HeartPulse className="w-3 h-3 text-red-400" />
                    <span>{lang === 'or' ? 'ନିକଟତମ ସାପକାମୁଡ଼ା ASV' : 'Nearest ASV Hospital'}</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate mt-0.5">
                    {lang === 'or' ? nearestHospital.poi.name_or : nearestHospital.poi.name_en}
                  </div>
                </div>
                <span className="text-xs font-black text-amber-300 shrink-0">
                  {nearestHospital.distanceKm} km
                </span>
              </div>
            )}

            {nearestDrone && (
              <div 
                onClick={() => setActivePoi(nearestDrone.poi)}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-emerald-400/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-emerald-300 font-black uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{lang === 'or' ? 'ନିକଟତମ ଡ୍ରୋନ୍ CHC' : 'Nearest Drone Hub'}</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate mt-0.5">
                    {lang === 'or' ? nearestDrone.poi.name_or : nearestDrone.poi.name_en}
                  </div>
                </div>
                <span className="text-xs font-black text-amber-300 shrink-0">
                  {nearestDrone.distanceKm} km
                </span>
              </div>
            )}

            {nearestKvk && (
              <div 
                onClick={() => setActivePoi(nearestKvk.poi)}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-blue-400/40 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-cyan-300 font-black uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    <span>{lang === 'or' ? 'ନିକଟତମ କେଭିକେ ଲ୍ୟାବ୍' : 'Nearest KVK Soil Lab'}</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate mt-0.5">
                    {lang === 'or' ? nearestKvk.poi.name_or : nearestKvk.poi.name_en}
                  </div>
                </div>
                <span className="text-xs font-black text-amber-300 shrink-0">
                  {nearestKvk.distanceKm} km
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio Guide with Interactive Progress Bar */}
      <div>
        <AudioPlayerCard
          title={lang === 'or' ? 'ଅଫଲାଇନ୍ ମାନଚିତ୍ର ଓ ଜରୁରୀକାଳୀନ ଅଡିଓ ଗାଇଡ୍' : 'Offline Map & Emergency Audio Instructions'}
          subtitle={lang === 'or' ? 'ଇଣ୍ଟରନେଟ୍ ବିନା ହସ୍ପିଟାଲ୍ ଓ ଡ୍ରୋନ୍ ସେଣ୍ଟର ଖୋଜିବା ନିୟମ' : 'Spoken instructions for locating emergency hospitals and farm hubs offline'}
          textToSpeak={audioGuideText}
          lang={lang}
          accentColor="emerald"
        />
      </div>

      {/* Control Panel: Category Pills & District Dropdown & Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-stone-200 space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {lang === 'or' ? 'ସମସ୍ତ ସୁବିଧା (All)' : 'All Facilities'}
          </button>

          <button
            onClick={() => setSelectedCategory('hospital')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              selectedCategory === 'hospital'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{lang === 'or' ? '୨୪x୭ ସାପକାମୁଡ଼ା ହସ୍ପିଟାଲ (ASV)' : '24x7 ASV Hospitals'}</span>
          </button>

          <button
            onClick={() => setSelectedCategory('chc_drone')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              selectedCategory === 'chc_drone'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'or' ? 'ଡ୍ରୋନ୍ ଓ କୃଷି ଯନ୍ତ୍ରପାତି (CHC)' : 'Drones & CHC Hubs'}</span>
          </button>

          <button
            onClick={() => setSelectedCategory('kvk_lab')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              selectedCategory === 'kvk_lab'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{lang === 'or' ? 'କେଭିକେ ଓ ମୃତ୍ତିକା ପରୀକ୍ଷା (KVK)' : 'KVK & Soil Labs'}</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* District Dropdown & Change Button (7 cols) */}
          <div className="sm:col-span-7 flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 shrink-0">
              {lang === 'or' ? 'ଜିଲ୍ଲା:' : 'District:'}
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictClick(e.target.value)}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-emerald-600"
            >
              <option value="all">
                {lang === 'or' ? 'ସମଗ୍ର ଓଡ଼ିଶା (All 30 Districts)' : 'All 30 Districts (Entire Odisha)'}
              </option>
              {ODISHA_DISTRICTS_GEO.map((d) => (
                <option key={d.name} value={d.name}>
                  {lang === 'or' ? `${d.name_or} (${d.name})` : `${d.name} (${d.name_or})`}
                </option>
              ))}
            </select>
            <button
              onClick={onOpenLocationModal}
              className="px-3 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold shrink-0 transition-colors"
              title="Search or GPS pick"
            >
              {lang === 'or' ? 'ବଦଳାନ୍ତୁ' : 'Pick'}
            </button>
          </div>

          {/* Search Box (5 cols) */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'or' ? 'ହସ୍ପିଟାଲ, ଡ୍ରୋନ୍, ବ୍ଲକ୍ ବା ଫୋନ୍ ଖୋଜନ୍ତୁ...' : 'Search hospital, drone, block or phone...'}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Main Map & Detail Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG Vector Map (Left/Top 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-700" />
              <h3 className="font-extrabold text-stone-900 text-sm">
                {lang === 'or' ? 'ଓଡ଼ିଶା ଭୌଗୋଳିକ ଭେକ୍ଟର ମାନଚିତ୍ର' : 'Odisha Vector Spatial Map'}
              </h3>
            </div>
            <div className="text-xs text-stone-500 font-semibold">
              {hoveredDistrict
                ? (lang === 'or' ? `ଚୟନିତ: ${hoveredDistrict.name_or}` : `Hovered: ${hoveredDistrict.name}`)
                : (lang === 'or' ? 'ଜିଲ୍ଲା ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ' : 'Click any district node')}
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[6/5] bg-gradient-to-b from-stone-50 via-emerald-50/20 to-teal-50/30 rounded-2xl overflow-hidden border border-stone-100 mt-3 flex items-center justify-center p-2">
            <svg
              viewBox="0 0 580 520"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
            >
              <defs>
                {/* Coastal gradient */}
                <linearGradient id="bayOfBengalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.30" />
                </linearGradient>

                {/* State land gradient */}
                <linearGradient id="odishaLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f5f5f4" />
                  <stop offset="50%" stopColor="#fef3c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ecfdf5" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Bay of Bengal Coast Water Area (South East) */}
              <path
                d="M 370 470 Q 450 360 480 300 Q 510 240 560 180 L 575 510 L 350 515 Z"
                fill="url(#bayOfBengalGrad)"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <text
                x="470"
                y="410"
                fill="#0284c7"
                fontSize="12"
                fontWeight="900"
                letterSpacing="2"
                opacity="0.65"
                transform="rotate(-28 470 410)"
              >
                {lang === 'or' ? '~ ବଙ୍ଗୋପସାଗର ~' : '~ BAY OF BENGAL ~'}
              </text>

              {/* Odisha State Simplified Land Polygon */}
              <polygon
                points="
                  240,65 310,65 420,70 480,75 520,110 500,165 470,200 455,270 420,320 
                  360,390 320,440 220,450 140,465 75,495 105,420 120,340 115,260 
                  165,190 215,120 240,65
                "
                fill="url(#odishaLandGrad)"
                stroke="#a8a29e"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Major Highway Arteries (NH-16 Coastal Corridor & NH-53 Sambalpur Highway) */}
              {/* NH-16 (Balasore -> Cuttack -> Bhubaneswar -> Berhampur) */}
              <path
                d="M 485 135 L 470 180 L 415 235 L 395 265 L 345 365 L 315 415"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="5 3"
                opacity="0.6"
              />
              {/* NH-53 (Sambalpur -> Angul -> Cuttack) */}
              <path
                d="M 195 205 L 250 185 L 335 205 L 375 210 L 415 235"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5 3"
                opacity="0.6"
              />
              {/* NH-26 (Bargarh -> Bolangir -> Bhawanipatna -> Koraput) */}
              <path
                d="M 195 205 L 195 265 L 175 335 L 155 425 L 95 475"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="5 3"
                opacity="0.5"
              />

              {/* Render District Hubs / Nodes */}
              {ODISHA_DISTRICTS_GEO.map((dist) => {
                const isSelected = selectedDistrict.toLowerCase() === dist.name.toLowerCase();
                const isCurrent = currentDistrict.toLowerCase() === dist.name.toLowerCase();

                return (
                  <g
                    key={dist.name}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => handleDistrictClick(dist.name)}
                    onMouseEnter={() => setHoveredDistrict(dist)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                  >
                    {/* Circle Node */}
                    <circle
                      cx={dist.svgX}
                      cy={dist.svgY}
                      r={isSelected ? 14 : isCurrent ? 11 : 8}
                      fill={isSelected ? '#059669' : isCurrent ? '#0284c7' : '#ffffff'}
                      stroke={isSelected ? '#064e3b' : isCurrent ? '#0369a1' : '#78716c'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all"
                    />

                    {/* Outer pulse if selected */}
                    {isSelected && (
                      <circle
                        cx={dist.svgX}
                        cy={dist.svgY}
                        r={20}
                        fill="none"
                        stroke="#059669"
                        strokeWidth="1.5"
                        opacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* District Name Label */}
                    <text
                      x={dist.svgX}
                      y={dist.svgY - 11}
                      textAnchor="middle"
                      fontSize={isSelected ? '10' : '8.5'}
                      fontWeight={isSelected ? '900' : '700'}
                      fill={isSelected ? '#064e3b' : '#292524'}
                      className="pointer-events-none drop-shadow-xs"
                    >
                      {lang === 'or' ? dist.name_or : dist.name}
                    </text>
                  </g>
                );
              })}

              {/* Render Point of Interest Markers */}
              {filteredPois.map((poi) => {
                const colors = getPoiColor(poi.type);
                const isActive = activePoi?.id === poi.id;

                return (
                  <g
                    key={poi.id}
                    className="cursor-pointer transition-all hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePoi(poi);
                    }}
                  >
                    {/* Pulsing ring for hospitals */}
                    {poi.type === 'hospital' && (
                      <circle
                        cx={poi.coordinates.svgX}
                        cy={poi.coordinates.svgY + 6}
                        r="14"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="1.5"
                        opacity="0.5"
                        className="animate-ping"
                      />
                    )}

                    {/* Pin Marker Background */}
                    <circle
                      cx={poi.coordinates.svgX}
                      cy={poi.coordinates.svgY + 6}
                      r={isActive ? 9 : 7}
                      fill={colors.svgFill}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="shadow-md"
                    />

                    {/* Inner icon / symbol */}
                    <text
                      x={poi.coordinates.svgX}
                      y={poi.coordinates.svgY + 9}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="7"
                      fontWeight="900"
                    >
                      {poi.type === 'hospital' ? '+' : poi.type === 'chc_drone' ? '✦' : '⚙'}
                    </text>
                  </g>
                );
              })}

              {/* Live GPS User Location Beacon on Map */}
              {effectiveLocation && (
                <g className="cursor-pointer">
                  {/* Radar ripple 1 */}
                  <circle
                    cx={effectiveLocation.svgX}
                    cy={effectiveLocation.svgY}
                    r="26"
                    fill="#3b82f6"
                    fillOpacity="0.18"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                  {/* Radar ripple 2 ping */}
                  <circle
                    cx={effectiveLocation.svgX}
                    cy={effectiveLocation.svgY}
                    r="15"
                    fill="#3b82f6"
                    fillOpacity="0.35"
                    className="animate-ping"
                  />
                  {/* User position center dot */}
                  <circle
                    cx={effectiveLocation.svgX}
                    cy={effectiveLocation.svgY}
                    r="7"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  {/* Floating You Are Here Tag */}
                  <rect
                    x={effectiveLocation.svgX - 44}
                    y={effectiveLocation.svgY - 26}
                    width="88"
                    height="18"
                    rx="9"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  <text
                    x={effectiveLocation.svgX}
                    y={effectiveLocation.svgY - 14}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="900"
                    fill="#ffffff"
                  >
                    {lang === 'or' ? '📍 ଆପଣଙ୍କ ସ୍ଥାନ' : '📍 You Are Here'}
                  </text>
                </g>
              )}
            </svg>

            {/* Offline Watermark Badge */}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-xs border border-stone-200 text-[10px] font-extrabold text-stone-600 flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{lang === 'or' ? 'ଅଫଲାଇନ୍ ମାନଚିତ୍ର ସକ୍ରିୟ' : 'Offline Vector Engine Active'}</span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow-2xs" />
                <span className="font-bold text-stone-700">
                  {lang === 'or' ? '୨୪x୭ ASV ହସ୍ପିଟାଲ' : 'ASV Hospital (108)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-2xs" />
                <span className="font-bold text-stone-700">
                  {lang === 'or' ? 'ଡ୍ରୋନ୍ ଓ କଷ୍ଟମ୍ ହାୟାରିଂ' : 'Agri Drone / CHC'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-2xs" />
                <span className="font-bold text-stone-700">
                  {lang === 'or' ? 'କେଭିକେ ଓ ମାଟି ପରୀକ୍ଷାଗାର' : 'KVK / Soil Lab'}
                </span>
              </div>
              {effectiveLocation && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block animate-pulse" />
                  <span className="font-bold text-blue-700">
                    {lang === 'or' ? 'ଆପଣଙ୍କ ସ୍ଥାନ (GPS)' : 'You (Live GPS)'}
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-500 font-semibold">
              {filteredPois.length} {lang === 'or' ? 'କେନ୍ଦ୍ର ମିଳିଲା' : 'facilities listed'}
            </div>
          </div>
        </div>

        {/* Selected Facility Detail / Directory List (Right/Bottom 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active POI Highlight Card (If tapped) */}
          {activePoi ? (
            <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-emerald-500 space-y-4 relative animate-in fade-in zoom-in-95">
              {/* Type Badge & Close */}
              <div className="flex items-center justify-between gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getPoiColor(activePoi.type).badge}`}>
                  {activePoi.type === 'hospital'
                    ? (lang === 'or' ? '୨୪x୭ ସାପକାମୁଡ଼ା ଜରୁରୀକାଳୀନ କେନ୍ଦ୍ର' : '24x7 ASV Emergency Casualty')
                    : activePoi.type === 'chc_drone'
                    ? (lang === 'or' ? 'କୃଷି ଡ୍ରୋନ୍ ଓ କଷ୍ଟମ୍ ହାୟାରିଂ ହବ୍' : 'Agri Drone & Machinery Hub')
                    : (lang === 'or' ? 'କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର ଓ ମୃତ୍ତିକା ପରୀକ୍ଷାଗାର' : 'KVK & Soil Health Clinic')}
                </span>

                <button
                  onClick={() => setActivePoi(null)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold px-2 py-1 rounded-lg bg-stone-100"
                >
                  ✕ {lang === 'or' ? 'ବନ୍ଦ' : 'Close'}
                </button>
              </div>

              {/* Title & Location */}
              <div>
                <h4 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                  {lang === 'or' ? activePoi.name_or : activePoi.name_en}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-xs text-stone-500 flex items-center gap-1.5 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>
                      {lang === 'or' ? activePoi.block_or_location_or : activePoi.block_or_location}, {activePoi.district}
                    </span>
                  </p>
                  {effectiveLocation && (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      📍 {calculateHaversineDistance(
                        effectiveLocation.latitude,
                        effectiveLocation.longitude,
                        activePoi.coordinates.lat,
                        activePoi.coordinates.lng
                      )} km {lang === 'or' ? 'ଦୂର' : 'away'}
                    </span>
                  )}
                </div>
              </div>

              {/* Call Action Bar */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${activePoi.dial_number}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-4 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{lang === 'or' ? `କଲ୍ କରନ୍ତୁ: ${activePoi.phone}` : `Call: ${activePoi.phone}`}</span>
                </a>

                {activePoi.type === 'hospital' && (
                  <a
                    href="tel:108"
                    className="inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 px-4 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
                  >
                    <HeartPulse className="w-4 h-4 animate-pulse" />
                    <span>108</span>
                  </a>
                )}
              </div>

              {/* Key Features / Stock */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <p className="text-xs font-extrabold text-stone-800 uppercase tracking-wide">
                  {lang === 'or' ? 'ଉପଲବ୍ଧ ସୁବିଧା ଓ ସେବା:' : 'Available Facilities & Services:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(lang === 'or' ? activePoi.features_or : activePoi.features_en).map((feat, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offline Route Guidance & Landmark Instructions */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <p className="font-extrabold text-amber-900 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'or' ? 'ଅଫଲାଇନ୍ ରାସ୍ତା ଓ ଲ୍ୟାଣ୍ଡମାର୍କ ନିର୍ଦ୍ଦେଶ:' : 'Offline Directions & Landmarks:'}</span>
                </p>
                <p className="text-stone-700 leading-relaxed">
                  {lang === 'or' ? activePoi.offline_directions_or : activePoi.offline_directions_en}
                </p>
              </div>

              {/* Emergency Advisory if snakebite */}
              {activePoi.emergency_note_en && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="font-bold leading-relaxed">
                    {lang === 'or' ? activePoi.emergency_note_or : activePoi.emergency_note_en}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-2xs">
                <MapPin className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="font-extrabold text-stone-800 text-sm">
                {lang === 'or' ? 'ମାନଚିତ୍ରରୁ କେନ୍ଦ୍ର ଚୟନ କରନ୍ତୁ' : 'Select Any Center on the Map'}
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {lang === 'or'
                  ? 'ଯେକୌଣସି ଜିଲ୍ଲା କିମ୍ବା ରଙ୍ଗୀନ ପିନ୍ ଉପରେ କ୍ଲିକ୍ କଲେ ତୁରନ୍ତ ଫୋନ୍ ନମ୍ବର, ଦୂରତା ଓ ରାସ୍ତା ବିବରଣୀ ଦେଖିପାରିବେ।'
                  : 'Tap any pin on the map or select from the directory below to view direct phone numbers, live distances, and offline directions.'}
              </p>
            </div>
          )}

          {/* Directory of Facilities List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                {lang === 'or' ? 'ତାଲିକାଭୁକ୍ତ କେନ୍ଦ୍ର ସମୂହ:' : 'Verified Facility Directory:'}
              </h4>
              <div className="flex items-center gap-2">
                {effectiveLocation && (
                  <button
                    onClick={() => setSortByDistance(!sortByDistance)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
                      sortByDistance
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-stone-100 border-stone-200 text-stone-600'
                    }`}
                  >
                    {lang === 'or' ? 'ଦୂରତା ଅନୁଯାୟୀ' : 'By Distance'}
                  </button>
                )}
                <span className="text-[11px] text-stone-500 font-semibold">
                  {selectedDistrict !== 'all' ? selectedDistrict : (lang === 'or' ? 'ସମଗ୍ର ଓଡ଼ିଶା' : 'All Odisha')}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredPois.length === 0 ? (
                <div className="p-6 rounded-2xl bg-stone-50 text-center text-xs text-stone-500">
                  {lang === 'or' ? 'କୌଣସି କେନ୍ଦ୍ର ମିଳିଲା ନାହିଁ।' : 'No facilities match the selected filters.'}
                </div>
              ) : (
                filteredPois.map((poi) => {
                  const colors = getPoiColor(poi.type);
                  const isSelected = activePoi?.id === poi.id;

                  return (
                    <div
                      key={poi.id}
                      onClick={() => setActivePoi(poi)}
                      className={`p-3.5 rounded-2xl bg-white border cursor-pointer transition-all hover:border-emerald-500 hover:shadow-xs flex items-center justify-between gap-3 ${
                        isSelected ? 'border-emerald-600 bg-emerald-50/30' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl ${colors.bg} text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}>
                          {poi.type === 'hospital' ? (
                            <HeartPulse className="w-4 h-4" />
                          ) : poi.type === 'chc_drone' ? (
                            <Sparkles className="w-4 h-4" />
                          ) : (
                            <Building2 className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h5 className="font-extrabold text-stone-900 text-xs truncate">
                            {lang === 'or' ? poi.name_or : poi.name_en}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-stone-500 truncate">
                              {lang === 'or' ? poi.block_or_location_or : poi.block_or_location} • {poi.district}
                            </p>
                            {poi.distanceKm !== null && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded shrink-0">
                                {poi.distanceKm} km
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${poi.dial_number}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center transition-all"
                          title="Call directly"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
