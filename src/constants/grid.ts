/**
 * Grid dimension constants for the calendar
 * These values should be used consistently across all components
 */

// Cell dimensions (in pixels)
export const CELL_WIDTH_PX = 48;
export const CELL_HEIGHT_PX = 48;
export const CELL_GAP_PX = 4;

// Combined width for positioning calculations (cell + gap)
export const CELL_TOTAL_WIDTH_PX = CELL_WIDTH_PX + CELL_GAP_PX; // 52px

// Event bar dimensions
export const LANE_HEIGHT_PX = 10; // Height of each event lane
export const LANE_TOP_OFFSET_PX = 4; // Top padding before first lane

// Year label dimensions
export const YEAR_LABEL_WIDTH_PX = 64; // w-16 = 4rem = 64px

// Tailwind class equivalents (for reference)
// w-12 = 48px = CELL_WIDTH_PX
// h-12 = 48px = CELL_HEIGHT_PX
// gap-1 = 4px = CELL_GAP_PX
// w-16 = 64px = YEAR_LABEL_WIDTH_PX

