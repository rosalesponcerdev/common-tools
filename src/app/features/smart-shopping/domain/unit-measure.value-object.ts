export type UnitOfMeasure = 'gr' | 'kg' | 'ml' | 'lt' | 'unid';

export type MassUnit = 'gr' | 'kg';
export type VolumeUnit = 'ml' | 'lt';

export const isMassUnit = (unit: UnitOfMeasure): unit is MassUnit => {
  return unit === 'gr' || unit === 'kg';
};

export const isVolumeUnit = (unit: UnitOfMeasure): unit is VolumeUnit => {
  return unit === 'ml' || unit === 'lt';
};

export const isWeightOrVolume = (unit: UnitOfMeasure): boolean => {
  return isMassUnit(unit) || isVolumeUnit(unit);
};

export const getUnitLabel = (unit: UnitOfMeasure): string => {
  const labels: Record<UnitOfMeasure, string> = {
    gr: 'g',
    kg: 'kg',
    ml: 'ml',
    lt: 'L',
    unid: 'und',
  };
  return labels[unit];
};

export const getNormalizedUnit = (unit: UnitOfMeasure): UnitOfMeasure => {
  if (unit === 'gr') return 'kg';
  if (unit === 'ml') return 'lt';
  return unit;
};