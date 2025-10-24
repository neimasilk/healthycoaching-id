/**
 * setupErrorReporting
 * Stub for integrating Crashlytics/Sentry later.
 */

export const configureErrorReporting = (): void => {
  // Integrate monitoring provider here when ready.
  if (__DEV__) {
    console.info('[ErrorReporting] Development mode active, no remote reporting configured.');
  }
};

configureErrorReporting();

