import type { CalendarCompleteEventData } from './CalendarTypes';

export interface ObserverNotification {
  observer: string;
  status: string;
}

export interface DeleteSingleResult {
  message: string;
  deletedEvent: CalendarCompleteEventData | null;
  notifications: ObserverNotification[];
}

export interface DeleteCascadeResult {
  message: string;
  deletedEvents: CalendarCompleteEventData[];
  notifications: ObserverNotification[];
}