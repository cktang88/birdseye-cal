# BirdsEye Calendar

A frontend-only React application for visualizing long-running events across months and years. Events are displayed as horizontal bars on a grid where the x-axis represents months and the y-axis represents years.

## Features
- Visualize events across months and years
- Click to create events
- Click & drag to create events
- Edit/delete existing events
- Settings modal with birthday input
- Age indicator on birth month cells
- LocalStorage persistence
- Ability to add multiple calendars + switch between them + rename/delete/clone calendars

![Calendar View](./image.png)

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS (styling)
- date-fns (date utilities)
- zustand (state management)
- LocalStorage (persistence)