export const INDONESIAN_CITIES = [
  {
    name: 'Jakarta',
    timezone: 'Asia/Jakarta',
    latitude: -6.2088,
    longitude: 106.8456,
    elevation: 8
  },
  {
    name: 'Bandung',
    timezone: 'Asia/Jakarta',
    latitude: -6.9175,
    longitude: 107.6191,
    elevation: 768
  },
  {
    name: 'Surabaya',
    timezone: 'Asia/Jakarta',
    latitude: -7.2575,
    longitude: 112.7521,
    elevation: 3
  },
  {
    name: 'Yogyakarta',
    timezone: 'Asia/Jakarta',
    latitude: -7.7956,
    longitude: 110.3695,
    elevation: 114
  },
  {
    name: 'Semarang',
    timezone: 'Asia/Jakarta',
    latitude: -6.9667,
    longitude: 110.4167,
    elevation: 3
  },
  {
    name: 'Medan',
    timezone: 'Asia/Jakarta',
    latitude: 3.5952,
    longitude: 98.6722,
    elevation: 25
  },
  {
    name: 'Makassar',
    timezone: 'Asia/Makassar',
    latitude: -5.1477,
    longitude: 119.4327,
    elevation: 5
  },
  {
    name: 'Palembang',
    timezone: 'Asia/Jakarta',
    latitude: -2.9761,
    longitude: 104.7754,
    elevation: 8
  },
  {
    name: 'Bali',
    timezone: 'Asia/Makassar',
    latitude: -8.4095,
    longitude: 115.1889,
    elevation: 75
  },
  {
    name: 'Malang',
    timezone: 'Asia/Jakarta',
    latitude: -7.9797,
    longitude: 112.6304,
    elevation: 506
  },
] as const;

export type CityName = typeof INDONESIAN_CITIES[number]['name'];
export type CityData = typeof INDONESIAN_CITIES[number];
