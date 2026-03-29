import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes } from 'adhan';
import { format } from 'date-fns';
import { PrayerTime, LocationData } from '../types';

export const getPrayerTimes = (location: LocationData, date: Date = new Date()): PrayerTime[] => {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const params = CalculationMethod.MuslimWorldLeague();
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);

  const formatTime = (time: Date) => format(time, 'hh:mm a');

  return [
    { name: 'Fajr', arabicName: 'الفجر', time: formatTime(prayerTimes.fajr), icon: 'Sunrise' },
    { name: 'Sunrise', arabicName: 'الشروق', time: formatTime(prayerTimes.sunrise), icon: 'Sun' },
    { name: 'Dhuhr', arabicName: 'الظهر', time: formatTime(prayerTimes.dhuhr), icon: 'Sun' },
    { name: 'Asr', arabicName: 'العصر', time: formatTime(prayerTimes.asr), icon: 'CloudSun' },
    { name: 'Maghrib', arabicName: 'المغرب', time: formatTime(prayerTimes.maghrib), icon: 'Sunset' },
    { name: 'Isha', arabicName: 'العشاء', time: formatTime(prayerTimes.isha), icon: 'Moon' },
    { name: 'Midnight', arabicName: 'منتصف الليل', time: formatTime(sunnahTimes.middleOfTheNight), icon: 'MoonStar' },
    { name: 'Last Third', arabicName: 'الثلث الأخير', time: formatTime(sunnahTimes.lastThirdOfTheNight), icon: 'Stars' },
  ];
};

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    }
  });
};
