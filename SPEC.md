# BirdsEye Calendar - Product Specification

## Overview
A frontend-only React application for visualizing long-running events across months and years. Events are displayed as horizontal bars on a grid where the x-axis represents months and the y-axis represents years.

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS (styling)
- date-fns (date utilities)
- zustand (state management)
- LocalStorage (persistence)

## Core Features

### 1. Calendar Grid Visualization
- **X-axis**: Months of the year (1-12)
- **Y-axis**: Years (configurable range, default: current year ± 5 years)
- Grid layout with visible cells for each month-year intersection
- Each cell represents one month in a specific year

### 2. Event System

#### Event Data Model
```typescript
type Event = {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  color: string;     // hex color
}
```

#### Event Display
- Events rendered as horizontal bars overlaying the grid
- Bars span from start date to end date
- Events wrapping across years: split into multiple bars (one per year)
- Each event has a distinct color
- Bars show event name (truncated if needed)

### 3. Event Creation

#### Click to Create
1. User clicks a grid cell
2. Modal opens with:
   - Start date pre-filled with clicked cell's date
   - End date empty (defaults to same as start)
   - Name input (empty)
   - Color picker (random default)

#### Click & Drag to Create
1. User clicks and holds on a cell (start date)
2. Drags to another cell (end date)
3. Visual feedback during drag
4. On release, modal opens with:
   - Start and end dates pre-filled
   - Name input (empty)
   - Color picker (random default)

### 4. Event Modal

**Fields:**
- Event Name (text input, required)
- Start Date (native HTML date input `<input type="date">`)
- End Date (native HTML date input `<input type="date">`)
- Color (native HTML color input `<input type="color">`)

**Actions:**
- Save (validates dates, creates/updates event)
- Delete (only shown when editing existing event)
- Cancel (closes modal without saving)

**Validation:**
- Name must not be empty
- End date must be >= start date

### 5. Event Management

#### Edit Event
- Click on event bar to open modal with current values
- Modify and save

#### Delete Event
- Click event bar, then click Delete in modal

#### Persistence
- All events saved to browser LocalStorage
- Auto-save on create/update/delete
- Load from LocalStorage on app mount

### 6. User Settings & Birthday Feature

#### Settings Modal
- Accessible via gear icon in header
- Allows user to enter their birthday (including year)
- Birthday stored in LocalStorage

#### Age Indicator
- Small badge appears on birth month cells
- Shows age turning that year
- Purple badge in top-right corner of cell
- Only displays in the month of birth

### 7. UI Components

#### CalendarGrid
- Renders year rows and month columns
- Handles click and drag interactions
- Displays all event bars
- Displays age indicators on birth month cells

#### EventBar
- Visual representation of one event (or one segment if multi-year)
- Shows event name and color
- Clickable to edit

#### EventModal
- Form for creating/editing events
- Native HTML inputs (keep simple)

#### SettingsModal
- Form for entering birthday
- Persists to LocalStorage

#### CalendarControls (optional, for future)
- Year range selector
- Zoom controls
- View toggles

## File Structure
```
birdseye-cal/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── SPEC.md (this file)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── Calendar/
    │   │   ├── CalendarGrid.tsx
    │   │   ├── EventBar.tsx
    │   │   └── GridCell.tsx
    │   └── Modal/
    │       ├── EventModal.tsx
    │       └── SettingsModal.tsx
    ├── store/
    │   ├── eventStore.ts
    │   └── userStore.ts
    ├── types/
    │   └── index.ts
    └── utils/
        └── dateHelpers.ts
```

## User Flow

### Creating an Event
1. User clicks or drags on calendar grid
2. Modal appears with date(s) pre-filled
3. User enters event name and optionally adjusts dates/color
4. Click Save
5. Event bar appears on calendar
6. Event saved to LocalStorage

### Editing an Event
1. User clicks event bar
2. Modal appears with current event data
3. User modifies fields
4. Click Save or Delete
5. Calendar updates
6. Changes saved to LocalStorage

## Design Principles
- **Keep it simple**: Use native HTML inputs, no fancy date pickers
- **Visual clarity**: Grid should be easy to read, events clearly visible
- **Responsive**: Works on different screen sizes
- **Performant**: Efficient rendering even with many events
- **Persistent**: Never lose user data (LocalStorage)

## MVP Scope
**Include:**
- Grid visualization (months × years)
- Click to create events
- Click & drag to create events
- Event modal with native inputs
- Edit/delete existing events
- LocalStorage persistence
- Basic styling with Tailwind


## Current Status
- [x] Spec created
- [x] Project initialized
- [x] Dependencies installed
- [x] Types defined
- [x] Store implemented
- [x] Date utilities created
- [x] Calendar grid component
- [x] Event rendering
- [x] Click to create
- [x] Drag to create
- [x] Event modal
- [x] Edit/delete functionality
- [x] Basic styling complete
- [x] MVP complete and running
- [x] Settings modal with birthday input
- [x] Age indicator on birth month cells

## Running the App
```bash
npm install
npm run dev
```

Visit http://localhost:5173 to view the app.