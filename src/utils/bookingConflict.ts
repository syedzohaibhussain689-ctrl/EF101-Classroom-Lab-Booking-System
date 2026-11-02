import { Booking, ConflictCheckResult, Room, BookingFilter } from '../types/index.js';

/**
 * Converts "HH:MM" string into minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return -1;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return -1;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight into "HH:MM" format.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Validates a time range.
 * - End time must be strictly after start time.
 * - Minimum duration: 15 minutes.
 * - Maximum duration: 10 hours.
 * - Must be within operational hours (07:00 - 22:00).
 */
export function validateTimeRange(
  startTime: string,
  endTime: string,
  date?: string
): { isValid: boolean; error?: string } {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (startMin === -1 || endMin === -1) {
    return { isValid: false, error: 'Invalid time format. Please use HH:MM.' };
  }

  if (endMin <= startMin) {
    return {
      isValid: false,
      error: 'End time must be after the start time. An earlier or identical end time is invalid.',
    };
  }

  const duration = endMin - startMin;
  if (duration < 15) {
    return { isValid: false, error: 'Booking duration must be at least 15 minutes.' };
  }

  if (duration > 600) {
    return { isValid: false, error: 'Single reservation duration cannot exceed 10 hours.' };
  }

  const openingMinutes = 7 * 60; // 07:00
  const closingMinutes = 22 * 60; // 22:00
  if (startMin < openingMinutes || endMin > closingMinutes) {
    return {
      isValid: false,
      error: 'Reservations are only permitted between facility operating hours (07:00 to 22:00).',
    };
  }

  if (date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(`${date}T00:00:00`);
    if (isNaN(targetDate.getTime())) {
      return { isValid: false, error: 'Invalid reservation date specified.' };
    }
  }

  return { isValid: true };
}

/**
 * Core Conflict Prevention Algorithm:
 * Checks whether candidate reservation overlaps with any confirmed or pending reservation
 * for the exact same room on the specified date.
 *
 * Overlap condition:
 * (CandidateStart < ExistingEnd) AND (CandidateEnd > ExistingStart)
 */
export function checkBookingConflict(
  candidate: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    id?: string;
  },
  existingBookings: Booking[],
  allRooms: Room[] = []
): ConflictCheckResult {
  const candStart = timeToMinutes(candidate.startTime);
  const candEnd = timeToMinutes(candidate.endTime);

  if (candStart === -1 || candEnd === -1 || candEnd <= candStart) {
    return {
      hasConflict: true,
      reason: 'Invalid candidate time range.',
    };
  }

  // Active bookings on the same date and room
  const activeBookings = existingBookings.filter(
    (b) =>
      b.roomId === candidate.roomId &&
      b.date === candidate.date &&
      b.status !== 'cancelled' &&
      b.status !== 'rejected' &&
      (!candidate.id || b.id !== candidate.id)
  );

  for (const existing of activeBookings) {
    const exStart = timeToMinutes(existing.startTime);
    const exEnd = timeToMinutes(existing.endTime);

    // Overlap test
    if (candStart < exEnd && candEnd > exStart) {
      // Find candidate alternative rooms of same or compatible type available at that time
      const targetRoom = allRooms.find((r) => r.id === candidate.roomId);
      const suggestedRooms = allRooms.filter((r) => {
        if (r.id === candidate.roomId || r.status === 'maintenance') return false;
        // Check if this alternative room has conflict
        const hasAltConflict = existingBookings.some((b) => {
          if (
            b.roomId !== r.id ||
            b.date !== candidate.date ||
            b.status === 'cancelled' ||
            b.status === 'rejected'
          ) {
            return false;
          }
          const bStart = timeToMinutes(b.startTime);
          const bEnd = timeToMinutes(b.endTime);
          return candStart < bEnd && candEnd > bStart;
        });
        if (hasAltConflict) return false;
        // Prefer matching room type or adequate capacity
        return !targetRoom || r.capacity >= targetRoom.capacity * 0.7;
      }).slice(0, 3);

      return {
        hasConflict: true,
        conflictingBooking: existing,
        reason: `Room is already booked by ${existing.userName} (${existing.purpose}) from ${existing.startTime} to ${existing.endTime}.`,
        suggestedRooms,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Checks conflict for recurring bookings across multiple dates.
 */
export function checkRecurringConflicts(
  candidate: {
    roomId: string;
    startDate: string;
    startTime: string;
    endTime: string;
    frequency: 'daily' | 'weekly';
    occurrences: number;
  },
  existingBookings: Booking[],
  allRooms: Room[] = []
): { datesWithConflict: { date: string; conflict: ConflictCheckResult }[]; allDates: string[] } {
  const datesWithConflict: { date: string; conflict: ConflictCheckResult }[] = [];
  const allDates: string[] = [];
  const base = new Date(`${candidate.startDate}T00:00:00`);

  for (let i = 0; i < candidate.occurrences; i++) {
    const d = new Date(base);
    if (candidate.frequency === 'daily') {
      d.setDate(base.getDate() + i);
    } else {
      d.setDate(base.getDate() + i * 7);
    }
    const dateStr = d.toISOString().split('T')[0];
    allDates.push(dateStr);

    const conflict = checkBookingConflict(
      {
        roomId: candidate.roomId,
        date: dateStr,
        startTime: candidate.startTime,
        endTime: candidate.endTime,
      },
      existingBookings,
      allRooms
    );

    if (conflict.hasConflict) {
      datesWithConflict.push({ date: dateStr, conflict });
    }
  }

  return { datesWithConflict, allDates };
}

/**
 * Filters rooms based on search criteria and checks whether each room is available for the requested period.
 */
export function filterAndScoreRooms(
  rooms: Room[],
  filters: Partial<BookingFilter>,
  existingBookings: Booking[]
): { room: Room; isAvailable: boolean; conflictInfo?: ConflictCheckResult }[] {
  return rooms
    .filter((room) => {
      // Search query matches name, ID, location, or equipment
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          room.name.toLowerCase().includes(q) ||
          room.id.toLowerCase().includes(q) ||
          room.location.toLowerCase().includes(q) ||
          room.equipment.some((eq) => eq.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Building filter
      if (filters.building && filters.building !== 'all') {
        if (room.building !== filters.building) return false;
      }

      // Room type filter
      if (filters.roomType && filters.roomType !== 'all') {
        if (room.roomType !== filters.roomType) return false;
      }

      // Minimum capacity filter
      if (filters.minCapacity && room.capacity < filters.minCapacity) {
        return false;
      }

      // Equipment filter: room must possess all requested equipment
      if (filters.equipment && filters.equipment.length > 0) {
        const hasAllEquipment = filters.equipment.every((reqEq) =>
          room.equipment.some((roomEq) =>
            roomEq.toLowerCase().includes(reqEq.toLowerCase())
          )
        );
        if (!hasAllEquipment) return false;
      }

      return true;
    })
    .map((room) => {
      // Check availability for selected date & time
      if (filters.date && filters.startTime && filters.endTime) {
        const validRange = validateTimeRange(filters.startTime, filters.endTime, filters.date);
        if (validRange.isValid) {
          const conflict = checkBookingConflict(
            {
              roomId: room.id,
              date: filters.date,
              startTime: filters.startTime,
              endTime: filters.endTime,
            },
            existingBookings,
            rooms
          );
          return {
            room,
            isAvailable: !conflict.hasConflict && room.status !== 'maintenance',
            conflictInfo: conflict,
          };
        }
      }

      return {
        room,
        isAvailable: room.status !== 'maintenance',
      };
    });
}
