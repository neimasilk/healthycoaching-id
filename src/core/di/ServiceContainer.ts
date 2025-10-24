/**
 * ServiceContainer
 * Central place to register application services.
 * Currently provides a lightweight registry to unblock bootstrapping.
 */

type ServiceRegistry = Map<string, unknown>;

const registry: ServiceRegistry = new Map();
let initialized = false;

export const setupServices = (): void => {
  if (initialized) {
    return;
  }

  // Register foundational services here when they become available.
  registry.set('config', {
    version: '1.0.0',
    platform: 'healthycoaching-id',
  });

  initialized = true;
};

export const getService = <T>(key: string): T | undefined => registry.get(key) as T | undefined;

