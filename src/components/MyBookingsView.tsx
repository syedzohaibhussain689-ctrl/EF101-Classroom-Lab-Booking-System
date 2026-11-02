import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext.js';
import { Booking } from '../types/index.js';
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Printer,
  Ban,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface MyBookingsViewProps {
  onOpenNewBooking: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({ onOpenNewBooking }) => {
  const { bookings, currentUser, cancelBooking } = useBooking();

  const [filterMode, setFilterMode] = useState<'active' | 'all' | 'cancelled'>('active');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Schedule changed / no longer required');

  // Filter bookings belonging to the currently selected user profile
  const userBookings = bookings.filter((b) => b.userId === currentUser.id);

  const displayedBookings = userBookings.filter((b) => {
    if (filterMode === 'active') return b.status === 'confirmed' || b.status === 'pending_approval';
    if (filterMode === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
    return true;
  });

  const handleConfirmCancel = () => {
    if (!cancellingBookingId) return;
    cancelBooking(cancellingBookingId, cancellationReason);
    setCancellingBookingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              {currentUser.id}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {currentUser.role} · {currentUser.department}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Reservations for {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your scheduled classroom and laboratory sessions. Cancelled reservations instantly free up slots for campus colleagues.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 self-stretch sm:self-auto">
          <button
            onClick={() => setFilterMode('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              filterMode === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({userBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending_approval').length})
          </button>
          <button
            onClick={() => setFilterMode('cancelled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              filterMode === 'cancelled'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled ({userBookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected').length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All History ({userBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {displayedBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No {filterMode} reservations found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            You do not currently have any {filterMode} bookings under this profile. Reserve a classroom or lab in seconds.
          </p>
          <button
            onClick={onOpenNewBooking}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Create New Reservation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedBookings.map((booking) => {
            const isCancelled = booking.status === 'cancelled' || booking.status === 'rejected';
            const isPending = booking.status === 'pending_approval';

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-xl border p-5 shadow-2xs transition-all ${
                  isCancelled
                    ? 'border-slate-200 opacity-60 bg-slate-50/50'
                    : isPending
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left Metadata Block */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {booking.id}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        {booking.roomId}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-bold text-slate-800">
                        {booking.roomName}
                      </span>

                      {/* Status indicator */}
                      {isCancelled ? (
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.2 rounded border border-rose-200">
                          Cancelled
                        </span>
                      ) : isPending ? (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                          Pending Approval
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                          Confirmed Active
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {booking.purpose}
                    </h4>

                    {/* Date and Time Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {booking.date}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums font-semibold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {booking.startTime} – {booking.endTime}
                      </span>
                      {booking.recurring && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-[11px] text-indigo-700 font-medium">
                            Recurring ({booking.recurring.frequency})
                          </span>
                        </>
                      )}
                    </div>

                    {/* Equipment requested */}
                    {booking.requestedEquipment && booking.requestedEquipment.length > 0 && (
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="font-medium text-slate-600">Requested Equipment:</span>
                        {booking.requestedEquipment.map((eq, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                            {eq}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Cancellation reason if cancelled */}
                    {isCancelled && booking.cancellationReason && (
                      <p className="text-xs text-rose-700 italic pt-1">
                        Reason: {booking.cancellationReason}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!isCancelled && (
                      <button
                        onClick={() => setCancellingBookingId(booking.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancellingBookingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Cancel Reservation {cancellingBookingId}?
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Cancelling this reservation will immediately release the time slot on the public schedule, allowing other professors, researchers, or students to book this facility.
            </p>

            <div>
              <label htmlFor="cancel-reason" className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation (Required for campus audit log)
              </label>
              <select
                id="cancel-reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
              >
                <option value="Class / session postponed or cancelled">
                  Class / session postponed or cancelled
                </option>
                <option value="Moved to another laboratory or online">
                  Moved to another laboratory or online
                </option>
                <option value="Schedule conflict with student exam">
                  Schedule conflict with student exam
                </option>
                <option value="Equipment repair or maintenance required">
                  Equipment repair or maintenance required
                </option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingBookingId(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
