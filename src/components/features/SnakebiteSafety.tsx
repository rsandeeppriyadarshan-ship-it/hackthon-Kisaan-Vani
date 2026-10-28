import React, { useState } from 'react';
import { Language, HospitalRecord } from '../../types';
import hospitalsDataRaw from '../../data/hospitals.json';
import { ODIA_AUDIO_SCRIPTS } from '../../services/voiceService';
import { AudioPlayerCard } from '../common/AudioPlayerCard';
import { PhoneCall, AlertOctagon, CheckCircle2, XCircle, MapPin, Building2, Shield, HeartPulse } from 'lucide-react';

interface SnakebiteSafetyProps {
  lang: Language;
}

export const SnakebiteSafety: React.FC<SnakebiteSafetyProps> = ({ lang }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const hospitals = hospitalsDataRaw.hospitals as HospitalRecord[];
  const script = ODIA_AUDIO_SCRIPTS.snakebite_first_aid;

  const filteredHospitals = selectedDistrict === 'all'
    ? hospitals
    : hospitals.filter((h) => h.district.toLowerCase() === selectedDistrict.toLowerCase());

  const districtsList = Array.from(new Set(hospitals.map((h) => h.district)));

  return (
    <div className="space-y-6 text-left">
      {/* GIANT EMERGENCY 108 ACTION BANNER (Requirement 1: Big button <a href="tel:108"> so it dials immediately) */}
      <div className="rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-8 shadow-xl border-2 border-red-500 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-400 text-yellow-300 text-xs font-black uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 animate-spin text-yellow-300" />
              <span>{lang === 'or' ? 'ଜରୁରୀକାଳୀନ ଆମ୍ବୁଲାନ୍ସ ସେବା (୨୪x୭)' : 'EMERGENCY AMBULANCE (24x7)'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-none text-white">
              {lang === 'or' ? 'ସାପ କାମୁଡ଼ା ଜୀବନ ରକ୍ଷା' : 'Snakebite Emergency Response'}
            </h2>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
              {lang === 'or'
                ? 'ରୋଗୀଙ୍କୁ ଶାନ୍ତ ରଖନ୍ତୁ। କୌଣସି ପ୍ରକାରେ ଚଳପ୍ରଚଳ କରାନ୍ତୁ ନାହିଁ। ତୁରନ୍ତ ୧୦୮ କୁ କଲ୍ କରି ସରକାରୀ ଡାକ୍ତରଖାନା ନିଅନ୍ତୁ। ଆଣ୍ଟି-ସ୍ନେକ୍ ଭେନମ୍ ସମ୍ପୂର୍ଣ୍ଣ ମାଗଣା।'
                : 'Keep victim calm and immobile. Dial 108 immediately for urgent transport to an ASV-stocked government hospital. ASV is free.'}
            </p>
          </div>

          {/* Big Dial 108 Button */}
          <div className="shrink-0 flex flex-col items-center sm:items-end">
            <a
              href="tel:108"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-stone-950 font-black px-8 py-5 rounded-2xl text-xl sm:text-2xl shadow-2xl transition-all border-2 border-white/60 animate-bounce"
            >
              <PhoneCall className="w-7 h-7 stroke-[3]" />
              <span>{lang === 'or' ? '୧୦୮ କୁ କଲ୍ କରନ୍ତୁ' : 'DIAL 108 NOW'}</span>
            </a>
            <span className="text-[11px] text-yellow-200 font-semibold mt-1.5">
              {lang === 'or' ? 'ଟୋଲ୍ ଫ୍ରି ନମ୍ବର (ମାଗଣା)' : 'Toll-Free Govt Ambulance Service'}
            </span>
          </div>
        </div>
      </div>

        {/* Audio First Aid Guide with Progress Bar */}
        <div>
          <AudioPlayerCard
            title={lang === 'or' ? script.title_or : script.title_en}
            subtitle={lang === 'or' ? 'ସ୍ୱାସ୍ଥ୍ୟ ବିଭାଗ ଓ WHO ଦ୍ୱାରା ଅନୁମୋଦିତ ଅଡିଓ ଗାଇଡ୍' : 'Verified by WHO & State Health Directorate'}
            textToSpeak={lang === 'or' ? script.odia_text : script.english_text}
            lang={lang}
            accentColor="red"
          />
        </div>

        {/* Official DOs and DON'Ts Grid (Requirement 5: Official reviewed wording) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* DOs Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 border border-emerald-300 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <h4 className="text-base font-black">
                {lang === 'or' ? 'କଣ କରିବେ (DOs):' : 'What TO DO (Life-Saving):'}
              </h4>
            </div>
            <ul className="text-xs text-stone-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">✓</span>
                <span>
                  {lang === 'or'
                    ? 'ରୋଗୀଙ୍କୁ ସମ୍ପୂର୍ଣ୍ଣ ଶାନ୍ତ ରଖନ୍ତୁ। ଭୟଭୀତ ହେଲେ ହୃଦସ୍ପନ୍ଦନ ବଢ଼ି ବିଷ ଶୀଘ୍ର ବ୍ୟାପିଥାଏ।'
                    : 'Reassure the patient and keep them completely still. Panic accelerates heart rate and venom circulation.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">✓</span>
                <span>
                  {lang === 'or'
                    ? 'କାମୁଡ଼ି ଥିବା ହାତ ବା ଗୋଡ଼କୁ ବାଉଁଶ ବା କାଠପଟା ବାନ୍ଧି ଅଚଳ (Immobilize) କରି ରଖନ୍ତୁ।'
                    : 'Immobilize the bitten limb using a rigid splint/stick, just like a bone fracture.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">✓</span>
                <span>
                  {lang === 'or'
                    ? 'ହାତରେ ଥିବା ମୁଦି, ଚୁଡ଼ି ବା କସା ଲୁଗା ଖୋଲି ଦିଅନ୍ତୁ କାରଣ ଅଙ୍ଗ ଫୁଲିପାରେ।'
                    : 'Remove rings, bangles, tight bracelets and shoes before swelling starts.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">✓</span>
                <span>
                  {lang === 'or'
                    ? 'ତୁରନ୍ତ ୧୦୮ କୁ କଲ୍ କରି ନିକଟସ୍ଥ ସରକାରୀ ଡାକ୍ତରଖାନା ନିଅନ୍ତୁ।'
                    : 'Immediately transfer to the nearest Community Health Centre or District Hospital via 108.'}
                </span>
              </li>
            </ul>
          </div>

          {/* DON'Ts Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-rose-50/70 border border-rose-300 space-y-3">
            <div className="flex items-center gap-2 text-rose-900">
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <h4 className="text-base font-black">
                {lang === 'or' ? 'କଣ ଆଦୌ କରିବେ ନାହିଁ (DON\'Ts):' : 'What NEVER TO DO (Dangerous Myths):'}
              </h4>
            </div>
            <ul className="text-xs text-stone-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">✗</span>
                <span>
                  {lang === 'or'
                    ? 'କ୍ଷତ ସ୍ଥାନରେ ଚିରିବା, ବ୍ଲେଡ୍ ଲଗାଇବା କିମ୍ବା ରକ୍ତ ଶୋଷିବା ସମ୍ପୂର୍ଣ୍ଣ ମନା।'
                    : 'DO NOT cut, slash with blades, or attempt to suck venom with mouth or pump.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">✗</span>
                <span>
                  {lang === 'or'
                    ? 'ଦଉଡ଼ି ବା ଟାଣ ଫିତା ବାନ୍ଧି ରକ୍ତ ଚଳାଚଳ ବନ୍ଦ କରନ୍ତୁ ନାହିଁ (ଏହା ଦ୍ୱାରା ଅଙ୍ଗ ପଚିଯାଏ)।'
                    : 'DO NOT tie tight rope/wire tourniquets. Tight ligatures block arterial blood, resulting in gangrene/amputation.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">✗</span>
                <span>
                  {lang === 'or'
                    ? 'ଗୁଣିଗାରେଡ଼ି, ଝଡ଼ାଫୁଙ୍କା ବା ବଇଦ ପାଖକୁ ଯାଇ ସମୟ ନଷ୍ଟ କରନ୍ତୁ ନାହିଁ।'
                    : 'DO NOT waste critical golden-hour time visiting quacks or faith healers.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">✗</span>
                <span>
                  {lang === 'or'
                    ? 'ବରଫ ଘଷିବା କିମ୍ବା ବିଦ୍ୟୁତ ଝଟକା ଦେବା ମାରାତ୍ମକ ଭୁଲ।'
                    : 'DO NOT apply ice packs, potassium permanganate, or electric shocks.'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Prevention Tips for Field Work */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
          <p className="font-bold text-amber-950 text-xs">
            {lang === 'or' ? 'ବିଲରେ କାମ କରିବା ସମୟରେ ସତର୍କତା:' : 'Field Bite Prevention Reminders:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-700">
            <div className="p-2 bg-white rounded-xl border border-amber-200">
              💡 {lang === 'or' ? 'ରାତିରେ ସର୍ବଦା ଟର୍ଚ୍ଚ ଲାଇଟ୍ ବ୍ୟବହାର କରନ୍ତୁ।' : 'Always carry a torch/flashlight at dusk/night.'}
            </div>
            <div className="p-2 bg-white rounded-xl border border-amber-200">
              👢 {lang === 'or' ? 'ବିଲ ହିଡ଼ରେ ଲମ୍ବା ରବର ବୁଟ୍ ଜୋତା ପିନ୍ଧନ୍ତୁ।' : 'Wear high rubber gumboots on field bunds.'}
            </div>
            <div className="p-2 bg-white rounded-xl border border-amber-200">
              🦯 {lang === 'or' ? 'ଘଞ୍ଚ ଘାସ ଥିବା ଜାଗାରେ ବାଡ଼ି ପିଟି ଚାଲନ୍ତୁ।' : 'Tap ahead with a stick before stepping into tall grass.'}
            </div>
          </div>
        </div>

      {/* Hospitals with ASV (Requirement 4: Save nearby snakebite-treating hospitals in JSON & show in list) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900">
              {lang === 'or' ? 'ଓଡ଼ିଶାର ଆଣ୍ଟି-ସ୍ନେକ୍ ଭେନମ୍ (ASV) ଡାକ୍ତରଖାନା ତାଲିକା' : 'Odisha Anti-Snake Venom (ASV) Stocking Hospitals'}
            </h3>
            <p className="text-xs text-stone-500">
              {lang === 'or' ? 'ଏହି ଡାକ୍ତରଖାନାଗୁଡ଼ିକରେ ୨୪ ଘଣ୍ଟା ମାଗଣା ASV ଇଞ୍ଜେକ୍ସନ ଉପଲବ୍ଧ ଅଛି' : 'Equipped with 24x7 government ASV vials and emergency casualty staff'}
            </p>
          </div>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800"
          >
            <option value="all">{lang === 'or' ? 'ସମସ୍ତ ଜିଲ୍ଲା' : 'All Districts'}</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Hospital Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredHospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between hover:border-red-400 hover:bg-red-50/20 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                    {hosp.district}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    <HeartPulse className="w-3 h-3 text-emerald-600" />
                    <span>ASV Ready</span>
                  </span>
                </div>

                <h4 className="text-sm font-black text-stone-900 mt-2 group-hover:text-red-700 transition-colors">
                  {lang === 'or' ? hosp.name_or : hosp.name_en}
                </h4>

                <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{hosp.location}</span>
                </p>

                <p className="text-[11px] text-stone-600 italic mt-2 bg-white/80 p-2 rounded-xl border border-stone-100">
                  {hosp.distance_note}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-600">
                  {hosp.phone}
                </span>
                <a
                  href={`tel:${hosp.direct_call}`}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{lang === 'or' ? 'କାଜୁଆଲିଟି କଲ୍' : 'Call Casualty'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
