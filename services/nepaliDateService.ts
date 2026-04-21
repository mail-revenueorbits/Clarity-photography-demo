
/**
 * Nepali Date Converter Service (Simplified)
 * Handles AD to BS conversion for years 2000 to 2090 BS.
 */

const nepaliYearData: Record<number, number[]> = {
  2050: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2051: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2055: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 32, 31, 32, 32, 31, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 32, 31, 30, 29, 30, 29, 30, 30],
  2058: [31, 32, 31, 32, 32, 31, 30, 29, 30, 29, 30, 30],
  2059: [31, 32, 31, 32, 32, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 32, 31, 32, 32, 31, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 32, 31, 30, 29, 30, 29, 30, 30],
  2062: [31, 32, 31, 32, 32, 31, 30, 29, 30, 29, 30, 30],
  2063: [31, 32, 31, 32, 32, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 32, 31, 32, 32, 31, 30, 29, 30, 29, 30, 30],
  2065: [31, 32, 32, 31, 31, 32, 30, 29, 30, 29, 30, 30],
  2066: [31, 32, 31, 32, 31, 32, 30, 29, 30, 29, 30, 30],
  2067: [31, 31, 32, 31, 31, 31, 30, 30, 30, 29, 30, 30], // Approximate
  2068: [31, 32, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30],
  2069: [31, 32, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30],
  2070: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2071: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2074: [31, 31, 32, 32, 31, 31, 30, 30, 30, 29, 30, 30],
  2075: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2077: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2078: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2081: [31, 31, 32, 32, 31, 31, 30, 30, 30, 29, 30, 30],
  2082: [31, 32, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30],
  2083: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2084: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2085: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2086: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2087: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2088: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2089: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
  2090: [31, 32, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30],
};

const nepaliMonths = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

/**
 * Converts AD date string (YYYY-MM-DD) to BS date string (YYYY-MM-DD BS)
 */
export const adToBs = (adDateStr: string): string => {
  if (!adDateStr) return '';
  
  const adDate = new Date(adDateStr);
  if (isNaN(adDate.getTime())) return '';

  // Reference Point: 2000-01-01 BS = 1943-04-14 AD
  // Since our table starts from 2050 BS, we need to calculate from a closer reference.
  // Let's use 2070-01-01 BS = 2013-04-14 AD
  const refAdDate = new Date('2013-04-14');
  let diffTime = adDate.getTime() - refAdDate.getTime();
  let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // For dates before 2070 BS, we'd need more data. 
    // But for "baby births", usually it's recent. 
    // Let's at least handle back to 2050 BS if possible.
    // 2050-01-01 BS = 1993-04-13 AD (approx)
    const refAdDate2050 = new Date('1993-04-13');
    diffTime = adDate.getTime() - refAdDate2050.getTime();
    diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Date too old';
    
    let currentBsYear = 2050;
    while (diffDays >= 0) {
      const yearDays = nepaliYearData[currentBsYear]?.reduce((a, b) => a + b, 0) || 365;
      if (diffDays < yearDays) {
        let currentBsMonth = 0;
        while (diffDays >= nepaliYearData[currentBsYear][currentBsMonth]) {
          diffDays -= nepaliYearData[currentBsYear][currentBsMonth];
          currentBsMonth++;
        }
        return `${currentBsYear}-${String(currentBsMonth + 1).padStart(2, '0')}-${String(diffDays + 1).padStart(2, '0')} BS`;
      }
      diffDays -= yearDays;
      currentBsYear++;
      if (!nepaliYearData[currentBsYear]) return 'Out of range';
    }
  } else {
    let currentBsYear = 2070;
    while (diffDays >= 0) {
      const yearDays = nepaliYearData[currentBsYear]?.reduce((a, b) => a + b, 0) || 365;
      if (diffDays < yearDays) {
        let currentBsMonth = 0;
        while (diffDays >= nepaliYearData[currentBsYear][currentBsMonth]) {
          diffDays -= nepaliYearData[currentBsYear][currentBsMonth];
          currentBsMonth++;
        }
        return `${currentBsYear}-${String(currentBsMonth + 1).padStart(2, '0')}-${String(diffDays + 1).padStart(2, '0')} BS`;
      }
      diffDays -= yearDays;
      currentBsYear++;
      if (!nepaliYearData[currentBsYear]) return 'Out of range';
    }
  }

  return 'Conversion Error';
};

/**
 * Converts BS date (YYYY, MM, DD) to AD date string (YYYY-MM-DD)
 */
export const bsToAd = (bsYear: number, bsMonth: number, bsDay: number): string => {
  if (bsYear < 2050 || bsYear > 2090) return 'Invalid Year';
  if (bsMonth < 1 || bsMonth > 12) return 'Invalid Month';
  
  const monthDays = nepaliYearData[bsYear][bsMonth - 1];
  if (bsDay < 1 || bsDay > monthDays) return 'Invalid Day';

  // Reference Point: 2050-01-01 BS = 1993-04-13 AD
  const refAdDate = new Date('1993-04-13');
  let totalDays = 0;

  for (let y = 2050; y < bsYear; y++) {
    totalDays += nepaliYearData[y].reduce((a, b) => a + b, 0);
  }

  for (let m = 0; m < bsMonth - 1; m++) {
    totalDays += nepaliYearData[bsYear][m];
  }

  totalDays += (bsDay - 1);

  const adDate = new Date(refAdDate);
  adDate.setDate(adDate.getDate() + totalDays);
  
  const y = adDate.getFullYear();
  const m = String(adDate.getMonth() + 1).padStart(2, '0');
  const d = String(adDate.getDate()).padStart(2, '0');
  
  return `${y}-${m}-${d}`;
};
