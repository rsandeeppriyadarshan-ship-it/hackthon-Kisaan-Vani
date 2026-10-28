import React, { useState } from 'react';
import { Language, LabourProvider } from '../../types';
import labourDataRaw from '../../data/labour.json';
import { Phone, Users, ShieldCheck, Wrench, Search, MapPin, CheckCircle } from 'lucide-react';
import { VoiceMicButton } from '../common/VoiceInputField';

interface LabourConnectProps {
  lang: Language;
  currentDistrict?: string;
}

export const LabourConnect: React.FC<LabourConnectProps> = ({ lang, currentDistrict = 'Cuttack' }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const districts = labourDataRaw.districts as string[];
  const providers = labourDataRaw.providers as LabourProvider[];

  const filteredProviders = providers.filter((p) => {
    const matchDistrict = selectedDistrict === 'all' || p.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchQuery =
      searchQuery === '' ||
      p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_or.includes(searchQuery) ||
      p.block.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDistrict && matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-amber-300 text-xs font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Odisha District Directory (CHC, FPO, Drones)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {lang === 'or' ? 'କୃଷି ଶ୍ରମିକ ଓ ଯନ୍ତ୍ରପାତି ସେବା (Labour Connect)' : 'Labour Connect & Machinery Hiring'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                {lang === 'or'
                  ? 'ଜିଲ୍ଲା ଅନୁସାରେ କଷ୍ଟମ ହାୟାରିଂ ସେଣ୍ଟର (CHC), ଡ୍ରୋନ୍ ସ୍ପ୍ରେୟାର ଓ ଶ୍ରମିକ ଦଳ ଖୋଜନ୍ତୁ ଏବଂ ସିଧା କଲ୍ କରନ୍ତୁ।'
                  : 'Find verified Custom Hiring Centres, Precision Drone Sprayers, Harvesters, and labour collectives.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-stone-200 text-left space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* District Filter */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              {lang === 'or' ? 'ଜିଲ୍ଲା (District):' : 'District Filter:'}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              <option value="all">{lang === 'or' ? 'ସମସ୍ତ ଜିଲ୍ଲା (All Districts)' : 'All Districts'}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Service Category */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              {lang === 'or' ? 'ସେବା ପ୍ରକାର (Service):' : 'Service Category:'}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              <option value="all">{lang === 'or' ? 'ସମସ୍ତ ସେବା (All Services)' : 'All Categories'}</option>
              <option value="drone_sprayer">{lang === 'or' ? 'ଡ୍ରୋନ୍ ସ୍ପ୍ରେୟାର (Drone Spray)' : 'Agri Drone Sprayers'}</option>
              <option value="machinery">{lang === 'or' ? 'ଟ୍ରାକ୍ଟର / ହାର୍ଭେଷ୍ଟର (Tractor & CHC)' : 'Machinery & Harvesters'}</option>
              <option value="sprayer_labour">{lang === 'or' ? 'ଅଭିଜ୍ଞ ସ୍ପ୍ରେ କର୍ମଚାରୀ (Sprayer Crew)' : 'Sprayer Labour Crews'}</option>
              <option value="farm_labour">{lang === 'or' ? 'ରୁଆ ଓ ଅମଳ ଶ୍ରମିକ (Farm Workers)' : 'Field Labour Groups'}</option>
            </select>
          </div>

          {/* Search Box + Voice Mic Button */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              {lang === 'or' ? 'ଖୋଜନ୍ତୁ (Search Block / Name):' : 'Search Name / Block:'}
            </label>
            <div className="flex items-start gap-1.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={lang === 'or' ? 'ବ୍ଲକ ବା କେନ୍ଦ୍ର ନାମ...' : 'Search center or block...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
                />
              </div>
              <VoiceMicButton
                lang={lang}
                size="sm"
                screenTopic="labour connect search"
                fieldLabel="search block or worker"
                onTranscript={(txt) => setSearchQuery(txt)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Provider List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 text-left flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {provider.district}
                    </span>
                    <span className="text-xs text-stone-500 font-medium flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {provider.block}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-stone-900 mt-1.5 group-hover:text-emerald-800 transition-colors">
                    {lang === 'or' ? provider.name_or : provider.name_en}
                  </h3>
                </div>

                {provider.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              {/* Service details */}
              <div className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                <p className="text-xs font-semibold text-stone-800">
                  {lang === 'or' ? provider.service_type_or : provider.service_type_en}
                </p>
                <p className="text-xs font-extrabold text-amber-700">
                  {lang === 'or' ? `ଦର: ${provider.rate}` : `Rate: ${provider.rate}`}
                </p>
              </div>
            </div>

            {/* Direct Call Button (Requirement 3: Call link <a href="tel:NUMBER">) */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-stone-500">
                +91 {provider.phone}
              </span>
              <a
                href={`tel:${provider.phone}`}
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition-all"
              >
                <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'or' ? 'କଲ୍ କରନ୍ତୁ' : 'Call Now'}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="p-8 bg-white rounded-3xl border border-stone-200 text-center text-stone-400">
          <p className="text-xs font-semibold">
            {lang === 'or' ? 'ଏହି ଫିଲ୍ଟରରେ କୌଣସି ସେବା ପ୍ରଦାନକାରୀ ମିଳିଲେ ନାହିଁ।' : 'No service providers matched the selected filters.'}
          </p>
        </div>
      )}
    </div>
  );
};
