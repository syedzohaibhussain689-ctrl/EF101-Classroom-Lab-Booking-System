import React, { useState } from 'react';
import { Room } from '../types/index.js';
import { useBooking } from '../context/BookingContext.js';
import {
  X,
  QrCode,
  Users,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  DoorOpen,
} from 'lucide-react';

interface RoomDoorDisplayModalProps {
  room: Room | null;
  onClose: () => void;
  onOpenBookingModal: (room: Room) => void;
}

export const RoomDoorDisplayModal: React.FC<RoomDoorDisplayModalProps> = ({
  room,
  onClose,
  onOpenBookingModal,
}) => {
  const { bookings, createBooking } = useBooking();
  const [quickBookSuccess, setQuickBookSuccess] = useState(false);

  if (!room) return null;

  // Simulate current time as 2026-11-09 at 10:15 AM
  const simulatedToday = '2026-11-09';
  const simulatedCurrentTime = '10:15';

  // Find active booking right now
  const currentBooking = bookings.find(
    (b) =>
      b.roomId === room.id &&
      b.date === simulatedToday &&
      b.status !== 'cancelled' &&
      b.status !== 'rejected' &&
      b.startTime <= simulatedCurrentTime &&
      b.endTime > simulatedCurrentTime
  );

  // Find next upcoming booking today
  const nextBooking = bookings
    .filter(
      (b) =>
        b.roomId === room.id &&
        b.date === simulatedToday &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected' &&
        b.startTime > simulatedCurrentTime
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  const handleInstantWalkIn = () => {
    // Walk-in booking from 10:15 to 11:00 (or up to next booking start)
    const endT = nextBooking ? nextBooking.startTime : '11:00';
    const res = createBooking({
      roomId: room.id,
      date: simulatedToday,
      startTime: simulatedCurrentTime,
      endTime: endT,
      purpose: 'Instant Ad-Hoc Lab Walk-in Session',
    });
    if (res.success) {
      setQuickBookSuccess(true);
      setTimeout(() => setQuickBookSuccess(false), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="door-tablet-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full text-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Tablet Top Bezel */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">
              Interactive Room Signage Tablet
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close tablet view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tablet Screen Area */}
        <div className="p-7 space-y-6">
          {/* Room Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-slate-800 text-slate-200 text-xs font-mono font-bold rounded">
                  {room.id}
                </span>
                <span className="text-xs text-slate-400">{room.roomType}</span>
              </div>
              <h3 id="door-tablet-title" className="text-2xl font-bold tracking-tight text-white">
                {room.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {room.location} · {room.capacity} seats max
              </p>
            </div>

            {/* Live Clock on Tablet */}
            <div className="text-right font-mono">
              <span className="text-2xl font-bold tabular-nums text-slate-100">
                {simulatedCurrentTime}
              </span>
              <span className="block text-[11px] text-slate-400">
                Mon, 9 Nov 2026
              </span>
            </div>
          </div>

          {/* Status Display Banner */}
          {currentBooking ? (
            <div className="p-5 rounded-2xl bg-amber-950/60 border border-amber-600/60 text-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Currently In Use (Occupied)
                </span>
                <span className="text-xs font-mono tabular-nums text-amber-300">
                  Until {currentBooking.endTime}
                </span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">
                  {currentBooking.purpose}
                </h4>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  Reserved by {currentBooking.userName} ({currentBooking.department})
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Available For Use
                </span>
                <span className="text-xs text-emerald-300">
                  {nextBooking
                    ? `Next reservation at ${nextBooking.startTime}`
                    : 'Free for the rest of today'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                This room is unoccupied. You can scan the QR code to reserve or press the instant walk-in button.
              </p>
            </div>
          )}

          {/* QR Code and Quick Walk-in strip */}
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-5">
            {/* SVG QR Code Simulation */}
            <div className="bg-white p-3 rounded-xl shrink-0 shadow-inner flex flex-col items-center">
              <svg width="100" height="100" viewBox="0 0 100 100" className="shape-rendering-crispEdges">
                {/* Simulated QR matrix pattern */}
                <rect x="0" y="0" width="30" height="30" fill="#0f172a" />
                <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                <rect x="10" y="10" width="10" height="10" fill="#0f172a" />

                <rect x="70" y="0" width="30" height="30" fill="#0f172a" />
                <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                <rect x="80" y="10" width="10" height="10" fill="#0f172a" />

                <rect x="0" y="70" width="30" height="30" fill="#0f172a" />
                <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                <rect x="10" y="80" width="10" height="10" fill="#0f172a" />

                <rect x="35" y="15" width="10" height="10" fill="#0f172a" />
                <rect x="50" y="20" width="10" height="15" fill="#0f172a" />
                <rect x="20" y="45" width="15" height="10" fill="#0f172a" />
                <rect x="45" y="45" width="15" height="15" fill="#0f172a" />
                <rect x="65" y="40" width="10" height="25" fill="#0f172a" />
                <rect x="80" y="75" width="15" height="15" fill="#0f172a" />
                <rect x="40" y="70" width="10" height="20" fill="#0f172a" />
                <rect x="60" y="75" width="10" height="10" fill="#0f172a" />
              </svg>
              <span className="text-[9px] font-mono font-bold text-slate-800 mt-1">
                SCAN TO BOOK
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-slate-200">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span>Instant Mobile Reservation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan with any smartphone camera outside the door to verify real-time availability and confirm an immediate booking without paper slips.
              </p>
              {!currentBooking && (
                <button
                  onClick={handleInstantWalkIn}
                  className="mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  {quickBookSuccess ? 'Walk-in Confirmed!' : 'Book Walk-in Session Now'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tablet Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            EF101 Campus Display System · v2026.11
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenBookingModal(room);
            }}
            className="px-4 py-2 bg-white text-slate-950 font-semibold text-xs rounded-lg hover:bg-slate-200 transition-colors"
          >
            Open Full Reservation Form
          </button>
        </div>
      </div>
    </div>
  );
};
