export const toNepalTime = (date: Date): Date => {
  const utcTime = date.getTime();
  const nstOffset = 5 * 60 + 45; // 5 hours 45 minutes in minutes
  const nstTime = utcTime + nstOffset * 60 * 1000;
  return new Date(nstTime);
};
