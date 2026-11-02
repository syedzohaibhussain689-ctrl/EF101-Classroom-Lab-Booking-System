import React, { useState, useEffect, useMemo } from 'react';
import { useBooking } from '../context/BookingContext.js';
import { Room } from '../types/index.js';
import {
  checkBookingConflict,
  validateTimeRange,
  timeToMinutes,
} from '../utils/bookingConflict.js';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Repeat,
  Sparkles,
  Info,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRoomId?: string;
  preselectedDate?: string;
  preselectedStartTime?: string;
  preselectedEndTime?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedRoomId,
  preselectedDate,
  preselectedStartTime,
  preselectedEndTime,
}) => {
  const { rooms, bookings, currentUser, createBooking } = useBooking();

  // Reference date fallback (November 9, 2026 or current date)
  const defaultDate = preselectedDate || '2026-11-09';
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    preselectedRoomId || (rooms[0] ? rooms[0].id : '')
  );
  const [date, setDate] = useState<string>(defaultDate);
  const [startTime, setStartTime] = useState<string>(preselectedStartTime || '10:00');
  const [endTime, setEndTime] = useState<string>(preselectedEndTime || '12:00');
  const [purpose, setPurpose] = useState<string>('');
  const [department, setDepartment] = useState<string>(currentUser.department);
  const [notes, setNotes] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Recurring options
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [recurringOccurrences, setRecurringOccurrences] = useState<number>(4);

  // Error and submission state
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedRoomId) setSelectedRoomId(preselectedRoomId);
    if (preselectedDate) setDate(preselectedDate);
    if (preselectedStartTime) setStartTime(preselectedStartTime);
    if (preselectedEndTime) setEndTime(preselectedEndTime);
  }, [preselectedRoomId, preselectedDate, preselectedStartTime, preselectedEndTime, isOpen]);

  useEffect(() => {
    setDepartment(currentUser.department);
  }, [currentUser]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId);
  }, [rooms, selectedRoomId]);

  // Real-time conflict validation calculation
  const conflictAssessment = useMemo(() => {
    if (!selectedRoomId || !date || !startTime || !endTime) return null;

    const timeValidation = validateTimeRange(startTime, endTime, date);
    if (!timeValidation.isValid) {
      return {
        isValid: false,
        error: timeValidation.error,
        hasConflict: false,
      };
    }

    const conflict = checkBookingConflict(
      {
        roomId: selectedRoomId,
        date,
        startTime,
        endTime,
      },
      bookings,
      rooms
    );

    return {
      isValid: true,
      hasConflict: conflict.hasConflict,
      conflictDetails: conflict,
    };
  }, [selectedRoomId, date, startTime, endTime, bookings, rooms]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!purpose.trim()) {
      setFormError('Please describe the purpose of the reservation.');
      return;
    }

    setIsSubmitting(true);
    const result = createBooking({
      roomId: selectedRoomId,
      date,
      startTime,
      endTime,
      purpose: purpose.trim(),
      requestedEquipment: selectedEquipment,
      notes: notes.trim() || undefined,
      isRecurring,
      recurringFrequency,
      recurringOccurrences,
    });

    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setFormError(result.error || 'Failed to complete reservation.');
    }
  };

  const handleToggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="booking-modal-title" className="text-lg font-bold text-slate-900">
              Reserve Classroom or Laboratory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict conflict checking prevents double-booking across all campus facilities.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Room Selection */}
          <div>
            <label htmlFor="room-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Facility / Room *
            </label>
            <select
              id="room-select"
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setSelectedEquipment([]);
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              required
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id} disabled={room.status === 'maintenance'}>
                  {room.id} — {room.name} ({room.roomType}, Cap: {room.capacity} seats)
                  {room.status === 'maintenance' ? ' [MAINTENANCE]' : ''}
                </option>
              ))}
            </select>

            {/* Selected Room Metadata Strip */}
            {selectedRoom && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="flex items-center gap-1 font-medium text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {selectedRoom.location}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  Capacity: <strong className="font-semibold text-slate-900 tabular-nums">{selectedRoom.capacity}</strong>
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Type: {selectedRoom.roomType}</span>
                {selectedRoom.requiresApproval && (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                    Restricted Lab (Supervisor Approval Required)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Date & Time Range Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label htmlFor="booking-date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="booking-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="booking-start-time" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                id="booking-start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step="900"
                min="07:00"
                max="21:45"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none tabular-nums"
                required
              />
            </div>

            <div>
              <label htmlFor="booking-end-time" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                id="booking-end-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                step="900"
                min="07:15"
                max="22:00"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none tabular-nums"
                required
              />
            </div>
          </div>

          {/* Real-time Conflict Assessment Indicator */}
          {conflictAssessment && (
            <div className="transition-all">
              {!conflictAssessment.isValid ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Invalid Time Range:</span>
                    <span>{conflictAssessment.error}</span>
                  </div>
                </div>
              ) : conflictAssessment.hasConflict ? (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-sm text-amber-950">
                        Schedule Conflict Detected — Room Unavailable
                      </span>
                      <p className="mt-0.5 text-amber-800">
                        {conflictAssessment.conflictDetails?.reason}
                      </p>
                    </div>
                  </div>

                  {/* Suggest available alternative rooms */}
                  {conflictAssessment.conflictDetails?.suggestedRooms &&
                    conflictAssessment.conflictDetails.suggestedRooms.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-amber-200/80">
                        <span className="font-medium text-amber-950 block mb-1">
                          Available Alternative Rooms at {startTime} – {endTime}:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {conflictAssessment.conflictDetails.suggestedRooms.map((altRoom) => (
                            <button
                              key={altRoom.id}
                              type="button"
                              onClick={() => setSelectedRoomId(altRoom.id)}
                              className="px-2.5 py-1 bg-white border border-amber-300 rounded text-xs font-semibold text-slate-800 hover:bg-amber-100 transition-colors flex items-center gap-1"
                            >
                              <span>Switch to {altRoom.id} ({altRoom.name.split(' ')[0]})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Slot Available:</strong> {selectedRoom?.name} is free on {date} from {startTime} to {endTime}.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Requester & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="requester-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Requester *
              </label>
              <input
                type="text"
                id="requester-name"
                value={`${currentUser.name} (${currentUser.role})`}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="department-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department / Program *
              </label>
              <input
                type="text"
                id="department-name"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="booking-purpose" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reservation Purpose *
            </label>
            <input
              type="text"
              id="booking-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. CS401 Autonomous Agents Practical Session / Thesis Review"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              required
            />
          </div>

          {/* Equipment Selection (Bonus Feature) */}
          {selectedRoom && selectedRoom.equipment.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Request Dedicated In-Room Equipment (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRoom.equipment.map((eq) => {
                  const isChecked = selectedEquipment.includes(eq);
                  return (
                    <label
                      key={eq}
                      className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEquipment(eq)}
                        className="mt-0.5 rounded text-slate-900 focus:ring-0"
                      />
                      <span className="leading-tight">{eq}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recurring Booking Extension (Bonus Feature) */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label htmlFor="recurring-toggle" className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <Repeat className="w-3.5 h-3.5 text-slate-600" />
                <span>Repeat Reservation (Bonus Feature: Recurring Schedule)</span>
              </label>
              <input
                type="checkbox"
                id="recurring-toggle"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
              />
            </div>

            {isRecurring && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="recurring-freq" className="block text-[11px] font-medium text-slate-600 mb-1">
                    Frequency
                  </label>
                  <select
                    id="recurring-freq"
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value as 'daily' | 'weekly')}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs text-slate-900"
                  >
                    <option value="weekly">Weekly (Same day each week)</option>
                    <option value="daily">Daily (Consecutive days)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="recurring-count" className="block text-[11px] font-medium text-slate-600 mb-1">
                    Number of Occurrences
                  </label>
                  <input
                    type="number"
                    id="recurring-count"
                    min="2"
                    max="8"
                    value={recurringOccurrences}
                    onChange={(e) => setRecurringOccurrences(Math.max(2, Math.min(8, Number(e.target.value))))}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs text-slate-900 tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="booking-notes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Additional Notes / Setup Requests
            </label>
            <textarea
              id="booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Need podium key or specific software loaded"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 font-medium">
              {formError}
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (conflictAssessment !== null && (!conflictAssessment.isValid || conflictAssessment.hasConflict))
              }
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
