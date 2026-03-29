export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  audio: string;
  audioSecondary: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  };
}

export interface Reciter {
  identifier: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export interface PrayerTime {
  name: string;
  arabicName: string;
  time: string;
  icon: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
}
