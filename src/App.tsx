import React, { useState } from 'react';
import { BookingProvider } from './context/BookingContext.js';
import { Header } from './components/Header.js';
import { RoomListView } from './components/RoomListView.js';
import { ScheduleView } from './components/ScheduleView.js';
import { MyBookingsView } from './components/MyBookingsView.js';
import { AdminConsole } from './components/AdminConsole.js';
import { ArchitectureView } from './components/ArchitectureView.js';
import { BookingModal } from './components/BookingModal.js';
import { RoomDetailModal } from './components/RoomDetailModal.js';
import { RoomDoorDisplayModal } from './components/RoomDoorDisplayModal.js';
import { NotificationToast } from './components/NotificationToast.js';
import { Room } from './types/index.js';

export function AppContent() {
  const [currentTab, setCurrentTab] = useState<
    'rooms' | 'schedule' | 'my-bookings' | 'admin' | 'architecture'
  >('rooms');

  // Filter state shared across rooms and modals
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-09');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('10:00');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('12:00');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | undefined>(undefined);
  const [preselectedSlot, setPreselectedSlot] = useState<{
    date?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  const [detailRoom, setDetailRoom] = useState<Room | null>(null);
  const [doorSignRoom, setDoorSignRoom] = useState<Room | null>(null);

  const handleOpenQuickBook = () => {
    setPreselectedRoomId(undefined);
    setPreselectedSlot({
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
    });
    setIsBookingModalOpen(true);
  };

  const handleBookRoom = (room: Room) => {
    setPreselectedRoomId(room.id);
    setPreselectedSlot({
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
    });
    setIsBookingModalOpen(true);
  };

  const handleScheduleSlotClick = (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    setPreselectedRoomId(roomId);
    setPreselectedSlot({ date, startTime, endTime });
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Header strictly obeying the 3-Zone Contract */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenQuickBook={handleOpenQuickBook}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'rooms' && (
          <RoomListView
            onBookRoom={handleBookRoom}
            onViewDetails={(room) => setDetailRoom(room)}
            onShowDoorSign={(room) => setDoorSignRoom(room)}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedStartTime={selectedStartTime}
            setSelectedStartTime={setSelectedStartTime}
            selectedEndTime={selectedEndTime}
            setSelectedEndTime={setSelectedEndTime}
          />
        )}

        {currentTab === 'schedule' && (
          <ScheduleView onOpenBookingWithSlot={handleScheduleSlotClick} />
        )}

        {currentTab === 'my-bookings' && (
          <MyBookingsView onOpenNewBooking={handleOpenQuickBook} />
        )}

        {currentTab === 'admin' && <AdminConsole />}

        {currentTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Modals & Overlays */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedRoomId={preselectedRoomId}
        preselectedDate={preselectedSlot.date || selectedDate}
        preselectedStartTime={preselectedSlot.startTime || selectedStartTime}
        preselectedEndTime={preselectedSlot.endTime || selectedEndTime}
      />

      <RoomDetailModal
        room={detailRoom}
        onClose={() => setDetailRoom(null)}
        onBook={(room) => handleBookRoom(room)}
      />

      <RoomDoorDisplayModal
        room={doorSignRoom}
        onClose={() => setDoorSignRoom(null)}
        onOpenBookingModal={(room) => handleBookRoom(room)}
      />

      {/* Notification Toast system */}
      <NotificationToast />

      {/* Academic Project Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              EF101-P07: Classroom/Laboratory Booking System
            </span>
            <span>·</span>
            <span>Fall 2026 Submission</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Double-Booking Prevention</span>
            <span>·</span>
            <span>Relational Schema Integrity</span>
            <span>·</span>
            <span>Persistent History</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <AppContent />
    </BookingProvider>
  );
}
