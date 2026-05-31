import type { CalendarCompleteEventData } from './CalendarTypes';

export interface CreateResult {
  event: CalendarCompleteEventData;
}

export interface UpdateResult {
  event: CalendarCompleteEventData;
}

export interface DeleteSingleResult {
  message: string;
  deletedEvent: CalendarCompleteEventData | null;
}

export interface DeleteCascadeResult {
  message: string;
  deletedEvents: CalendarCompleteEventData[];
}