import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeToMinutes,
  minutesToTime,
  validateTimeRange,
  checkBookingConflict,
  checkRecurringConflicts,
  filterAndScoreRooms,
} from './bookingConflict.js';
import { Booking, Room } from '../types/index.js';

const mockRooms: Room[] = [
  {
    id: 'ENG-201',
    name: 'Ada Lovelace Computing Lab',
    building: 'Engineering Hall',
    location: 'Engineering Hall, 2nd Floor, Room 201',
    capacity: 40,
    roomType: 'Computer Lab',
    equipment: ['40x GPU Workstations (RTX 4080)', 'Dual 4K Projectors', 'Digital Whiteboard'],
    requiresApproval: false,
    status: 'active',
    description: 'High-performance computing laboratory.',
    floor: 2,
  },
  {
    id: 'SCI-104',
    name: 'Rosalind Franklin Wet Lab',
    building: 'Science Complex',
    location: 'Science Complex, 1st Floor, Room 104',
    capacity: 24,
    roomType: 'Chemistry / Wet Lab',
    equipment: ['6x Chemical Fume Hoods', 'Centrifuges', 'Compound Microscopes'],
    requiresApproval: true,
    status: 'active',
    description: 'Certified bio-chemical wet laboratory.',
    floor: 1,
  },
  {
    id: 'ENG-202',
    name: 'Alan Turing Computing Lab B',
    building: 'Engineering Hall',
    location: 'Engineering Hall, 2nd Floor, Room 202',
    capacity: 35,
    roomType: 'Computer Lab',
    equipment: ['35x GPU Workstations', 'Dual 4K Projectors'],
    requiresApproval: false,
    status: 'active',
    description: 'Alternative computing lab.',
    floor: 2,
  },
];

const mockBookings: Booking[] = [
  {
    id: 'BK-1001',
    roomId: 'ENG-201',
    roomName: 'Ada Lovelace Computing Lab',
    date: '2026-11-09',
    startTime: '10:00',
    endTime: '12:00',
    userId: 'U-01',
    userName: 'Prof. David Martinez',
    userEmail: 'martinez@univ.edu',
    userRole: 'Faculty',
    department: 'Computer Science',
    purpose: 'CS450 Distributed Systems Lab',
    status: 'confirmed',
    createdAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'BK-1002',
    roomId: 'ENG-201',
    roomName: 'Ada Lovelace Computing Lab',
    date: '2026-11-09',
    startTime: '14:00',
    endTime: '16:00',
    userId: 'U-02',
    userName: 'Sarah Jenkins',
    userEmail: 'sjenkins@univ.edu',
    userRole: 'Student',
    department: 'Software Engineering',
    purpose: 'Senior Capstone Group Project',
    status: 'cancelled', // Cancelled booking should NOT cause conflicts
    createdAt: '2026-11-02T09:00:00Z',
    cancelledAt: '2026-11-03T10:00:00Z',
  },
];

test('timeToMinutes converts correctly', () => {
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('09:30'), 570);
  assert.equal(timeToMinutes('14:15'), 855);
  assert.equal(timeToMinutes('invalid'), -1);
});

test('minutesToTime formats correctly', () => {
  assert.equal(minutesToTime(0), '00:00');
  assert.equal(minutesToTime(570), '09:30');
  assert.equal(minutesToTime(855), '14:15');
});

test('validateTimeRange rejects end time before or equal to start time', () => {
  const res1 = validateTimeRange('14:00', '13:00');
  assert.equal(res1.isValid, false);
  assert.ok(res1.error?.includes('End time must be after the start time'));

  const res2 = validateTimeRange('10:00', '10:00');
  assert.equal(res2.isValid, false);
});

test('validateTimeRange enforces operating hours and minimum duration', () => {
  // Too short
  const resShort = validateTimeRange('10:00', '10:05');
  assert.equal(resShort.isValid, false);
  assert.ok(resShort.error?.includes('at least 15 minutes'));

  // Before 07:00
  const resEarly = validateTimeRange('06:00', '08:00');
  assert.equal(resEarly.isValid, false);

  // After 22:00
  const resLate = validateTimeRange('21:00', '23:00');
  assert.equal(resLate.isValid, false);

  // Valid range
  const resValid = validateTimeRange('09:00', '11:00');
  assert.equal(resValid.isValid, true);
});

test('checkBookingConflict detects overlapping bookings for same room & date', () => {
  // Exactly identical: 10:00 - 12:00
  const conflict1 = checkBookingConflict(
    { roomId: 'ENG-201', date: '2026-11-09', startTime: '10:00', endTime: '12:00' },
    mockBookings,
    mockRooms
  );
  assert.equal(conflict1.hasConflict, true);
  assert.equal(conflict1.conflictingBooking?.id, 'BK-1001');

  // Partial overlap at start: 09:30 - 10:30
  const conflict2 = checkBookingConflict(
    { roomId: 'ENG-201', date: '2026-11-09', startTime: '09:30', endTime: '10:30' },
    mockBookings,
    mockRooms
  );
  assert.equal(conflict2.hasConflict, true);

  // Partial overlap at end: 11:30 - 13:00
  const conflict3 = checkBookingConflict(
    { roomId: 'ENG-201', date: '2026-11-09', startTime: '11:30', endTime: '13:00' },
    mockBookings,
    mockRooms
  );
  assert.equal(conflict3.hasConflict, true);

  // Enclosed within: 10:30 - 11:30
  const conflict4 = checkBookingConflict(
    { roomId: 'ENG-201', date: '2026-11-09', startTime: '10:30', endTime: '11:30' },
    mockBookings,
    mockRooms
  );
  assert.equal(conflict4.hasConflict, true);
});

test('checkBookingConflict allows non-overlapping bookings for same room', () => {
  // Before existing: 08:00 - 10:00 (ends right when existing starts)
  const nonOverlap1 = checkBookingConflict(
    { roomId: 'ENG-201', date: '2026-11-09', startTime: '08:00', endTime: '10:00' },
    mockBookings,
    mockRooms
  );
  assert.equal(nonOverlap1.hasConflict, false);

  // After existing: 12:00 - 14:00 (starts right when existing ends)
  const nonOverlap2 = checkBookingConflict(
    { roomId: 'ENG-201', date: '2026-11-09', startTime: '12:00', endTime: '14:00' },
    mockBookings,
    mockRooms
  );
  assert.equal(nonOverlap2.hasConflict, false);

  // Different date
  const differentDate = checkBookingConflict(
    { roomId: 'ENG-201', date: '2026-11-10', startTime: '10:00', endTime: '12:00' },
    mockBookings,
    mockRooms
  );
  assert.equal(differentDate.hasConflict, false);
});

test('cancelled bookings do not cause conflicts', () => {
  // Slot 14:00 - 16:00 has BK-1002 which was cancelled
  const canBookCancelledSlot = checkBookingConflict(
    { roomId: 'ENG-201', date: '2026-11-09', startTime: '14:00', endTime: '15:30' },
    mockBookings,
    mockRooms
  );
  assert.equal(canBookCancelledSlot.hasConflict, false);
});

test('another room can be booked at the exact same time without conflict', () => {
  // SCI-104 at 10:00 - 12:00 on 2026-11-09
  const diffRoomBooking = checkBookingConflict(
    { roomId: 'SCI-104', date: '2026-11-09', startTime: '10:00', endTime: '12:00' },
    mockBookings,
    mockRooms
  );
  assert.equal(diffRoomBooking.hasConflict, false);
});

test('conflict suggestions offer available alternative rooms', () => {
  const conflict = checkBookingConflict(
    { roomId: 'ENG-201', date: '2026-11-09', startTime: '10:00', endTime: '12:00' },
    mockBookings,
    mockRooms
  );
  assert.equal(conflict.hasConflict, true);
  assert.ok(conflict.suggestedRooms && conflict.suggestedRooms.length > 0);
  assert.equal(conflict.suggestedRooms[0].id, 'ENG-202');
});

test('filterAndScoreRooms correctly filters by equipment and marks availability', () => {
  // Filter for Fume Hoods
  const wetLabResults = filterAndScoreRooms(
    mockRooms,
    { equipment: ['Fume Hoods'] },
    mockBookings
  );
  assert.equal(wetLabResults.length, 1);
  assert.equal(wetLabResults[0].room.id, 'SCI-104');

  // Filter with time check when ENG-201 is occupied
  const busySlotResults = filterAndScoreRooms(
    mockRooms,
    {
      date: '2026-11-09',
      startTime: '10:00',
      endTime: '12:00',
    },
    mockBookings
  );
  const eng201 = busySlotResults.find((r) => r.room.id === 'ENG-201');
  const sci104 = busySlotResults.find((r) => r.room.id === 'SCI-104');
  assert.equal(eng201?.isAvailable, false);
  assert.equal(sci104?.isAvailable, true);
});
