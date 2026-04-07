export const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/**
 * Sort classes by canonical day-of-week order, then alphabetically by time slot.
 * Pure function — no side effects, no Supabase dependency.
 */
export function sortClassesByDayAndTime<T extends { day_of_week: string; time_slot: string }>(
  classes: T[]
): T[] {
  return [...classes].sort((a, b) => {
    const dayDiff = DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week)
    if (dayDiff !== 0) return dayDiff
    return a.time_slot.localeCompare(b.time_slot)
  })
}

/**
 * Given the full class list and the set of class IDs a parent has already enrolled in,
 * return only the classes the parent can still enroll in.
 */
export function filterAvailableClasses<T extends { id: string }>(
  allClasses: T[],
  enrolledClassIds: string[]
): T[] {
  const enrolled = new Set(enrolledClassIds)
  return allClasses.filter(c => !enrolled.has(c.id))
}

/**
 * Format a class schedule as a human-readable string.
 * e.g. "Monday at 9:00 AM — Zone A"
 */
export function formatClassSchedule(dayOfWeek: string, timeSlot: string, location: string): string {
  return `${dayOfWeek} at ${timeSlot} — ${location}`
}

/**
 * Validate that a string is a well-formed UUID v4.
 * Used in Server Actions to guard against malformed IDs before hitting the database.
 */
export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)
}
