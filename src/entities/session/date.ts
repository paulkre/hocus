const START_YEAR = 1900;
const TOTAL_MONTHS_IN_RANGE = 46656;
const RANGE_OFFSET = 13330;

export function dateToID(date: Date): string {
  let monthNum = 12 * (date.getFullYear() - START_YEAR) + date.getMonth();
  monthNum = (monthNum + RANGE_OFFSET) % TOTAL_MONTHS_IN_RANGE;
  return monthNum.toString(36);
}

export function dateIDToDate(dateID: string): Date {
  let monthNum = parseInt(dateID, 36);
  monthNum =
    (monthNum - RANGE_OFFSET + TOTAL_MONTHS_IN_RANGE) % TOTAL_MONTHS_IN_RANGE;
  const months = monthNum % 12;
  return new Date(START_YEAR + Math.floor(monthNum / 12), months);
}
