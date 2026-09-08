export type ShoeGroup = 'baby' | 'kids' | 'women' | 'men';
export type ShoeRegion = 'US' | 'UK' | 'EU';
export type ShoeRow = { us: number; uk: number; eu: number; cm: number };

export const shoeSizeTables: Record<ShoeGroup, readonly ShoeRow[]> = {
  baby: [
    { us: 1, uk: 0.5, eu: 16, cm: 9.5 }, { us: 2, uk: 1, eu: 17, cm: 10.2 },
    { us: 3, uk: 2, eu: 18, cm: 10.8 }, { us: 4, uk: 3, eu: 19, cm: 11.4 },
    { us: 5, uk: 4, eu: 20, cm: 12.1 }, { us: 5.5, uk: 4.5, eu: 21, cm: 12.7 },
    { us: 6, uk: 5, eu: 22, cm: 13.3 }, { us: 7, uk: 6, eu: 23, cm: 14.0 },
  ],
  kids: [
    { us: 8, uk: 7, eu: 24, cm: 14.6 }, { us: 9, uk: 8, eu: 25, cm: 15.2 },
    { us: 9.5, uk: 8.5, eu: 26, cm: 15.9 }, { us: 10, uk: 9, eu: 27, cm: 16.5 },
    { us: 11, uk: 10, eu: 28, cm: 17.1 }, { us: 11.5, uk: 10.5, eu: 29, cm: 17.8 },
    { us: 12, uk: 11, eu: 30, cm: 18.4 }, { us: 13, uk: 12, eu: 31, cm: 19.1 },
    { us: 1, uk: 13, eu: 32, cm: 19.7 }, { us: 2, uk: 1, eu: 33, cm: 20.3 },
    { us: 3, uk: 2, eu: 34, cm: 21.0 }, { us: 3.5, uk: 2.5, eu: 35, cm: 21.6 },
    { us: 4, uk: 3, eu: 36, cm: 22.2 }, { us: 5, uk: 4, eu: 37, cm: 22.9 },
    { us: 6, uk: 5, eu: 38, cm: 23.5 }, { us: 7, uk: 6, eu: 39, cm: 24.1 },
  ],
  women: [
    { us: 5, uk: 3, eu: 35.5, cm: 22.0 }, { us: 5.5, uk: 3.5, eu: 36, cm: 22.5 },
    { us: 6, uk: 4, eu: 36.5, cm: 23.0 }, { us: 6.5, uk: 4.5, eu: 37.5, cm: 23.5 },
    { us: 7, uk: 5, eu: 38, cm: 24.0 }, { us: 7.5, uk: 5.5, eu: 38.5, cm: 24.5 },
    { us: 8, uk: 6, eu: 39, cm: 25.0 }, { us: 8.5, uk: 6.5, eu: 40, cm: 25.5 },
    { us: 9, uk: 7, eu: 40.5, cm: 26.0 }, { us: 9.5, uk: 7.5, eu: 41, cm: 26.5 },
    { us: 10, uk: 8, eu: 42, cm: 27.0 }, { us: 10.5, uk: 8.5, eu: 42.5, cm: 27.5 },
    { us: 11, uk: 9, eu: 43, cm: 28.0 }, { us: 12, uk: 10, eu: 44.5, cm: 29.0 },
  ],
  men: [
    { us: 6, uk: 5, eu: 38.5, cm: 24.0 }, { us: 6.5, uk: 5.5, eu: 39, cm: 24.5 },
    { us: 7, uk: 6, eu: 40, cm: 25.0 }, { us: 7.5, uk: 6.5, eu: 40.5, cm: 25.5 },
    { us: 8, uk: 7, eu: 41, cm: 26.0 }, { us: 8.5, uk: 7.5, eu: 42, cm: 26.5 },
    { us: 9, uk: 8, eu: 42.5, cm: 27.0 }, { us: 9.5, uk: 8.5, eu: 43, cm: 27.5 },
    { us: 10, uk: 9, eu: 44, cm: 28.0 }, { us: 10.5, uk: 9.5, eu: 44.5, cm: 28.5 },
    { us: 11, uk: 10, eu: 45, cm: 29.0 }, { us: 11.5, uk: 10.5, eu: 45.5, cm: 29.5 },
    { us: 12, uk: 11, eu: 46, cm: 30.0 }, { us: 13, uk: 12, eu: 47.5, cm: 31.0 },
    { us: 14, uk: 13, eu: 48.5, cm: 32.0 }, { us: 15, uk: 14, eu: 49.5, cm: 33.0 },
  ],
};

export const shoeGroupLabels: Record<ShoeGroup, string> = {
  baby: 'Baby / toddler',
  kids: 'Children / youth',
  women: 'Women',
  men: 'Men',
};

export const shoeKeyForRegion: Record<ShoeRegion, keyof ShoeRow> = {
  US: 'us',
  UK: 'uk',
  EU: 'eu',
};

export const formatShoeSize = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);

export function findShoeSizeMatch(group: ShoeGroup, region: ShoeRegion, value: number) {
  const key = shoeKeyForRegion[region];
  return shoeSizeTables[group].find((row) => Math.abs(Number(row[key]) - value) < 0.001);
}
