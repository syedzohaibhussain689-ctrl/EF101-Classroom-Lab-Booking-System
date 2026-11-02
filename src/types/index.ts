export type RoomType =
  | 'Lecture Hall'
  | 'Computer Lab'
  | 'Chemistry / Wet Lab'
  | 'Biology Lab'
  | 'Physics Lab'
  | 'Seminar Room'
  | 'Classroom'
  | 'Workshop / Maker Space'
  | 'Study Pod'
  | 'Media Lab';

export interface Room {
  id: string; // Unique primary ID (e.g. "ENG-201")
  name: string;
  building: string;
  location: string;
  capacity: number;
  roomType: RoomType;
  equipment: string[];
  requiresApproval: boolean;
  status: 'active' | 'maintenance';
  description: string;
  floor: number;
}

export type BookingStatus = 'confirmed' | 'pending_approval' | 'cancelled' | 'rejected';

export interface Booking {
  id: string; // Unique primary ID (e.g. "BK-2026-1042")
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM (24-hour)
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'Student' | 'Faculty' | 'Lab Assistant' | 'Admin';
  department: string;
  purpose: string;
  status: BookingStatus;
  requestedEquipment?: string[];
  notes?: string;
  createdAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  recurring?: {
    frequency: 'daily' | 'weekly';
    occurrences: number;
    parentBookingId?: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Faculty' | 'Admin' | 'Lab Assistant';
  department: string;
}

export interface BookingFilter {
  date: string;
  startTime: string;
  endTime: string;
  roomType: string;
  minCapacity: number;
  equipment: string[];
  searchQuery: string;
  building: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  reason?: string;
  suggestedRooms?: Room[];
}
