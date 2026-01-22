'use client';

import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

// A simple event emitter to decouple error creation from error handling.
// This allows any component to report a permission error, and a central
// listener can handle displaying it without direct component coupling.

type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// We can't use the built-in EventEmitter type because it's not specific enough.
// We must declare our own interface to get type safety on our events.
declare interface ErrorEventEmitter {
  on<U extends keyof ErrorEvents>(event: U, listener: ErrorEvents[U]): this;
  emit<U extends keyof ErrorEvents>(event: U, ...args: Parameters<ErrorEvents[U]>): boolean;
}

class ErrorEventEmitter extends EventEmitter {}

export const errorEmitter = new ErrorEventEmitter();
