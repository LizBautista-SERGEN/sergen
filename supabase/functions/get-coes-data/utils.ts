
export const parseNumber = (value: string | number): number => {
  try {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const cleanValue = value.toString().replace(/\s/g, '').replace(',', '.');
    const number = parseFloat(cleanValue);
    return isNaN(number) ? 0 : number;
  } catch (error) {
    console.error('Error parseando número:', value, error);
    return 0;
  }
};

export const formatDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

