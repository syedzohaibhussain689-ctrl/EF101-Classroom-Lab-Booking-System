import React from 'react';
import { useBooking } from '../context/BookingContext.js';
import {
  Database,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
  Server,
  FileCode,
  Sparkles,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const { runAutomatedTestSuite, testResults, isTesting, resetToDemoData } = useBooking();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 bg-slate-900 text-white rounded">
              <Database className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              EF101 System Understanding Project
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Information System Architecture & Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Database relationships, transaction concurrency models, and the automated 5-step EF101 test suite.
          </p>
        </div>

        {/* Run Tests CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDemoData}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Reset Test State
          </button>
          <button
            onClick={() => runAutomatedTestSuite()}
            disabled={isTesting}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isTesting ? 'Executing Tests...' : 'Run Automated Test Suite'}</span>
          </button>
        </div>
      </div>

      {/* Test Suite Results Runner */}
      {testResults && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Automated Test Execution Results
              </span>
              <span className="text-xs text-slate-500">
                (EF101 Assignment Verification Suite)
              </span>
            </div>
            {(() => {
              const passed = testResults.filter((r) => r.status === 'passed').length;
              const total = testResults.length;
              const isAll = passed === total;
              return (
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    isAll
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}
                >
                  {passed} of {total} Passed ({Math.round((passed / total) * 100)}%)
                </span>
              );
            })()}
          </div>

          <div className="divide-y divide-slate-100 p-2">
            {testResults.map((item, idx) => (
              <div key={idx} className="p-4 flex items-start gap-3.5 hover:bg-slate-50/70 transition-colors rounded-lg">
                {item.status === 'passed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1.5 bg-slate-100/70 p-2 rounded border border-slate-200/60 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relational Database Model Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Entity-Relationship Model (ERD)
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Database Schema & Primary/Foreign Key Relationships
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            The booking information system eliminates physical schedule conflicts by modeling rooms, users, and reservations as normalized relational entities with enforced referential integrity.
          </p>
        </div>

        {/* 3 Entity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Room Entity */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-mono text-xs font-bold text-slate-900">ROOM</span>
              <span className="text-[11px] font-mono text-slate-500">PK: id</span>
            </div>
            <div className="space-y-1 font-mono text-xs text-slate-700">
              <div className="flex justify-between py-0.5">
                <span className="font-bold text-indigo-700">id (PK)</span>
                <span className="text-slate-400">VARCHAR(20)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>name</span>
                <span className="text-slate-400">VARCHAR(100)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>room_type</span>
                <span className="text-slate-400">VARCHAR(50)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>location</span>
                <span className="text-slate-400">VARCHAR(120)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>capacity</span>
                <span className="text-slate-400">INT NOT NULL</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>equipment</span>
                <span className="text-slate-400">JSON / TEXT[]</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>status</span>
                <span className="text-slate-400">VARCHAR(20)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              1 Room has <strong>0..N</strong> Bookings
            </div>
          </div>

          {/* Booking Entity (Central Association) */}
          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-white">BOOKING</span>
              <span className="text-[11px] font-mono text-indigo-300">Central Relation</span>
            </div>
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <div className="flex justify-between py-0.5">
                <span className="font-bold text-emerald-400">id (PK)</span>
                <span className="text-slate-500">VARCHAR(32)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-semibold text-indigo-300">room_id (FK)</span>
                <span className="text-slate-500">→ ROOM.id</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-semibold text-indigo-300">user_id (FK)</span>
                <span className="text-slate-500">→ USER.id</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>date</span>
                <span className="text-slate-500">DATE</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>start_time</span>
                <span className="text-slate-500">TIME</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>end_time</span>
                <span className="text-slate-500">TIME</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>purpose</span>
                <span className="text-slate-500">TEXT</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>status</span>
                <span className="text-slate-500">VARCHAR(20)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Unique constraint: <code>(room_id, date, time_range)</code>
            </div>
          </div>

          {/* User Entity */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-mono text-xs font-bold text-slate-900">USER</span>
              <span className="text-[11px] font-mono text-slate-500">PK: id</span>
            </div>
            <div className="space-y-1 font-mono text-xs text-slate-700">
              <div className="flex justify-between py-0.5">
                <span className="font-bold text-indigo-700">id (PK)</span>
                <span className="text-slate-400">VARCHAR(20)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>name</span>
                <span className="text-slate-400">VARCHAR(80)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>email</span>
                <span className="text-slate-400">VARCHAR(120)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>role</span>
                <span className="text-slate-400">ENUM</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>department</span>
                <span className="text-slate-400">VARCHAR(80)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              1 User has <strong>0..N</strong> Bookings
            </div>
          </div>
        </div>
      </div>

      {/* Theoretical Core: Conflict Checking & Transaction Concurrency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
            Theoretical Concept #1
          </span>
          <h4 className="text-base font-bold text-slate-900">
            Why Conflict Checking Must Occur Before Saving
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            In a manual system, two people might write their name on a paper schedule sign-up sheet simultaneously, or a teacher might occupy a room assuming it is free.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            In an automated information system, <strong>atomic validation before persistence</strong> guarantees schedule integrity:
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
            <span className="text-slate-500">// Overlap Condition Test:</span>
            <div className="font-bold text-slate-900">
              (CandidateStart &lt; ExistingEnd) &amp;&amp; (CandidateEnd &gt; ExistingStart)
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Without pre-commit validation, race conditions would permit two conflicting records with overlapping time ranges to be committed to the database simultaneously.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
            Theoretical Concept #2
          </span>
          <h4 className="text-base font-bold text-slate-900">
            Transaction Concept &amp; ACID Properties
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            A database transaction bundles multiple operations into a single logical unit of work that either completely succeeds or leaves the database unchanged:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>
              <strong>Atomicity:</strong> All-or-nothing execution. Recurring bookings either reserve all requested dates or abort without partial writes.
            </li>
            <li>
              <strong>Consistency:</strong> The database transitions only between valid states conforming to unique ID constraints and time boundaries.
            </li>
            <li>
              <strong>Isolation:</strong> Concurrent booking attempts do not interfere with each other through pessimistic row locking or serializable isolation.
            </li>
            <li>
              <strong>Durability:</strong> Once confirmed, the booking state persists permanently even through system reboots.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
