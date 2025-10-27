/**
 * Grid dimension constants for the calendar
 * These values should be used consistently across all components
 */

// Cell dimensions (in pixels)
export const CELL_WIDTH_PX = 128; // 2x original width for better visibility
export const CELL_HEIGHT_PX = 100; // Optimized height for event visibility
export const CELL_GAP_PX = 0; // No gap between month cells

// Combined width for positioning calculations (cell + gap)
export const CELL_TOTAL_WIDTH_PX = CELL_WIDTH_PX + CELL_GAP_PX; // 128px

// Event bar dimensions
export const LANE_HEIGHT_PX = 120; // Height for event lanes (divided by number of overlapping events, supports up to 6)
export const LANE_TOP_OFFSET_PX = 4; // Top padding before first lane

// Color palette for events (Apple Calendar inspired colors - lighter/pastel versions)
export const EVENT_COLORS = [
  '#FFB3B0', // Red (soft red)
  '#FFD699', // Orange (peach)
  '#FFE799', // Yellow (butter yellow)
  '#A8E6B8', // Green (mint green)
  '#91D4E8', // Cyan (turquoise - balanced blue-green)
  '#A8D5FF', // Sky Blue (distinct light blue)
  '#91B3FA', // Blue (periwinkle - more saturated)
  '#C4C2F0', // Indigo (lavender)
  '#E0B3F0', // Purple (lilac)
  '#FFB3C9', // Pink (cotton candy)
  '#D4C4B3', // Brown (tan)
  '#C2C9D1', // Gray (soft slate - neutral, distinct from all colors)
] as const;

// Year label dimensions
export const YEAR_LABEL_WIDTH_PX = 64; // w-16 = 4rem = 64px

// Tailwind class equivalents (for reference)
// w-32 = 128px = CELL_WIDTH_PX
// h-25 = 100px = CELL_HEIGHT_PX
// CELL_GAP_PX = 0px (no gap)
// w-16 = 64px = YEAR_LABEL_WIDTH_PX

