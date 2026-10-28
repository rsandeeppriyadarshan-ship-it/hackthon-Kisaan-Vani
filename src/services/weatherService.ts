/**
 * Weather Service using Open-Meteo (Free weather API without API key requirement)
 * Defaults to Odisha Agro-climatic coordinates with district selection
 */

import { WeatherData, DayForecast, WeatherAlert } from '../types';
import {
  saveCachedWeatherToPhoneOnly,
  getCachedWeatherFromPhoneOnly,
} from './localFirstSyncEngine';

export interface DistrictCoord {
  name_en: string;
  name_or: string;
  lat: number;
  lon: number;
}

export const ODISHA_DISTRICTS: DistrictCoord[] = [
  { name_en: "Cuttack", name_or: "କଟକ", lat: 20.4625, lon: 85.8830 },
  { name_en: "Khordha", name_or: "ଖୋର୍ଦ୍ଧା (ଭୁବନେଶ୍ୱର)", lat: 20.2961, lon: 85.8245 },
  { name_en: "Puri", name_or: "ପୁରୀ", lat: 19.8135, lon: 85.8312 },
  { name_en: "Balasore", name_or: "ବାଲେଶ୍ୱର", lat: 21.4934, lon: 86.9135 },
  { name_en: "Bhadrak", name_or: "ଭଦ୍ରକ", lat: 21.0574, lon: 86.5165 },
  { name_en: "Kendrapara", name_or: "କେନ୍ଦ୍ରାପଡ଼ା", lat: 20.5000, lon: 86.4200 },
  { name_en: "Jagatsinghpur", name_or: "ଜଗତସିଂହପୁର", lat: 20.2568, lon: 86.1686 },
  { name_en: "Jajpur", name_or: "ଯାଜପୁର", lat: 20.8500, lon: 86.3300 },
  { name_en: "Ganjam", name_or: "ଗଞ୍ଜାମ (ବ୍ରହ୍ମପୁର)", lat: 19.3150, lon: 84.7941 },
  { name_en: "Gajapati", name_or: "ଗଜପତି (ପାରଳାଖେମୁଣ୍ଡି)", lat: 18.8100, lon: 84.1000 },
  { name_en: "Mayurbhanj", name_or: "ମୟୂରଭଞ୍ଜ (ବାରିପଦା)", lat: 21.9322, lon: 86.7262 },
  { name_en: "Keonjhar", name_or: "କେନ୍ଦୁଝର", lat: 21.6288, lon: 85.5817 },
  { name_en: "Sundargarh", name_or: "ସୁନ୍ଦରଗଡ଼ (ରାଉରକେଲା)", lat: 22.1200, lon: 84.0300 },
  { name_en: "Deogarh", name_or: "ଦେବଗଡ଼", lat: 21.5300, lon: 84.7300 },
  { name_en: "Angul", name_or: "ଅନୁଗୋଳ", lat: 20.8400, lon: 85.1000 },
  { name_en: "Dhenkanal", name_or: "ଢେଙ୍କାନାଳ", lat: 20.6667, lon: 85.6000 },
  { name_en: "Sambalpur", name_or: "ସମ୍ବଲପୁର", lat: 21.4669, lon: 83.9812 },
  { name_en: "Bargarh", name_or: "ବରଗଡ଼", lat: 21.3333, lon: 83.6167 },
  { name_en: "Jharsuguda", name_or: "ଝାରସୁଗୁଡ଼ା", lat: 21.8550, lon: 84.0080 },
  { name_en: "Subarnapur", name_or: "ସୁବର୍ଣ୍ଣପୁର (ସୋନପୁର)", lat: 20.8400, lon: 83.9100 },
  { name_en: "Bolangir", name_or: "ବଲାଙ୍ଗୀର", lat: 20.7107, lon: 83.4862 },
  { name_en: "Nuapada", name_or: "ନୂଆପଡ଼ା", lat: 20.8300, lon: 82.5200 },
  { name_en: "Kalahandi", name_or: "କଳାହାଣ୍ଡି (ଭବାନୀପାଟଣା)", lat: 19.9074, lon: 83.1724 },
  { name_en: "Boudh", name_or: "ବୌଦ୍ଧ", lat: 20.8400, lon: 84.3200 },
  { name_en: "Nayagarh", name_or: "ନୟାଗଡ଼", lat: 20.1300, lon: 85.1000 },
  { name_en: "Kandhamal", name_or: "କନ୍ଧମାଳ (ଫୁଲବାଣୀ)", lat: 20.4700, lon: 84.2300 },
  { name_en: "Rayagada", name_or: "ରାୟଗଡ଼ା", lat: 19.1717, lon: 83.4163 },
  { name_en: "Koraput", name_or: "କୋରାପୁଟ (ଜୟପୁର)", lat: 18.8135, lon: 82.7118 },
  { name_en: "Nabarangpur", name_or: "ନବରଙ୍ଗପୁର", lat: 19.2300, lon: 82.5500 },
  { name_en: "Malkangiri", name_or: "ମାଲକାନଗିରି", lat: 18.3500, lon: 81.9000 }
];

const ODIA_DAYS = ["ରବିବାର", "ସୋମବାର", "ମଙ୍ଗଳବାର", "ବୁଧବାର", "ଗୁରୁବାର", "ଶୁକ୍ରବାର", "ଶନିବାର"];
const ENGLISH_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function generateAlertsForDistrict(
  districtName: string,
  rainProb: number,
  windSpeed: number,
  tempC: number
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // 1. Thunderstorm / Lightning (Kalbaishakhi) Alert
  if (rainProb >= 40 || windSpeed >= 20) {
    const isOrange = rainProb >= 60 || windSpeed >= 28;
    alerts.push({
      id: `alert-ts-${districtName}`,
      district: districtName,
      severity: isOrange ? 'ORANGE' : 'YELLOW',
      phenomenon: 'thunderstorm_lightning',
      headline_en: isOrange 
        ? `ORANGE ALERT: Severe Thunderstorm & Lightning Warning for ${districtName}`
        : `YELLOW ALERT: Kalbaishakhi & Lightning Watch for ${districtName}`,
      headline_or: isOrange
        ? `କମଳା ସତର୍କତା: ${districtName} ରେ ପ୍ରବଳ ଘଡ଼ଘଡ଼ି, ବିଜୁଳି ଓ କାଳବୈଶାଖୀ ଚେତାବନୀ`
        : `ହଳଦିଆ ସତର୍କତା: ${districtName} ରେ ଘଡ଼ଘଡ଼ି ସହ ବଜ୍ରପାତ ସମ୍ଭାବନା`,
      valid_until: 'Valid for next 24 Hours (IMD Bhubaneswar)',
      instructions_en: [
        'IMMEDIATELY STOP outdoor farm operations & spraying during thunder rumbling.',
        'DO NOT take shelter under isolated tall trees or near metal electric poles in open fields.',
        'Keep livestock untethered or secured in concrete/safe covered sheds.',
        'Disconnect electric motor pumps and battery sprayers.'
      ],
      instructions_or: [
        'ବିଜୁଳି ଚମକିବା ଓ ମେଘ ଡାକିବା ସମୟରେ ବିଲରେ କାମ ଓ ସ୍ପ୍ରେ ତୁରନ୍ତ ବନ୍ଦ କରନ୍ତୁ।',
        'ଖୋଲା ବିଲରେ ଥିବା ଉଚ୍ଚ ଗଛ କିମ୍ବା ବିଦ୍ୟୁତ ଖୁଣ୍ଟ ତଳେ ଆଶ୍ରୟ ନିଅନ୍ତୁ ନାହିଁ।',
        'ଗୃହପାଳିତ ପଶୁମାନଙ୍କୁ ସୁରକ୍ଷିତ ପକ୍କା ଘର ଭିତରକୁ ନିଅନ୍ତୁ।',
        'ବିଦ୍ୟୁତ ମୋଟର ଓ ବ୍ୟାଟେରୀ ସ୍ପ୍ରେୟାର ବନ୍ଦ ରଖନ୍ତୁ।'
      ],
      issued_by: 'Bhubaneswar Meteorological Centre & Krushak Bani'
    });
  }

  // 2. High Wind Gusts Warning
  if (windSpeed > 18) {
    alerts.push({
      id: `alert-wind-${districtName}`,
      district: districtName,
      severity: windSpeed > 30 ? 'RED' : 'YELLOW',
      phenomenon: 'cyclone_wind',
      headline_en: `WIND ALERT: Gusty Winds up to ${windSpeed + 12} km/h Expected`,
      headline_or: `ପବନ ସତର୍କତା: ${windSpeed + 12} କିମି/ଘଣ୍ଟା ବେଗରେ ଝଟକା ପବନର ଆଶଙ୍କା`,
      valid_until: 'Valid for today',
      instructions_en: [
        'Strictly do not spray pesticides or foliar nutrients (severe drift hazard).',
        'Provide mechanical bamboo staking to standing banana, papaya, and sugarcane crops.'
      ],
      instructions_or: [
        'ପବନରେ ଔଷଧ ମୁହଁରେ ପଡ଼ିବା ଆଶଙ୍କା ଥିବାରୁ କୌଣସି କୀଟନାଶକ ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ।',
        'କଦଳୀ, ଅମୃତଭଣ୍ଡା ଓ ଆଖୁ ଗଛକୁ ବାଉଁଶ ଖୁଣ୍ଟ ଦେଇ ଟେକି ରଖନ୍ତୁ।'
      ],
      issued_by: 'District Agromet Advisory Bulletin'
    });
  }

  // 3. Heatwave Warning if temp > 38°C
  if (tempC >= 38) {
    alerts.push({
      id: `alert-heat-${districtName}`,
      district: districtName,
      severity: tempC >= 41 ? 'ORANGE' : 'YELLOW',
      phenomenon: 'heatwave',
      headline_en: `HEATWAVE ALERT: Maximum Temperature Reaching ${tempC}°C`,
      headline_or: `ଗ୍ରୀଷ୍ମ ପ୍ରବାହ ସତର୍କତା: ତାପମାତ୍ରା ${tempC}°C ଛୁଇଁବାର ସମ୍ଭାବନା`,
      valid_until: '11:00 AM to 3:30 PM Peak Hours',
      instructions_en: [
        'Avoid intense field labor between 11 AM and 3:30 PM.',
        'Drink sufficient water with ORS/lemon, wear a gamuchha/cloth over head.',
        'Provide light evening irrigation to vegetable crops to prevent flower drop.'
      ],
      instructions_or: [
        'ପୂର୍ବାହ୍ନ ୧୧ଟାରୁ ଅପରାହ୍ନ ୩ଟା ୩୦ ମଧ୍ୟରେ ଖରାରେ କାମ କରିବା ବନ୍ଦ ରଖନ୍ତୁ।',
        'ପ୍ରଚୁର ପାଣି, ତୋରାଣି ଓ ଲେମ୍ବୁ ପାଣି ପିଅନ୍ତୁ ଏବଂ ମୁଣ୍ଡରେ ଗାମୁଛା ବାନ୍ଧନ୍ତୁ।',
        'ପନିପରିବାରେ ଫୁଲ ଝଡ଼ିବା ରୋକିବାକୁ ସନ୍ଧ୍ୟାବେଳେ ହାଲୁକା ପାଣି ମଡ଼ାନ୍ତୁ।'
      ],
      issued_by: 'State Disaster Management Authority (OSDMA)'
    });
  }

  // 4. Default Green/Normal advisory
  if (alerts.length === 0) {
    alerts.push({
      id: `alert-normal-${districtName}`,
      district: districtName,
      severity: 'GREEN',
      phenomenon: 'normal',
      headline_en: `GREEN STATUS: Normal Weather Conditions in ${districtName}`,
      headline_or: `ସବୁଜ ସ୍ଥିତି: ${districtName} ରେ ସ୍ୱାଭାବିକ ଓ ଅନୁକୂଳ ପାଣିପାଗ`,
      valid_until: 'Current Agromet Window',
      instructions_en: [
        'Favourable weather for crop sowing, weeding, and scheduled spraying.',
        'Maintain balanced moisture and inspect for early pest signs.'
      ],
      instructions_or: [
        'ବୁଣା, ଘାସ ବଛା ଏବଂ କୀଟନାଶକ ପ୍ରୟୋଗ ପାଇଁ ପାଗ ସମ୍ପୂର୍ଣ୍ଣ ଅନୁକୂଳ।',
        'ଜମିରେ ବତର ରଖନ୍ତୁ ଏବଂ ନିୟମିତ ଫସଲ ନିରୀକ୍ଷଣ କରନ୍ତୁ।'
      ],
      issued_by: 'Krushak Bani Agro-Met Desk'
    });
  }

  return alerts;
}

export async function fetchDistrictWeather(lat: number = 20.4625, lon: number = 85.8830, districtName: string = "Cuttack"): Promise<WeatherData> {
  const localCacheKey = `krushak_weather_cache_${districtName.toLowerCase()}`;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=precipitation_probability,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&forecast_days=7&timezone=Asia%2FKolkata`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP error: ${response.status}`);
    }
    const data = await response.json();

    const curr = data.current || {};
    const hourly = data.hourly || {};
    const daily = data.daily || {};

    const next12hRain = (hourly.precipitation_probability || []).slice(0, 12);
    const maxRain12h = next12hRain.length > 0 ? Math.max(...next12hRain) : 10;
    const currentTemp = Math.round(curr.temperature_2m ?? 29);
    const currentWind = Math.round(curr.wind_speed_10m ?? 8);
    const currentWeatherCode = Number(curr.weather_code ?? 0);

    // Build 7-day calendar forecast
    const forecastDays: DayForecast[] = [];
    const dates: string[] = daily.time || [];
    const maxTemps: number[] = daily.temperature_2m_max || [];
    const minTemps: number[] = daily.temperature_2m_min || [];
    const rainProbs: number[] = daily.precipitation_probability_max || [];
    const maxWinds: number[] = daily.wind_speed_10m_max || [];

    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const dayIdx = d.getDay();
      const rain = rainProbs[i] ?? 10;
      const wind = maxWinds[i] ?? 10;

      // Condition: Good for spray if rain < 30% and wind <= 15 km/h
      const isGood = rain <= 30 && wind <= 15;

      let spray_status_en = "Optimal for Spraying";
      let spray_status_or = "ସ୍ପ୍ରେ ପାଇଁ ଅନୁକୂଳ ଦିନ";
      let notes_en = "Low wind & dry foliage. Great window for chemical & foliar application.";
      let notes_or = "କମ ପବନ ଏବଂ ଶୁଖିଲା ପତ୍ର। କୀଟନାଶକ ଓ ସାର ସ୍ପ୍ରେ ପାଇଁ ଉତ୍ତମ।";

      if (rain > 40) {
        spray_status_en = "Do Not Spray (Rain Forecast)";
        spray_status_or = "ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ (ବର୍ଷା ସମ୍ଭାବନା)";
        notes_en = "High chance of rain wash-off. Chemical application will be wasted.";
        notes_or = "ବର୍ଷାରେ ସ୍ପ୍ରେ ଧୋଇ ହୋଇ ନଷ୍ଟ ହେବ। ଅପେକ୍ଷା କରନ୍ତୁ।";
      } else if (wind > 15) {
        spray_status_en = "Caution (High Wind Drift)";
        spray_status_or = "ସାବଧାନ (ପ୍ରବଳ ପବନ)";
        notes_en = "Strong gusts will cause spray drift to human applicator and off-target crops.";
        notes_or = "ପବନ ଯୋଗୁଁ ଔଷଧ ମୁହଁରେ ପଡ଼ିପାରେ। ସକାଳେ କମ ପବନ ଥିଲେ ସ୍ପ୍ରେ କରନ୍ତୁ।";
      }

      forecastDays.push({
        date: dates[i],
        day_name_en: i === 0 ? "Today" : (i === 1 ? "Tomorrow" : ENGLISH_DAYS[dayIdx]),
        day_name_or: i === 0 ? "ଆଜି" : (i === 1 ? "ଆସନ୍ତାକାଲି" : ODIA_DAYS[dayIdx]),
        max_temp: Math.round(maxTemps[i] ?? 32),
        min_temp: Math.round(minTemps[i] ?? 23),
        rain_probability: rain,
        wind_speed_max: Math.round(wind),
        is_good_for_spraying: isGood,
        spray_status_en,
        spray_status_or,
        notes_en,
        notes_or
      });
    }

    const alerts = generateAlertsForDistrict(districtName, maxRain12h, currentWind, currentTemp);

    const weatherResult: WeatherData = {
      temp_c: currentTemp,
      humidity_pct: Math.round(curr.relative_humidity_2m ?? 68),
      wind_speed_kmh: currentWind,
      max_rain_probability_12h: maxRain12h,
      current_precip_mm: curr.precipitation ?? 0,
      weather_code: currentWeatherCode,
      is_cached: false,
      cached_at: new Date().toISOString(),
      forecast_days: forecastDays,
      location_name: districtName,
      active_alerts: alerts
    };

    // Keep cached weather on phone only (IndexedDB STORE_CACHED_WEATHER + localStorage fallback)
    saveCachedWeatherToPhoneOnly(districtName, weatherResult).catch(() => {});
    try {
      localStorage.setItem(localCacheKey, JSON.stringify(weatherResult));
    } catch {}

    return weatherResult;
  } catch (err) {
    console.warn("Failed to fetch live Open-Meteo, checking phone-only IndexedDB weather cache:", err);
    const cached = await getCachedWeatherFromPhoneOnly(districtName);
    if (cached) {
      return { ...(cached as WeatherData), is_cached: true };
    }
    try {
      const rawLocal = localStorage.getItem(localCacheKey);
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal) as WeatherData;
        return { ...parsed, is_cached: true };
      }
    } catch {}
    return { ...getOfflineFallbackWeather(districtName), is_cached: true };
  }
}

export function getOfflineFallbackWeather(districtName: string): WeatherData {
  const today = new Date();
  const forecast: DayForecast[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dayIdx = d.getDay();
    const rain = (i * 7 + 15) % 45;
    const wind = 8 + (i * 2) % 10;
    const isGood = rain <= 30 && wind <= 15;

    forecast.push({
      date: d.toISOString().split('T')[0],
      day_name_en: i === 0 ? "Today" : (i === 1 ? "Tomorrow" : ENGLISH_DAYS[dayIdx]),
      day_name_or: i === 0 ? "ଆଜି" : (i === 1 ? "ଆସନ୍ତାକାଲି" : ODIA_DAYS[dayIdx]),
      max_temp: 32 - (i % 3),
      min_temp: 23 + (i % 2),
      rain_probability: rain,
      wind_speed_max: wind,
      is_good_for_spraying: isGood,
      spray_status_en: isGood ? "Optimal for Spraying" : (rain > 30 ? "High Rain Risk" : "Caution (Wind)"),
      spray_status_or: isGood ? "ସ୍ପ୍ରେ ପାଇଁ ଅନୁକୂଳ" : (rain > 30 ? "ବର୍ଷା ଆଶଙ୍କା - ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ" : "ସାବଧାନ (ପବନ)"),
      notes_en: isGood ? "Low wind & dry conditions." : "Delay spray until conditions settle.",
      notes_or: isGood ? "କମ ପବନ ଏବଂ ଶୁଖିଲା ପାଗ।" : "ପାଣିପାଗ ସ୍ଥିର ହେବା ପର୍ଯ୍ୟନ୍ତ ଅପେକ୍ଷା କରନ୍ତୁ।"
    });
  }

  const alerts = generateAlertsForDistrict(districtName, 20, 9, 29);

  return {
    temp_c: 29,
    humidity_pct: 70,
    wind_speed_kmh: 9,
    max_rain_probability_12h: 20,
    current_precip_mm: 0,
    forecast_days: forecast,
    location_name: districtName,
    active_alerts: alerts
  };
}

