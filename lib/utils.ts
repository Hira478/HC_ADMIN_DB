export const formatToMillion = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    // Bagi dengan 1 juta dan format dengan 1 angka desimal
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    // Jika di bawah 1 juta tapi di atas seribu, tampilkan dalam ribuan (K)
    return `${(value / 1_000).toFixed(0)}K`;
  }
  // Jika di bawah seribu, tampilkan angkanya saja
  return value.toString();
};
