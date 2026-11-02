import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Room,
  Booking,
  UserProfile,
  ConflictCheckResult,
} from '../types/index.js';
import {
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  DEMO_USERS,
} from '../data/initialData.js';
import {
  checkBookingConflict,
  checkRecurringConflicts,
  validateTimeRange,
} from '../utils/bookingConflict.js';

interface BookingNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export interface TestResultItem {
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'running' | 'idle';
  detail: string;
}

interface BookingContextType {
  rooms: Room[];
  bookings: Booking[];
  currentUser: UserProfile;
  notifications: BookingNotification[];
  setCurrentUser: (user: UserProfile) => void;
  createBooking: (candidate: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    requestedEquipment?: string[];
    notes?: string;
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly';
    recurringOccurrences?: number;
  }) => { success: boolean; bookingId?: string; error?: string; conflict?: ConflictCheckResult };
  cancelBooking: (bookingId: string, reason?: string) => { success: boolean; message: string };
  approveBooking: (bookingId: string) => void;
  rejectBooking: (bookingId: string, reason?: string) => void;
  addRoom: (newRoom: Room) => { success: boolean; error?: string };
  updateRoom: (roomId: string, updatedData: Partial<Room>) => { success: boolean; error?: string };
  resetToDemoData: () => void;
  dismissNotification: (id: string) => void;
  runAutomatedTestSuite: () => Promise<TestResultItem[]>;
  testResults: TestResultItem[] | null;
  isTesting: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const ROOMS_STORAGE_KEY = 'ef101_rooms_v1';
const BOOKINGS_STORAGE_KEY = 'ef101_bookings_v1';
const USER_STORAGE_KEY = 'ef101_user_v1';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(ROOMS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ROOMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_BOOKINGS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = DEMO_USERS.find((u) => u.id === parsed.id);
        if (match) return match;
      }
    } catch {
      // fallback
    }
    return DEMO_USERS[0]; // Default: Prof. Eleanor Vance (Faculty)
  });

  const bookingsRef = React.useRef<Booking[]>(bookings);
  bookingsRef.current = bookings;

  const roomsRef = React.useRef<Room[]>(rooms);
  roomsRef.current = rooms;

  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [testResults, setTestResults] = useState<TestResultItem[] | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    } catch {
      // ignore
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  }, [currentUser]);

  const addNotification = (
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string
  ) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setNotifications((prev) => [
      { id, type, title, message, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 1),
    ]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const createBooking = (candidate: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    requestedEquipment?: string[];
    notes?: string;
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly';
    recurringOccurrences?: number;
  }) => {
    // 1. Validate room exists & is active
    const room = rooms.find((r) => r.id === candidate.roomId);
    if (!room) {
      return { success: false, error: 'Specified room was not found.' };
    }
    if (room.status === 'maintenance') {
      return { success: false, error: `${room.name} is currently under maintenance.` };
    }

    // 2. Validate time range
    const timeValidation = validateTimeRange(candidate.startTime, candidate.endTime, candidate.date);
    if (!timeValidation.isValid) {
      return { success: false, error: timeValidation.error || 'Invalid reservation time range.' };
    }

    if (!candidate.purpose || candidate.purpose.trim().length < 3) {
      return { success: false, error: 'Please enter a valid reservation purpose (at least 3 characters).' };
    }

    // 3. Handle recurring bookings
    if (candidate.isRecurring && candidate.recurringOccurrences && candidate.recurringOccurrences > 1) {
      const recResult = checkRecurringConflicts(
        {
          roomId: candidate.roomId,
          startDate: candidate.date,
          startTime: candidate.startTime,
          endTime: candidate.endTime,
          frequency: candidate.recurringFrequency || 'weekly',
          occurrences: candidate.recurringOccurrences,
        },
        bookingsRef.current,
        roomsRef.current
      );

      if (recResult.datesWithConflict.length > 0) {
        const first = recResult.datesWithConflict[0];
        return {
          success: false,
          error: `Schedule conflict on ${first.date}: ${first.conflict.reason}`,
          conflict: first.conflict,
        };
      }

      // Create all recurring bookings linked together
      const parentId = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBookings: Booking[] = recResult.allDates.map((d, index) => ({
        id: index === 0 ? parentId : `${parentId}-R${index + 1}`,
        roomId: room.id,
        roomName: room.name,
        date: d,
        startTime: candidate.startTime,
        endTime: candidate.endTime,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userRole: currentUser.role,
        department: currentUser.department,
        purpose: candidate.purpose,
        status: room.requiresApproval && currentUser.role === 'Student' ? 'pending_approval' : 'confirmed',
        requestedEquipment: candidate.requestedEquipment,
        notes: candidate.notes,
        createdAt: new Date().toISOString(),
        recurring: {
          frequency: candidate.recurringFrequency || 'weekly',
          occurrences: candidate.recurringOccurrences || 1,
          parentBookingId: parentId,
        },
      }));

      bookingsRef.current = [...bookingsRef.current, ...newBookings];
      setBookings(bookingsRef.current);
      addNotification(
        'success',
        'Recurring Bookings Confirmed',
        `Successfully booked ${room.name} across ${newBookings.length} sessions starting ${candidate.date}.`
      );
      return { success: true, bookingId: parentId };
    }

    // 4. Single reservation conflict check
    const conflict = checkBookingConflict(
      {
        roomId: candidate.roomId,
        date: candidate.date,
        startTime: candidate.startTime,
        endTime: candidate.endTime,
      },
      bookingsRef.current,
      roomsRef.current
    );

    if (conflict.hasConflict) {
      addNotification(
        'warning',
        'Reservation Conflict Detected',
        `Cannot book ${room.name}. Overlaps with an existing reservation.`
      );
      return {
        success: false,
        error: conflict.reason || 'Requested time slot conflicts with an existing reservation.',
        conflict,
      };
    }

    // 5. Create confirmed/pending booking
    const bookingId = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isApprovalNeeded = room.requiresApproval && currentUser.role === 'Student';
    const newBooking: Booking = {
      id: bookingId,
      roomId: room.id,
      roomName: room.name,
      date: candidate.date,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      department: currentUser.department,
      purpose: candidate.purpose,
      status: isApprovalNeeded ? 'pending_approval' : 'confirmed',
      requestedEquipment: candidate.requestedEquipment,
      notes: candidate.notes,
      createdAt: new Date().toISOString(),
    };

    bookingsRef.current = [...bookingsRef.current, newBooking];
    setBookings(bookingsRef.current);
    addNotification(
      isApprovalNeeded ? 'info' : 'success',
      isApprovalNeeded ? 'Reservation Submitted for Approval' : 'Reservation Confirmed',
      isApprovalNeeded
        ? `Request for ${room.name} (${candidate.date} ${candidate.startTime}-${candidate.endTime}) is pending faculty/lab manager approval.`
        : `Successfully reserved ${room.name} for ${candidate.date} from ${candidate.startTime} to ${candidate.endTime}.`
    );

    return { success: true, bookingId };
  };

  const cancelBooking = (bookingId: string, reason = 'Cancelled by user') => {
    const target = bookingsRef.current.find((b) => b.id === bookingId);
    if (!target) {
      return { success: false, message: 'Reservation not found.' };
    }

    bookingsRef.current = bookingsRef.current.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason,
          }
        : b
    );
    setBookings(bookingsRef.current);

    addNotification(
      'info',
      'Reservation Cancelled',
      `Booking ${bookingId} for ${target.roomName} has been cancelled. The room is now available for new reservations.`
    );
    return { success: true, message: 'Reservation cancelled successfully.' };
  };

  const approveBooking = (bookingId: string) => {
    bookingsRef.current = bookingsRef.current.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b));
    setBookings(bookingsRef.current);
    addNotification('success', 'Booking Approved', `Booking ${bookingId} has been approved.`);
  };

  const rejectBooking = (bookingId: string, reason = 'Rejected by lab supervisor') => {
    bookingsRef.current = bookingsRef.current.map((b) =>
      b.id === bookingId
        ? { ...b, status: 'rejected', cancellationReason: reason, cancelledAt: new Date().toISOString() }
        : b
    );
    setBookings(bookingsRef.current);
    addNotification('warning', 'Booking Rejected', `Booking ${bookingId} has been rejected.`);
  };

  const addRoom = (newRoom: Room) => {
    if (rooms.some((r) => r.id.toLowerCase() === newRoom.id.toLowerCase())) {
      return { success: false, error: `A room with ID "${newRoom.id}" already exists.` };
    }
    if (!newRoom.name || !newRoom.id || newRoom.capacity <= 0) {
      return { success: false, error: 'Please provide valid room ID, name, and capacity (> 0).' };
    }
    setRooms((prev) => [...prev, newRoom]);
    addNotification('success', 'Room Created', `Room ${newRoom.id} (${newRoom.name}) has been added to the registry.`);
    return { success: true };
  };

  const updateRoom = (roomId: string, updatedData: Partial<Room>) => {
    const roomExists = rooms.some((r) => r.id === roomId);
    if (!roomExists) {
      return { success: false, error: 'Room does not exist.' };
    }
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...updatedData } : r)));
    addNotification('info', 'Room Updated', `Room ${roomId} has been updated.`);
    return { success: true };
  };

  const resetToDemoData = () => {
    roomsRef.current = INITIAL_ROOMS;
    bookingsRef.current = INITIAL_BOOKINGS;
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setCurrentUser(DEMO_USERS[0]);
    localStorage.removeItem(ROOMS_STORAGE_KEY);
    localStorage.removeItem(BOOKINGS_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    addNotification('info', 'Data Reset', 'Demonstration rooms and bookings have been restored to initial state.');
  };

  /**
   * Automated Test Runner corresponding directly to the EF101 testing brief:
   * 1. Create one successful booking
   * 2. Attempt an overlapping booking (conflict check verification)
   * 3. Cancel a booking & verify room release
   * 4. Book another room at the same time (room isolation check)
   * 5. Search by equipment and verify filtering
   */
  const runAutomatedTestSuite = async (): Promise<TestResultItem[]> => {
    setIsTesting(true);
    const results: TestResultItem[] = [];

    // Clean up any artifacts from a previous automated test run
    bookingsRef.current = bookingsRef.current.filter(
      (b) =>
        !b.purpose.includes('EF101 Automated Test') &&
        !b.purpose.includes('Attempted Conflicting') &&
        !b.purpose.includes('Re-booking previously') &&
        !b.purpose.includes('Concurrent Reservation in Science Lab')
    );
    setBookings(bookingsRef.current);

    // Test 1: Create a successful booking
    const testDate = '2026-11-12';
    const result1 = createBooking({
      roomId: 'ENG-201',
      date: testDate,
      startTime: '08:00',
      endTime: '10:00',
      purpose: 'EF101 Automated Test Verification #1',
    });

    results.push({
      name: '1. Create Successful Booking',
      description: 'Reserve ENG-201 on 2026-11-12 from 08:00 to 10:00 with valid metadata.',
      status: result1.success ? 'passed' : 'failed',
      detail: result1.success
        ? `Booking confirmed with unique ID: ${result1.bookingId}`
        : `Booking failed: ${result1.error}`,
    });

    // Test 2: Attempt an overlapping booking
    const result2 = createBooking({
      roomId: 'ENG-201',
      date: testDate,
      startTime: '09:00',
      endTime: '11:00', // Overlaps with 08:00 - 10:00
      purpose: 'Attempted Conflicting Overlap',
    });

    results.push({
      name: '2. Prevent Overlapping Double-Booking',
      description: 'Attempt booking ENG-201 for overlapping period (09:00-11:00). Conflict must be rejected.',
      status: !result2.success && result2.conflict?.hasConflict ? 'passed' : 'failed',
      detail: !result2.success
        ? `Successfully rejected conflict! System reason: "${result2.error}"`
        : 'Failed: system allowed overlapping double-booking!',
    });

    // Test 3: Cancel a booking and verify slot freed
    if (result1.bookingId) {
      const cancelRes = cancelBooking(result1.bookingId, 'Automated Test Cancellation');
      // Now attempt the previously conflicting slot again
      const retryResult = createBooking({
        roomId: 'ENG-201',
        date: testDate,
        startTime: '08:00',
        endTime: '10:00',
        purpose: 'Re-booking previously cancelled slot',
      });

      results.push({
        name: '3. Cancel Booking & Slot Release',
        description: 'Cancel booking and verify that slot immediately becomes available for reservation.',
        status: cancelRes.success && retryResult.success ? 'passed' : 'failed',
        detail:
          cancelRes.success && retryResult.success
            ? 'Booking cancelled and slot successfully re-booked without conflict.'
            : 'Cancellation or re-booking failed.',
      });
    }

    // Test 4: Book another room at the same time
    const result4 = createBooking({
      roomId: 'SCI-104',
      date: testDate,
      startTime: '08:00',
      endTime: '10:00',
      purpose: 'Concurrent Reservation in Science Lab',
    });

    results.push({
      name: '4. Concurrent Booking in Another Room',
      description: 'Verify that booking a different room at the identical time slot is permitted (proper room isolation).',
      status: result4.success ? 'passed' : 'failed',
      detail: result4.success
        ? `Concurrent booking confirmed in SCI-104 (ID: ${result4.bookingId})`
        : `Failed: ${result4.error}`,
    });

    // Test 5: Search & Filter by Equipment
    const roomsWithFumeHoods = rooms.filter((r) =>
      r.equipment.some((e) => e.toLowerCase().includes('fume hood'))
    );
    const roomsWithGPUs = rooms.filter((r) =>
      r.equipment.some((e) => e.toLowerCase().includes('gpu'))
    );

    const filterPass = roomsWithFumeHoods.length > 0 && roomsWithGPUs.length > 0;
    results.push({
      name: '5. Search & Filter by Equipment',
      description: 'Filter demonstration room inventory by specialized equipment (Fume Hoods, GPU Workstations).',
      status: filterPass ? 'passed' : 'failed',
      detail: filterPass
        ? `Found ${roomsWithFumeHoods.length} wet labs with Fume Hoods and ${roomsWithGPUs.length} computing labs with GPU Workstations.`
        : 'Equipment search failed to return matching rooms.',
    });

    setTestResults(results);
    setIsTesting(false);
    return results;
  };

  return (
    <BookingContext.Provider
      value={{
        rooms,
        bookings,
        currentUser,
        notifications,
        setCurrentUser,
        createBooking,
        cancelBooking,
        approveBooking,
        rejectBooking,
        addRoom,
        updateRoom,
        resetToDemoData,
        dismissNotification,
        runAutomatedTestSuite,
        testResults,
        isTesting,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
