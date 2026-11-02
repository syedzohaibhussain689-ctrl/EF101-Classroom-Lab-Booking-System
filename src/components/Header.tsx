import React from 'react';
import { useBooking } from '../context/BookingContext.js';
import { DEMO_USERS } from '../data/initialData.js';
import { CalendarPlus, UserCheck, Shield, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  currentTab: 'rooms' | 'schedule' | 'my-bookings' | 'admin' | 'architecture';
  setCurrentTab: (tab: 'rooms' | 'schedule' | 'my-bookings' | 'admin' | 'architecture') => void;
  onOpenQuickBook: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenQuickBook,
}) => {
  const { currentUser, setCurrentUser, bookings } = useBooking();

  // Count active bookings for current user
  const userActiveCount = bookings.filter(
    (b) => b.userId === currentUser.id && b.status !== 'cancelled' && b.status !== 'rejected'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('rooms')}
              className="flex items-center gap-2 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
                EF
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                  ReserveDesk
                </span>
                <span className="text-[11px] text-slate-500 font-mono tracking-tight leading-none">
                  EF101-P07 · Campus System
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line, unboxed, hover underlines) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentTab('rooms')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'rooms'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Classrooms & Labs
            </button>
            <button
              onClick={() => setCurrentTab('schedule')}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'schedule'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setCurrentTab('my-bookings')}
              className={`relative transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'my-bookings'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              My Bookings
              {userActiveCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-slate-100 text-slate-700 rounded font-mono tabular-nums">
                  {userActiveCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'admin'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
            <button
              onClick={() => setCurrentTab('architecture')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'architecture'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>System & Tests</span>
            </button>
          </nav>

          {/* Zone 3: Profile Switcher & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User Profile Switcher */}
            <div className="relative flex items-center">
              <label htmlFor="user-select" className="sr-only">
                Switch User
              </label>
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  id="user-select"
                  value={currentUser.id}
                  onChange={(e) => {
                    const found = DEMO_USERS.find((u) => u.id === e.target.value);
                    if (found) setCurrentUser(found);
                  }}
                  className="bg-transparent text-slate-800 font-medium cursor-pointer focus:outline-none max-w-[140px] truncate"
                >
                  {DEMO_USERS.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onOpenQuickBook}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>New Reservation</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar for narrow screens */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-4 border-t border-slate-100 text-xs font-medium text-slate-600 scrollbar-none">
          <button
            onClick={() => setCurrentTab('rooms')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              currentTab === 'rooms' ? 'bg-slate-900 text-white font-semibold' : ''
            }`}
          >
            Classrooms & Labs
          </button>
          <button
            onClick={() => setCurrentTab('schedule')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              currentTab === 'schedule' ? 'bg-slate-900 text-white font-semibold' : ''
            }`}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => setCurrentTab('my-bookings')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              currentTab === 'my-bookings' ? 'bg-slate-900 text-white font-semibold' : ''
            }`}
          >
            My Bookings ({userActiveCount})
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              currentTab === 'admin' ? 'bg-slate-900 text-white font-semibold' : ''
            }`}
          >
            Admin Console
          </button>
          <button
            onClick={() => setCurrentTab('architecture')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              currentTab === 'architecture' ? 'bg-slate-900 text-white font-semibold' : ''
            }`}
          >
            System & Tests
          </button>
        </div>
      </div>
    </header>
  );
};
