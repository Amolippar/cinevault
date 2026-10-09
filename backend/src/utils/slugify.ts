import slugifyLib from 'slugify';

export const createSlug = (title: string, year?: number): string => {
  const base = year ? `${title}-${year}` : title;
  return slugifyLib(base, {
    lower: true,
    strict: true,
    trim: true,
  });
};
