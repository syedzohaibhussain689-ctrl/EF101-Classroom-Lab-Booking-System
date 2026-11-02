import React, { useState, useMemo } from 'react';
import { useBooking } from '../context/BookingContext.js';
import { Room, BookingFilter, RoomType } from '../types/index.js';
import { filterAndScoreRooms, validateTimeRange } from '../utils/bookingConflict.js';
import { RoomCard } from './RoomCard.js';
import {
  Search,
  Filter,
  Users,
  Calendar,
  Clock,
  Building,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface RoomListViewProps {
  onBookRoom: (room: Room) => void;
  onViewDetails: (room: Room) => void;
  onShowDoorSign: (room: Room) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  selectedStartTime: string;
  setSelectedStartTime: (t: string) => void;
  selectedEndTime: string;
  setSelectedEndTime: (t: string) => void;
}

const COMMON_EQUIPMENT_FILTERS = [
  'GPU Workstations',
  'Fume Hoods',
  'Projectors',
  '3D Printers',
  'Microscopes',
  'Robotic Arm',
  'Whiteboard',
  'Video Conference',
];

export const RoomListView: React.FC<RoomListViewProps> = ({
  onBookRoom,
  onViewDetails,
  onShowDoorSign,
  selectedDate,
  setSelectedDate,
  selectedStartTime,
  setSelectedStartTime,
  selectedEndTime,
  setSelectedEndTime,
}) => {
  const { rooms, bookings } = useBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Validate current date & time range
  const timeValidity = useMemo(() => {
    return validateTimeRange(selectedStartTime, selectedEndTime, selectedDate);
  }, [selectedStartTime, selectedEndTime, selectedDate]);

  // Compute filtered & scored rooms
  const filterParams: Partial<BookingFilter> = {
    date: selectedDate,
    startTime: selectedStartTime,
    endTime: selectedEndTime,
    searchQuery: searchQuery.trim(),
    roomType: selectedRoomType,
    minCapacity,
    building: selectedBuilding,
    equipment: selectedEquipment,
  };

  const processedRooms = useMemo(() => {
    const list = filterAndScoreRooms(rooms, filterParams, bookings);
    if (onlyAvailable) {
      return list.filter((item) => item.isAvailable);
    }
    return list;
  }, [rooms, bookings, filterParams, onlyAvailable]);

  const toggleEquipmentFilter = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoomType('all');
    setMinCapacity(0);
    setSelectedBuilding('all');
    setSelectedEquipment([]);
    setOnlyAvailable(false);
  };

  const availableCount = processedRooms.filter((r) => r.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Search & Reservation Period Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Search query & Time Window selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search Query */}
          <div>
            <label htmlFor="search-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Search Facilities / Equipment
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, code, GPU, fume hood..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="search-date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reservation Date
            </label>
            <input
              id="search-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="search-start" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Start Time
            </label>
            <input
              id="search-start"
              type="time"
              value={selectedStartTime}
              onChange={(e) => setSelectedStartTime(e.target.value)}
              step="900"
              min="07:00"
              max="21:45"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
            />
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="search-end" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              End Time
            </label>
            <input
              id="search-end"
              type="time"
              value={selectedEndTime}
              onChange={(e) => setSelectedEndTime(e.target.value)}
              step="900"
              min="07:15"
              max="22:00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
            />
          </div>
        </div>

        {/* Validation Warning if invalid time */}
        {!timeValidity.isValid && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{timeValidity.error}</span>
          </div>
        )}

        {/* Row 2: Secondary Dropdowns (Room Type, Capacity, Building) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Room Type */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-room-type" className="text-slate-500 font-medium">Type:</label>
              <select
                id="filter-room-type"
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="all">All Room Types</option>
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Computer Lab">Computer Lab</option>
                <option value="Chemistry / Wet Lab">Chemistry / Wet Lab</option>
                <option value="Biology Lab">Biology Lab</option>
                <option value="Physics Lab">Physics Lab</option>
                <option value="Seminar Room">Seminar Room</option>
                <option value="Classroom">Classroom</option>
                <option value="Workshop / Maker Space">Workshop / Maker Space</option>
                <option value="Study Pod">Study Pod</option>
                <option value="Media Lab">Media Lab</option>
              </select>
            </div>

            {/* Min Capacity */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-capacity" className="text-slate-500 font-medium">Min Seats:</label>
              <select
                id="filter-capacity"
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="0">Any Capacity</option>
                <option value="15">15+ Seats</option>
                <option value="30">30+ Seats</option>
                <option value="50">50+ Seats</option>
                <option value="100">100+ Seats</option>
              </select>
            </div>

            {/* Building */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-building" className="text-slate-500 font-medium">Building:</label>
              <select
                id="filter-building"
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="all">All Buildings</option>
                <option value="Engineering Hall">Engineering Hall</option>
                <option value="Science Complex">Science Complex</option>
                <option value="Main Academic Pavilion">Main Academic Pavilion</option>
                <option value="Design & Architecture Wing">Design & Architecture Wing</option>
                <option value="Central Library">Central Library</option>
                <option value="Humanities Center">Humanities Center</option>
                <option value="Creative Arts Center">Creative Arts Center</option>
              </select>
            </div>
          </div>

          {/* Availability only toggle & Clear */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded text-slate-900 focus:ring-0"
              />
              <span>Only Show Available Rooms</span>
            </label>

            {(searchQuery || selectedRoomType !== 'all' || minCapacity > 0 || selectedBuilding !== 'all' || selectedEquipment.length > 0 || onlyAvailable) && (
              <button
                onClick={handleResetFilters}
                className="text-slate-500 hover:text-slate-900 font-medium underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Equipment Filter Tags */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Filter by Equipment:
          </span>
          {COMMON_EQUIPMENT_FILTERS.map((eq) => {
            const isSelected = selectedEquipment.includes(eq);
            return (
              <button
                key={eq}
                type="button"
                onClick={() => toggleEquipmentFilter(eq)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {eq}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          Showing <strong className="font-bold text-slate-900 tabular-nums">{processedRooms.length}</strong> facilities
          {timeValidity.isValid && (
            <span>
              {' '}· <strong className="text-emerald-700 tabular-nums">{availableCount}</strong> available for {selectedStartTime}–{selectedEndTime} on {selectedDate}
            </span>
          )}
        </div>
        <span className="text-slate-400 font-mono text-[11px]">
          EF101 Inventory: 12 Active Demonstration Rooms
        </span>
      </div>

      {/* Rooms Grid */}
      {processedRooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No rooms match your filter criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your capacity, equipment filters, or selected time window.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedRooms.map(({ room, isAvailable, conflictInfo }) => (
            <RoomCard
              key={room.id}
              room={room}
              isAvailable={isAvailable}
              conflictInfo={conflictInfo}
              selectedDate={selectedDate}
              selectedStartTime={selectedStartTime}
              selectedEndTime={selectedEndTime}
              onBook={(r) => onBookRoom(r)}
              onViewDetails={(r) => onViewDetails(r)}
              onShowDoorSign={(r) => onShowDoorSign(r)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
