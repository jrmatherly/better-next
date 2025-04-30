/**
 * Types for monitoring dashboard components (charts, date ranges, metrics, etc.)
 */

/**
 * DateRange type for calendar and historical data selection
 * Re-exported from react-day-picker for strict compatibility
 * @see https://react-day-picker.js.org/api/DateRange
 */
export type { DateRange } from 'react-day-picker';

/**
 * Handler for calendar date range selection
 */
export type OnSelectDateRangeHandler = (value: DateRange | undefined) => void;

/**
 * Metric data shape for historical charts
 */
export interface HistoricalMetric {
  date: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  errors: number;
  requests: number;
  responseTime: number;
}
