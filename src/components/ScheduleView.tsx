import React, { useState, useMemo } from 'react';
import { useBooking } from '../context/BookingContext.js';
import { Room, Booking } from '../types/index.js';
import { timeToMinutes, minutesToTime } from '../utils/bookingConflict.js';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  User,
  Plus,
  Info,
  Layers,
} from 'lucide-react';

interface ScheduleViewProps {
  onOpenBookingWithSlot: (roomId: string, date: string, startTime: string, endTime: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenBookingWithSlot }) => {
  const { rooms, bookings } = useBooking();

  // Current selected reference date (default to 2026-11-09, the submission week date from assignment)
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-09');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  // Time grid configuration: 08:00 to 20:00 (12 hours)
  const START_HOUR = 8;
  const END_HOUR = 20;
  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      list.push(h);
    }
    return list;
  }, []);

  // Calculate the 7 days of the current week around selectedDate
  const weekDays = useMemo(() => {
    const current = new Date(`${selectedDate}T00:00:00`);
    const dayOfWeek = current.getDay(); // 0 is Sunday, 1 is Monday
    // Calculate Monday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(current);
    monday.setDate(current.getDate() - distanceToMonday);

    const days: { dateStr: string; label: string; dayName: string; isSelected: boolean }[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const str = d.toISOString().split('T')[0];
      days.push({
        dateStr: str,
        label: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        dayName: dayNames[i],
        isSelected: str === selectedDate,
      });
    }
    return days;
  }, [selectedDate]);

  // Handle navigating days
  const handleShiftDay = (delta: number) => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleShiftWeek = (delta: number) => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + delta * 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filtered rooms to display
  const displayedRooms = useMemo(() => {
    if (selectedRoomFilter === 'all') return rooms;
    return rooms.filter((r) => r.id === selectedRoomFilter);
  }, [rooms, selectedRoomFilter]);

  // Bookings on selectedDate for Daily View
  const dailyBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.date === selectedDate &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected'
    );
  }, [bookings, selectedDate]);

  // Format a date string into readable heading
  const readableDate = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => (viewMode === 'daily' ? handleShiftDay(-1) : handleShiftWeek(-1))}
              className="p-1.5 text-slate-700 hover:bg-white rounded hover:shadow-xs transition-all"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate('2026-11-09')}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Assignment Week
            </button>
            <button
              onClick={() => (viewMode === 'daily' ? handleShiftDay(1) : handleShiftWeek(1))}
              className="p-1.5 text-slate-700 hover:bg-white rounded hover:shadow-xs transition-all"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
            />
            <span className="hidden sm:inline text-xs font-semibold text-slate-900">
              {readableDate}
            </span>
          </div>
        </div>

        {/* View mode toggle & room filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Room filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="schedule-room-filter" className="text-xs text-slate-500 font-medium hidden sm:inline">
              Room:
            </label>
            <select
              id="schedule-room-filter"
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="all">All Rooms ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Segmented View Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Timeline Grid
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Day Weekly Grid
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Daily Timeline Matrix */}
      {viewMode === 'daily' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Daily Master Timetable
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                Click any vacant cell to quick-reserve that slot. Click any reserved block to inspect details.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-slate-900"></span> Confirmed
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-amber-500"></span> Pending Approval
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header row with hours */}
              <div className="grid grid-cols-[220px_repeat(12,1fr)] border-b border-slate-200 bg-slate-100/70 text-[11px] font-semibold text-slate-600 font-mono">
                <div className="p-3 border-r border-slate-200 font-sans text-slate-900">
                  Room / Facility
                </div>
                {hours.slice(0, 12).map((hour) => (
                  <div
                    key={hour}
                    className="p-2.5 text-center border-r border-slate-200/80 last:border-r-0"
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Room Rows */}
              <div className="divide-y divide-slate-100">
                {displayedRooms.map((room) => {
                  const roomBookingsToday = dailyBookings.filter((b) => b.roomId === room.id);

                  return (
                    <div
                      key={room.id}
                      className="grid grid-cols-[220px_repeat(12,1fr)] hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Left Room Info Column */}
                      <div className="p-3 border-r border-slate-200 bg-slate-50/40 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {room.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({room.capacity} seats)
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-700 truncate block mt-0.5" title={room.name}>
                          {room.name}
                        </span>
                      </div>

                      {/* 12 Hourly Grid Cells */}
                      {hours.slice(0, 12).map((hour) => {
                        const slotStartTime = `${hour.toString().padStart(2, '0')}:00`;
                        const slotEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
                        const slotStartMin = hour * 60;
                        const slotEndMin = (hour + 1) * 60;

                        // Check if this slot intersects any booking
                        const activeBooking = roomBookingsToday.find((b) => {
                          const bStart = timeToMinutes(b.startTime);
                          const bEnd = timeToMinutes(b.endTime);
                          return slotStartMin < bEnd && slotEndMin > bStart;
                        });

                        return (
                          <div
                            key={hour}
                            className="relative h-14 border-r border-slate-100 last:border-r-0 p-1 flex items-center justify-center"
                          >
                            {activeBooking ? (
                              <button
                                type="button"
                                onClick={() => setSelectedBookingForDetails(activeBooking)}
                                className={`w-full h-full rounded p-1.5 text-left text-white shadow-xs transition-transform hover:scale-[1.02] flex flex-col justify-between overflow-hidden cursor-pointer ${
                                  activeBooking.status === 'pending_approval'
                                    ? 'bg-amber-600 hover:bg-amber-700'
                                    : 'bg-slate-900 hover:bg-slate-800'
                                }`}
                              >
                                <span className="text-[10px] font-bold truncate leading-tight block">
                                  {activeBooking.purpose}
                                </span>
                                <span className="text-[9px] font-mono tabular-nums opacity-80 truncate block">
                                  {activeBooking.startTime} - {activeBooking.endTime}
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenBookingWithSlot(
                                    room.id,
                                    selectedDate,
                                    slotStartTime,
                                    slotEndTime
                                  )
                                }
                                disabled={room.status === 'maintenance'}
                                className="w-full h-full rounded border border-dashed border-transparent hover:border-slate-300 hover:bg-slate-100/70 text-slate-300 hover:text-slate-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title={`Reserve ${room.id} at ${slotStartTime} - ${slotEndTime}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: 7-Day Weekly Grid */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              7-Day Weekly Schedule Grid
            </span>
            <span className="text-xs text-slate-500">
              Showing reservations across all 7 days of the active week.
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[950px] grid grid-cols-7 divide-x divide-slate-200">
              {weekDays.map((day) => {
                // Bookings on this day
                const dayBookings = bookings.filter(
                  (b) =>
                    b.date === day.dateStr &&
                    b.status !== 'cancelled' &&
                    b.status !== 'rejected' &&
                    (selectedRoomFilter === 'all' || b.roomId === selectedRoomFilter)
                ).sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div key={day.dateStr} className="min-h-[500px] flex flex-col bg-white">
                    {/* Day Column Header */}
                    <div
                      className={`p-3 text-center border-b border-slate-200 ${
                        day.isSelected ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold block uppercase tracking-wide">
                        {day.dayName}
                      </span>
                      <span className={`text-[11px] font-mono ${day.isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {day.label}
                      </span>
                    </div>

                    {/* Day Bookings List */}
                    <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                      {dayBookings.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-400 text-xs">
                          <span>No bookings</span>
                          <button
                            onClick={() =>
                              onOpenBookingWithSlot(
                                selectedRoomFilter !== 'all' ? selectedRoomFilter : rooms[0].id,
                                day.dateStr,
                                '10:00',
                                '12:00'
                              )
                            }
                            className="mt-2 text-[11px] text-slate-700 hover:text-slate-950 underline font-medium"
                          >
                            + Reserve Slot
                          </button>
                        </div>
                      ) : (
                        dayBookings.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBookingForDetails(b)}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs shadow-2xs hover:shadow-sm transition-all ${
                              b.status === 'pending_approval'
                                ? 'bg-amber-50 border-amber-200 text-amber-950'
                                : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {b.roomId}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                                {b.startTime} - {b.endTime}
                              </span>
                            </div>
                            <h5 className="font-semibold text-slate-900 line-clamp-2 leading-tight">
                              {b.purpose}
                            </h5>
                            <span className="text-[10px] text-slate-500 block mt-1 truncate">
                              {b.userName}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Dialog (when clicked on schedule) */}
      {selectedBookingForDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                  {selectedBookingForDetails.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                  {selectedBookingForDetails.purpose}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Facility:</span>
                <span className="font-semibold text-slate-900">{selectedBookingForDetails.roomName} ({selectedBookingForDetails.roomId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {selectedBookingForDetails.date} · {selectedBookingForDetails.startTime} - {selectedBookingForDetails.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requester:</span>
                <span className="font-semibold text-slate-900">{selectedBookingForDetails.userName} ({selectedBookingForDetails.userRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span>{selectedBookingForDetails.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold capitalize text-slate-900">{selectedBookingForDetails.status}</span>
              </div>
              {selectedBookingForDetails.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Notes:</span>
                  <p className="italic text-slate-600">{selectedBookingForDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
