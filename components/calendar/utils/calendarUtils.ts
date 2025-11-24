/**
 * Calendar utility functions for date calculations and formatting
 */

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Gets the number of days in a given month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Gets the day of the week (0-6) for the first day of a given month
 */
export function getStartingDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Generates a 2D array representing weeks and days in a month
 * Returns array of weeks, where each week is an array of day numbers (or null for empty cells)
 */
export function generateCalendarWeeks(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: (number | null)[] = [];
  // Add nulls for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Add actual day numbers
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Split into weeks (arrays of 7 days)
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

/**
 * Checks if a given day is today
 */
export function isToday(day: number | null, month: number, year: number): boolean {
  if (!day) return false;
  const today = new Date();
  return (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  );
}

/**
 * Checks if a given day is the selected date
 */
export function isSelected(
  day: number | null,
  selectedDate: Date,
  month: number,
  year: number
): boolean {
  if (!day) return false;
  return (
    day === selectedDate.getDate() &&
    month === selectedDate.getMonth() &&
    year === selectedDate.getFullYear()
  );
}


