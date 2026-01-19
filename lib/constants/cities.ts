export const INDONESIAN_CITIES = [
  { name: 'Jakarta', timezone: 'Asia/Jakarta' },
  { name: 'Bandung', timezone: 'Asia/Jakarta' },
  { name: 'Surabaya', timezone: 'Asia/Jakarta' },
  { name: 'Yogyakarta', timezone: 'Asia/Jakarta' },
  { name: 'Semarang', timezone: 'Asia/Jakarta' },
  { name: 'Medan', timezone: 'Asia/Jakarta' },
  { name: 'Makassar', timezone: 'Asia/Makassar' },
  { name: 'Palembang', timezone: 'Asia/Jakarta' },
  { name: 'Bali', timezone: 'Asia/Makassar' },
  { name: 'Malang', timezone: 'Asia/Jakarta' },
] as const;

export type CityName = typeof INDONESIAN_CITIES[number]['name'];
