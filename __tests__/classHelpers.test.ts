import { describe, it, expect } from 'vitest'
import {
  sortClassesByDayAndTime,
  filterAvailableClasses,
  formatClassSchedule,
  isValidUuid,
} from '@/lib/utils/classHelpers'

describe('sortClassesByDayAndTime', () => {
  it('sorts by canonical day order', () => {
    const input = [
      { id: '1', day_of_week: 'Wednesday', time_slot: '10:00 AM' },
      { id: '2', day_of_week: 'Monday', time_slot: '9:00 AM' },
      { id: '3', day_of_week: 'Friday', time_slot: '11:00 AM' },
    ]
    const result = sortClassesByDayAndTime(input)
    expect(result.map(c => c.day_of_week)).toEqual(['Monday', 'Wednesday', 'Friday'])
  })

  it('sorts by time slot when day is the same', () => {
    const input = [
      { id: '1', day_of_week: 'Monday', time_slot: '9:00 AM' },
      { id: '2', day_of_week: 'Monday', time_slot: '8:00 AM' },
    ]
    const result = sortClassesByDayAndTime(input)
    expect(result[0].id).toBe('2') // '8:00 AM' < '9:00 AM' alphabetically
    expect(result[1].id).toBe('1')
  })

  it('does not mutate the original array', () => {
    const input = [
      { id: '1', day_of_week: 'Friday', time_slot: '9:00 AM' },
      { id: '2', day_of_week: 'Monday', time_slot: '9:00 AM' },
    ]
    const original = [...input]
    sortClassesByDayAndTime(input)
    expect(input).toEqual(original)
  })

  it('returns an empty array when given an empty array', () => {
    expect(sortClassesByDayAndTime([])).toEqual([])
  })
})

describe('filterAvailableClasses', () => {
  it('excludes already-enrolled classes', () => {
    const all = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const result = filterAvailableClasses(all, ['a', 'c'])
    expect(result).toEqual([{ id: 'b' }])
  })

  it('returns all classes when nothing is enrolled', () => {
    const all = [{ id: 'a' }, { id: 'b' }]
    expect(filterAvailableClasses(all, [])).toEqual(all)
  })

  it('returns empty array when all classes are enrolled', () => {
    const all = [{ id: 'a' }, { id: 'b' }]
    expect(filterAvailableClasses(all, ['a', 'b'])).toEqual([])
  })
})

describe('formatClassSchedule', () => {
  it('formats day, time, and location correctly', () => {
    expect(formatClassSchedule('Monday', '9:00 AM', 'Zone A')).toBe('Monday at 9:00 AM — Zone A')
  })

  it('handles Center Ice location', () => {
    expect(formatClassSchedule('Saturday', '10:30 AM', 'Center Ice')).toBe('Saturday at 10:30 AM — Center Ice')
  })
})

describe('isValidUuid', () => {
  it('accepts a valid UUID', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('rejects an arbitrary string', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isValidUuid('')).toBe(false)
  })

  it('rejects a UUID with uppercase letters', () => {
    expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(false)
  })
})
