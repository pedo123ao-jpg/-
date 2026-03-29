import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Play, 
  Pause, 
  Volume2, 
  ChevronLeft, 
  X, 
  Menu,
  Heart,
  Settings,
  Info,
  Moon,
  Sun,
  Clock,
  MapPin,
  Bell,
  BellOff,
  Sunrise,
  Sunset,
  CloudSun,
  MoonStar,
  Stars
} from 'lucide-react';
import { Surah, Ayah, SurahDetail, PrayerTime, LocationData } from './types';
import { fetchSurahs, fetchSurahDetail, fetchTranslation, getAyahAudioUrl } from './services/quranService';
import { getPrayerTimes, getCurrentLocation } from './services/prayerService';
import { format } from 'date-fns';

export default function App() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [translation, setTranslation] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'quran' | 'prayer'>('quran');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const data = await fetchSurahs();
        setSurahs(data);
        setFilteredSurahs(data);
      } catch (error) {
        console.error('Error fetching surahs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSurahs();
  }, []);

  useEffect(() => {
    const fetchLocationAndPrayers = async () => {
      try {
        const loc = await getCurrentLocation();
        setLocation(loc);
        const times = getPrayerTimes(loc);
        setPrayerTimes(times);
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Please enable location access to see prayer times.');
      }
    };
    fetchLocationAndPrayers();
  }, []);

  useEffect(() => {
    const filtered = surahs.filter(s => 
      s.name.includes(searchQuery) || 
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString() === searchQuery
    );
    setFilteredSurahs(filtered);
  }, [searchQuery, surahs]);

  const handleSurahClick = async (surah: Surah) => {
    setSelectedSurah(surah);
    setDetailLoading(true);
    setSurahDetail(null);
    setTranslation(null);
    setActiveAyah(null);
    stopAudio();
    
    try {
      const [detail, trans] = await Promise.all([
        fetchSurahDetail(surah.number),
        fetchTranslation(surah.number)
      ]);
      setSurahDetail(detail);
      setTranslation(trans);
    } catch (error) {
      console.error('Error fetching surah details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const playAyahAudio = (ayah: Ayah) => {
    if (activeAyah === ayah.number && isPlaying) {
      stopAudio();
      return;
    }

    stopAudio();
    const audioUrl = getAyahAudioUrl(ayah.number);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      setIsPlaying(false);
      setActiveAyah(null);
    };

    audio.play();
    setCurrentAudio(audio);
    setIsPlaying(true);
    setActiveAyah(ayah.number);
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setIsPlaying(false);
    setActiveAyah(null);
  };

  const closeDetail = () => {
    setSelectedSurah(null);
    setSurahDetail(null);
    setTranslation(null);
    stopAudio();
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setNotificationsEnabled(true);
          }
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sunrise': return <Sunrise className="w-6 h-6" />;
      case 'Sun': return <Sun className="w-6 h-6" />;
      case 'CloudSun': return <CloudSun className="w-6 h-6" />;
      case 'Sunset': return <Sunset className="w-6 h-6" />;
      case 'Moon': return <Moon className="w-6 h-6" />;
      case 'MoonStar': return <MoonStar className="w-6 h-6" />;
      case 'Stars': return <Stars className="w-6 h-6" />;
      default: return <Clock className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-quran-cream">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-quran-gold border-t-transparent rounded-full mb-4"
        />
        <h2 className="kufi-text text-2xl text-quran-green">جاري التحميل...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quran-cream flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-quran-gold/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-quran-gold/10 rounded-full transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6 text-quran-green" />
          </button>
          <div className="flex flex-col">
            <h1 className="kufi-text text-2xl font-bold text-quran-green leading-tight">القرآن الكريم</h1>
            <span className="text-[10px] uppercase tracking-widest text-quran-gold font-semibold">The Holy Quran</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            <button 
              onClick={() => setActiveView('quran')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeView === 'quran' ? 'bg-quran-green text-white shadow-md' : 'text-quran-ink/60 hover:bg-quran-gold/10'}`}
            >
              المصحف
            </button>
            <button 
              onClick={() => setActiveView('prayer')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeView === 'prayer' ? 'bg-quran-green text-white shadow-md' : 'text-quran-ink/60 hover:bg-quran-gold/10'}`}
            >
              أوقات الصلاة
            </button>
          </nav>
        </div>

        <div className="hidden md:flex items-center bg-quran-cream border border-quran-gold/30 rounded-full px-4 py-2 w-full max-w-md mx-8 focus-within:ring-2 ring-quran-gold/20 transition-all">
          <Search className="w-4 h-4 text-quran-gold mr-2" />
          <input 
            type="text" 
            placeholder="Search Surah (e.g. Al-Fatihah, 1, الفاتحة)" 
            className="bg-transparent border-none focus:outline-none w-full text-sm text-quran-ink"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-quran-gold/10 rounded-full transition-colors">
            <Heart className="w-5 h-5 text-quran-gold" />
          </button>
          <button className="p-2 hover:bg-quran-gold/10 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-quran-gold" />
          </button>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-6 py-3 bg-white/50 border-b border-quran-gold/10">
        <div className="flex items-center bg-quran-cream border border-quran-gold/30 rounded-full px-4 py-2 w-full">
          <Search className="w-4 h-4 text-quran-gold mr-2" />
          <input 
            type="text" 
            placeholder="Search Surah..." 
            className="bg-transparent border-none focus:outline-none w-full text-sm text-quran-ink"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Surah List */}
        {activeView === 'quran' && (
          <div className={`flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${selectedSurah ? 'hidden lg:grid' : 'grid'}`}>
            {filteredSurahs.map((surah) => (
              <motion.div
                key={surah.number}
                whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(197, 160, 89, 0.1)" }}
                onClick={() => handleSurahClick(surah)}
                className="bg-white border border-quran-gold/20 rounded-2xl p-5 cursor-pointer flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-quran-gold/10 flex items-center justify-center text-quran-gold font-bold text-sm rotate-45 group-hover:rotate-0 transition-transform">
                    <span className="-rotate-45 group-hover:rotate-0 transition-transform">{surah.number}</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-quran-ink group-hover:text-quran-gold transition-colors">{surah.englishName}</h3>
                    <span className="text-xs text-quran-ink/50">{surah.englishNameTranslation}</span>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="arabic-text text-xl font-bold text-quran-green">{surah.name}</h3>
                  <span className="text-[10px] text-quran-gold uppercase font-bold">{surah.numberOfAyahs} Ayahs</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Prayer Times View */}
        {activeView === 'prayer' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-quran-gold/20 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-quran-gold/10 rounded-2xl">
                    <MapPin className="w-8 h-8 text-quran-gold" />
                  </div>
                  <div>
                    <h2 className="kufi-text text-2xl font-bold text-quran-green">أوقات الصلاة</h2>
                    <p className="text-sm text-quran-ink/50 font-medium">
                      {location ? `Lat: ${location.latitude.toFixed(2)}, Lon: ${location.longitude.toFixed(2)}` : 'Detecting location...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-quran-gold uppercase tracking-widest">{format(new Date(), 'EEEE, d MMMM')}</p>
                    <p className="text-xs text-quran-ink/40">Next prayer in 45 mins (simulated)</p>
                  </div>
                  <button 
                    onClick={toggleNotifications}
                    className={`p-4 rounded-2xl transition-all ${notificationsEnabled ? 'bg-quran-green text-white' : 'bg-quran-cream text-quran-gold border border-quran-gold/20'}`}
                  >
                    {notificationsEnabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              {locationError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm flex items-center gap-3">
                  <Info className="w-5 h-5" />
                  {locationError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {prayerTimes.map((prayer, index) => (
                  <motion.div
                    key={prayer.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-quran-gold/10 hover:border-quran-gold/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-quran-cream rounded-xl text-quran-gold group-hover:bg-quran-gold group-hover:text-white transition-colors">
                        {getIcon(prayer.icon)}
                      </div>
                      <span className="text-xs font-bold text-quran-gold uppercase tracking-tighter">{prayer.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="kufi-text text-xl font-bold text-quran-green">{prayer.arabicName}</h3>
                      <p className="text-2xl font-bold text-quran-ink mt-1 tracking-tight">{prayer.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-quran-gold/5 p-8 rounded-3xl border border-quran-gold/10 text-center">
                <h3 className="kufi-text text-xl font-bold text-quran-green mb-2">تنبيهات الأذان</h3>
                <p className="text-sm text-quran-ink/60 max-w-md mx-auto">
                  سيقوم التطبيق بإرسال تنبيهات عند دخول وقت الصلاة. تأكد من السماح بالإشعارات في متصفحك.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Surah Detail View */}
        <AnimatePresence>
          {selectedSurah && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 lg:relative lg:flex-[2] z-50 bg-quran-cream flex flex-col shadow-2xl lg:shadow-none"
            >
              {/* Detail Header */}
              <div className="bg-white border-b border-quran-gold/20 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <button 
                  onClick={closeDetail}
                  className="p-2 hover:bg-quran-gold/10 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-quran-green" />
                </button>
                <div className="text-center">
                  <h2 className="arabic-text text-2xl font-bold text-quran-green">{selectedSurah.name}</h2>
                  <p className="text-xs text-quran-gold font-semibold uppercase tracking-widest">{selectedSurah.englishName} • {selectedSurah.revelationType}</p>
                </div>
                <div className="w-10"></div> {/* Spacer */}
              </div>

              {/* Ayahs Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
                {detailLoading ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-quran-gold border-t-transparent rounded-full mb-4"
                    />
                    <p className="text-quran-gold font-medium">Loading Ayahs...</p>
                  </div>
                ) : (
                  <>
                    {/* Bismillah */}
                    {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                      <div className="text-center py-8">
                        <h2 className="arabic-text text-3xl text-quran-green">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
                      </div>
                    )}

                    {surahDetail?.ayahs.map((ayah, index) => (
                      <motion.div 
                        key={ayah.number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group p-6 rounded-3xl transition-all border ${activeAyah === ayah.number ? 'bg-quran-gold/5 border-quran-gold/30 shadow-lg' : 'bg-white border-transparent hover:border-quran-gold/10'}`}
                      >
                        <div className="flex flex-col gap-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-quran-gold/10 flex items-center justify-center text-[10px] font-bold text-quran-gold border border-quran-gold/20">
                                {ayah.numberInSurah}
                              </div>
                              <button 
                                onClick={() => playAyahAudio(ayah)}
                                className={`p-2 rounded-full transition-all ${activeAyah === ayah.number && isPlaying ? 'bg-quran-green text-white' : 'bg-quran-cream text-quran-gold hover:bg-quran-gold hover:text-white'}`}
                              >
                                {activeAyah === ayah.number && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="arabic-text text-3xl leading-[1.8] text-right text-quran-ink flex-1">
                              {/* Remove Bismillah from first ayah if not Surah Fatihah */}
                              {selectedSurah.number !== 1 && index === 0 ? ayah.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim() : ayah.text}
                            </p>
                          </div>
                          
                          <div className="border-t border-quran-gold/10 pt-4">
                            <p className="text-quran-ink/70 text-sm leading-relaxed italic">
                              {translation?.ayahs[index].text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar for Mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden p-6 flex flex-col gap-8 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h2 className="kufi-text text-xl font-bold text-quran-green">القائمة</h2>
                  <button onClick={() => setIsSidebarOpen(false)}>
                    <X className="w-6 h-6 text-quran-gold" />
                  </button>
                </div>
                
                <nav className="flex flex-col gap-4">
                  <button 
                    onClick={() => { setActiveView('quran'); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${activeView === 'quran' ? 'bg-quran-gold/10 text-quran-gold' : 'hover:bg-quran-cream text-quran-ink/70'}`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>المصحف</span>
                  </button>
                  <button 
                    onClick={() => { setActiveView('prayer'); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${activeView === 'prayer' ? 'bg-quran-gold/10 text-quran-gold' : 'hover:bg-quran-cream text-quran-ink/70'}`}
                  >
                    <Clock className="w-5 h-5" />
                    <span>أوقات الصلاة</span>
                  </button>
                  <button className="flex items-center gap-3 p-3 hover:bg-quran-cream text-quran-ink/70 rounded-xl font-medium transition-colors">
                    <Heart className="w-5 h-5" />
                    <span>المفضلة</span>
                  </button>
                  <button className="flex items-center gap-3 p-3 hover:bg-quran-cream text-quran-ink/70 rounded-xl font-medium transition-colors">
                    <Info className="w-5 h-5" />
                    <span>عن التطبيق</span>
                  </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-quran-gold/10">
                  <div className="flex items-center justify-between p-3 bg-quran-cream rounded-xl">
                    <span className="text-sm font-medium text-quran-ink/70">المظهر</span>
                    <div className="flex bg-white p-1 rounded-lg border border-quran-gold/20">
                      <button className="p-1.5 bg-quran-gold/10 text-quran-gold rounded-md">
                        <Sun className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-quran-ink/30">
                        <Moon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Player Status */}
      {isPlaying && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-quran-green text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-tighter opacity-70">Now Reciting</span>
              <span className="text-xs font-bold truncate max-w-[120px]">Ayah {activeAyah}</span>
            </div>
          </div>
          <button 
            onClick={stopAudio}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <Pause className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

