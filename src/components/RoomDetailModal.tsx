import React from 'react';
import { Room } from '../types/index.js';
import { useBooking } from '../context/BookingContext.js';
import {
  X,
  MapPin,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onBook: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onBook,
}) => {
  const { bookings } = useBooking();

  if (!room) return null;

  // Get upcoming active bookings for this room
  const roomBookings = bookings
    .filter(
      (b) =>
        b.roomId === room.id &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected'
    )
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-detail-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {room.id}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {room.roomType}
              </span>
              {room.requiresApproval && (
                <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                  Approval Required
                </span>
              )}
            </div>
            <h2 id="room-detail-title" className="text-xl font-bold text-slate-900 mt-1">
              {room.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Seating Capacity
              </span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {room.capacity} seats
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Building & Floor
              </span>
              <span className="text-sm font-bold text-slate-900 truncate block">
                Floor {room.floor}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Room Category
              </span>
              <span className="text-sm font-bold text-slate-900 truncate block">
                {room.roomType}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Operating Status
              </span>
              <span className="text-sm font-bold text-emerald-700 block">
                {room.status === 'active' ? 'Active & Ready' : 'Maintenance'}
              </span>
            </div>
          </div>

          {/* Location & Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Location & Specifications
            </h4>
            <p className="text-sm text-slate-800 font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {room.location}
            </p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {room.description}
            </p>
          </div>

          {/* Complete Equipment List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              Standard Equipment & Laboratory Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {room.equipment.map((eq, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>{eq}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Schedule for this room */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Upcoming Scheduled Reservations
            </h4>
            {roomBookings.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                No active bookings scheduled for this room. Wide open availability!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {roomBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{b.date}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-slate-700 tabular-nums">
                          {b.startTime} - {b.endTime}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 font-medium">{b.purpose}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-500 block">{b.userName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{b.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onBook(room);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reserve This Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};
