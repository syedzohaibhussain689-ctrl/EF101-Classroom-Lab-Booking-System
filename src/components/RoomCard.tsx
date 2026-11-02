import React from 'react';
import { Room, ConflictCheckResult } from '../types/index.js';
import {
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface RoomCardProps {
  room: Room;
  isAvailable: boolean;
  conflictInfo?: ConflictCheckResult;
  selectedDate?: string;
  selectedStartTime?: string;
  selectedEndTime?: string;
  onBook: (room: Room) => void;
  onViewDetails: (room: Room) => void;
  onShowDoorSign: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isAvailable,
  conflictInfo,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onBook,
  onViewDetails,
  onShowDoorSign,
}) => {
  const isMaintenance = room.status === 'maintenance';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Card Header & Primary Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {room.id}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {room.roomType}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
              {room.name}
            </h3>
          </div>

          {/* Status Flag */}
          {isMaintenance ? (
            <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold rounded shrink-0">
              Maintenance
            </span>
          ) : selectedStartTime && selectedEndTime ? (
            isAvailable ? (
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Available
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold rounded flex items-center gap-1 shrink-0">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Occupied
              </span>
            )
          ) : (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded shrink-0">
              Floor {room.floor}
            </span>
          )}
        </div>

        {/* Location & Capacity */}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[190px]">{room.location}</span>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-900 tabular-nums">{room.capacity}</span> seats
          </span>
        </div>

        {/* Description snippet */}
        <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {room.description}
        </p>

        {/* Equipment Badges (Subtle unboxed tags) */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
            Key Features & Equipment
          </span>
          <div className="flex flex-wrap gap-1.5">
            {room.equipment.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-slate-50 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded font-normal"
              >
                {item}
              </span>
            ))}
            {room.equipment.length > 3 && (
              <span className="text-[11px] text-slate-400 self-center pl-1 font-mono">
                +{room.equipment.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Conflict Warning if filter is occupied */}
        {!isAvailable && conflictInfo?.reason && (
          <div className="mt-3 p-2 bg-amber-50/80 border border-amber-200 rounded text-[11px] text-amber-900 leading-tight">
            <strong>Conflict:</strong> {conflictInfo.reason}
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetails(room)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors"
          >
            Details
          </button>
          <button
            onClick={() => onShowDoorSign(room)}
            className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors flex items-center gap-1"
            title="Open digital door tablet & QR code view"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Door Sign</span>
          </button>
        </div>

        <button
          onClick={() => onBook(room)}
          disabled={isMaintenance}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Reserve</span>
        </button>
      </div>
    </div>
  );
};
