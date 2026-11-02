import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext.js';
import { Room, RoomType, Booking } from '../types/index.js';
import {
  Shield,
  Plus,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Users,
  Building,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Ban,
  Clock,
  Layers,
} from 'lucide-react';

const ROOM_TYPES: RoomType[] = [
  'Lecture Hall',
  'Computer Lab',
  'Chemistry / Wet Lab',
  'Biology Lab',
  'Physics Lab',
  'Seminar Room',
  'Classroom',
  'Workshop / Maker Space',
  'Study Pod',
  'Media Lab',
];

export const AdminConsole: React.FC = () => {
  const {
    rooms,
    bookings,
    addRoom,
    updateRoom,
    approveBooking,
    rejectBooking,
    cancelBooking,
    resetToDemoData,
  } = useBooking();

  const [activeAdminTab, setActiveAdminTab] = useState<'rooms' | 'bookings'>('rooms');
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');

  // Form states for New / Edit Room
  const [roomFormId, setRoomFormId] = useState('');
  const [roomFormName, setRoomFormName] = useState('');
  const [roomFormBuilding, setRoomFormBuilding] = useState('Engineering Hall');
  const [roomFormLocation, setRoomFormLocation] = useState('');
  const [roomFormCapacity, setRoomFormCapacity] = useState(30);
  const [roomFormType, setRoomFormType] = useState<RoomType>('Classroom');
  const [roomFormEquipment, setRoomFormEquipment] = useState('');
  const [roomFormRequiresApproval, setRoomFormRequiresApproval] = useState(false);
  const [roomFormStatus, setRoomFormStatus] = useState<'active' | 'maintenance'>('active');
  const [roomFormDescription, setRoomFormDescription] = useState('');
  const [roomFormFloor, setRoomFormFloor] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  // Stats
  const pendingApprovalsCount = bookings.filter((b) => b.status === 'pending_approval').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'maintenance').length;

  const handleOpenAdd = () => {
    setRoomFormId('');
    setRoomFormName('');
    setRoomFormBuilding('Engineering Hall');
    setRoomFormLocation('');
    setRoomFormCapacity(30);
    setRoomFormType('Classroom');
    setRoomFormEquipment('Projector, Whiteboard, High-Speed Wi-Fi');
    setRoomFormRequiresApproval(false);
    setRoomFormStatus('active');
    setRoomFormDescription('');
    setRoomFormFloor(1);
    setFormError(null);
    setIsAddRoomOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setRoomFormId(room.id);
    setRoomFormName(room.name);
    setRoomFormBuilding(room.building);
    setRoomFormLocation(room.location);
    setRoomFormCapacity(room.capacity);
    setRoomFormType(room.roomType);
    setRoomFormEquipment(room.equipment.join(', '));
    setRoomFormRequiresApproval(room.requiresApproval);
    setRoomFormStatus(room.status);
    setRoomFormDescription(room.description);
    setRoomFormFloor(room.floor);
    setFormError(null);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const equipmentArray = roomFormEquipment
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingRoom) {
      // Update
      const res = updateRoom(editingRoom.id, {
        name: roomFormName,
        building: roomFormBuilding,
        location: roomFormLocation,
        capacity: Number(roomFormCapacity),
        roomType: roomFormType,
        equipment: equipmentArray,
        requiresApproval: roomFormRequiresApproval,
        status: roomFormStatus,
        description: roomFormDescription,
        floor: Number(roomFormFloor),
      });

      if (res.success) {
        setEditingRoom(null);
      } else {
        setFormError(res.error || 'Failed to update room.');
      }
    } else {
      // Add
      const res = addRoom({
        id: roomFormId.toUpperCase().trim(),
        name: roomFormName.trim(),
        building: roomFormBuilding,
        location: roomFormLocation.trim(),
        capacity: Number(roomFormCapacity),
        roomType: roomFormType,
        equipment: equipmentArray,
        requiresApproval: roomFormRequiresApproval,
        status: roomFormStatus,
        description: roomFormDescription.trim(),
        floor: Number(roomFormFloor),
      });

      if (res.success) {
        setIsAddRoomOpen(false);
      } else {
        setFormError(res.error || 'Failed to add room.');
      }
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilterStatus !== 'all' && b.status !== bookingFilterStatus) return false;
    if (bookingSearch) {
      const q = bookingSearch.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.roomId.toLowerCase().includes(q) ||
        b.purpose.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 bg-slate-900 text-white rounded">
              <Shield className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Campus Facilities Administration Console
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            System Control & Audit Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure classrooms/labs inventory, review schedule approvals, and inspect persistent booking logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDemoData}
            className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title="Reset dataset to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Facilities
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
            {rooms.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Reservations
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
            {bookings.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Pending Lab Approvals
          </span>
          <span className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1 block">
            {pendingApprovalsCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Under Maintenance
          </span>
          <span className="text-2xl font-bold text-slate-700 font-mono tabular-nums mt-1 block">
            {maintenanceCount}
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveAdminTab('rooms')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeAdminTab === 'rooms'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Room & Lab Inventory ({rooms.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('bookings')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors relative ${
            activeAdminTab === 'bookings'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Global Bookings Audit ({bookings.length})
          {pendingApprovalsCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded-full font-bold">
              {pendingApprovalsCount} pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Rooms Inventory Table */}
      {activeAdminTab === 'rooms' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Room ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Building & Floor</th>
                  <th className="py-3 px-4 text-right">Capacity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Approval</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {room.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {room.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {room.roomType}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {room.building} · Fl {room.floor}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800 tabular-nums">
                      {room.capacity}
                    </td>
                    <td className="py-3 px-4">
                      {room.status === 'active' ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Maintenance
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {room.requiresApproval ? (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                          Required
                        </span>
                      ) : (
                        <span className="text-slate-400">Direct</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(room)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Global Bookings Audit */}
      {activeAdminTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4">
          {/* Search & filter row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search ID, requester, room..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={bookingFilterStatus}
                onChange={(e) => setBookingFilterStatus(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Room</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Requester</th>
                  <th className="py-3 px-3">Purpose</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {b.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {b.roomId}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap tabular-nums">
                      {b.date} · {b.startTime}-{b.endTime}
                    </td>
                    <td className="py-3 px-3 text-slate-800 whitespace-nowrap">
                      <span className="font-medium block">{b.userName}</span>
                      <span className="text-[10px] text-slate-400 block">{b.userRole} · {b.department}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs truncate" title={b.purpose}>
                      {b.purpose}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {b.status === 'confirmed' ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Confirmed
                        </span>
                      ) : b.status === 'pending_approval' ? (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending Approval
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {b.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {b.status === 'pending_approval' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => approveBooking(b.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectBooking(b.id, 'Schedule constraint / safety restriction')}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => cancelBooking(b.id, 'Cancelled by facilities administrator')}
                          className="px-2 py-1 text-slate-500 hover:text-rose-600 text-[11px] font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Room */}
      {(isAddRoomOpen || editingRoom) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRoom ? `Edit Room ${editingRoom.id}` : 'Register New Demonstration Room'}
              </h3>
              <button
                onClick={() => {
                  setIsAddRoomOpen(false);
                  setEditingRoom(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="form-room-id" className="block font-semibold text-slate-700 mb-1">
                    Room Unique ID *
                  </label>
                  <input
                    type="text"
                    id="form-room-id"
                    value={roomFormId}
                    onChange={(e) => setRoomFormId(e.target.value)}
                    disabled={!!editingRoom}
                    placeholder="e.g. ENG-405"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900 font-mono disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="form-room-name" className="block font-semibold text-slate-700 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    id="form-room-name"
                    value={roomFormName}
                    onChange={(e) => setRoomFormName(e.target.value)}
                    placeholder="e.g. Quantum Computing Lab"
                    className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="form-room-type" className="block font-semibold text-slate-700 mb-1">
                    Room Type *
                  </label>
                  <select
                    id="form-room-type"
                    value={roomFormType}
                    onChange={(e) => setRoomFormType(e.target.value as RoomType)}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="form-room-cap" className="block font-semibold text-slate-700 mb-1">
                    Capacity (Seats) *
                  </label>
                  <input
                    type="number"
                    id="form-room-cap"
                    min="1"
                    max="500"
                    value={roomFormCapacity}
                    onChange={(e) => setRoomFormCapacity(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="form-room-status" className="block font-semibold text-slate-700 mb-1">
                    Operating Status *
                  </label>
                  <select
                    id="form-room-status"
                    value={roomFormStatus}
                    onChange={(e) => setRoomFormStatus(e.target.value as 'active' | 'maintenance')}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                  >
                    <option value="active">Active & Open</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="form-room-building" className="block font-semibold text-slate-700 mb-1">
                    Building *
                  </label>
                  <input
                    type="text"
                    id="form-room-building"
                    value={roomFormBuilding}
                    onChange={(e) => setRoomFormBuilding(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="form-room-floor" className="block font-semibold text-slate-700 mb-1">
                    Floor Level *
                  </label>
                  <input
                    type="number"
                    id="form-room-floor"
                    min="0"
                    max="10"
                    value={roomFormFloor}
                    onChange={(e) => setRoomFormFloor(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 tabular-nums"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="form-room-loc" className="block font-semibold text-slate-700 mb-1">
                  Location String *
                </label>
                <input
                  type="text"
                  id="form-room-loc"
                  value={roomFormLocation}
                  onChange={(e) => setRoomFormLocation(e.target.value)}
                  placeholder="e.g. Engineering Hall, Floor 4, Suite 405"
                  className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="form-room-eq" className="block font-semibold text-slate-700 mb-1">
                  Equipment / Features (Comma-separated)
                </label>
                <input
                  type="text"
                  id="form-room-eq"
                  value={roomFormEquipment}
                  onChange={(e) => setRoomFormEquipment(e.target.value)}
                  placeholder="Dual 4K Projectors, Smart Whiteboard, Audio System"
                  className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="form-room-desc" className="block font-semibold text-slate-700 mb-1">
                  Room Description
                </label>
                <textarea
                  id="form-room-desc"
                  rows={2}
                  value={roomFormDescription}
                  onChange={(e) => setRoomFormDescription(e.target.value)}
                  placeholder="Brief summary of room capabilities..."
                  className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="form-room-approval"
                  checked={roomFormRequiresApproval}
                  onChange={(e) => setRoomFormRequiresApproval(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="form-room-approval" className="font-medium text-slate-800">
                  Require Faculty / Lab Manager approval for student reservations
                </label>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold">
                  {formError}
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRoomOpen(false);
                    setEditingRoom(null);
                  }}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition-colors"
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
