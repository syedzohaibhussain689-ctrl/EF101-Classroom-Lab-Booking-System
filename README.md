# EF101-P07: Classroom & Laboratory Booking System

**ReserveDesk** is an automated university facility information system built to coordinate, reserve, and manage classrooms and specialized laboratories while preventing schedule conflicts and double-booking.

Developed for **EF-101 Fall 2026: System Understanding Projects (Project ID: EF101-P07)**.

---

## Key Features

- **12 Demonstration Facilities**: Covering Computer Labs, Chemistry / Wet Labs, Biology Labs, Physics Labs, Lecture Halls, Workshop / MakerSpaces, Seminar Rooms, Classrooms, Study Pods, and Media Labs.
- **Pre-Commit Conflict Prevention**: Mathematical interval intersection algorithm `(CandidateStart < ExistingEnd) && (CandidateEnd > ExistingStart)` prevents double-booking before database persistence.
- **Interactive Daily & Weekly Schedules**:
  - **Daily Master Timetable Grid**: 12-hour timeline (08:00–20:00) with click-to-book vacant slots.
  - **7-Day Weekly Grid**: Multi-day schedule breakdown across Monday to Sunday.
- **Smart Alternative Room Recommendations**: When a facility is occupied, the system suggests alternative facilities of comparable capacity available during that exact window.
- **Full Cancellation & Slot Release**: Cancel reservations with an audit reason; freed slots immediately become available for others.
- **Facilities Administrator Console**: Add/edit demonstration rooms, modify equipment, toggle maintenance status, and audit global reservations.
- **Role Switcher & Approval Workflow**: Switch between Student, Faculty, Lab Assistant, and Admin roles. Restricted labs require supervisor approval for student reservations.
- **Recurring Bookings**: Reserve slots on daily or weekly repeating frequencies.
- **Digital Room Signage Tablet & QR Code**: Exterior digital door signage simulator with real-time countdown and quick walk-in reservation QR code.
- **Interactive System Architecture & ERD**: Explains Room-User-Booking relational schemas, Primary/Foreign keys, and ACID transaction concurrency.
- **Automated Verification Suite**: 5-step interactive verification suite matching the EF101 testing requirements.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons
- **Build Tool**: Vite
- **Testing**: Node.js native test runner (`node:test`, `node:assert/strict`) with `tsx`
- **State & Storage**: React Context with LocalStorage persistence

---

## Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Run automated unit tests
```bash
npx --yes tsx --test src/utils/bookingConflict.test.ts
```

---

## Entity-Relationship Model (ERD)

```
[ROOM] (PK: id) 1 ──────── N [BOOKING] (PK: id, FK: room_id, FK: user_id)
                             │
[USER] (PK: id) 1 ───────────┘
```

---

## License

Apache-2.0
