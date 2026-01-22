'use client';

// A rich, contextual error for when a Firestore Security Rule is violated.
// This is intended for development-time debugging, not for production display.

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  public readonly originalError?: Error;

  constructor(context: SecurityRuleContext, originalError?: Error) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(
      context,
      null,
      2
    )}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.originalError = originalError;

    // This is necessary for extending built-in classes like Error in TypeScript.
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
