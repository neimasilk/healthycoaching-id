/**
 * Mock AsyncStorage for Jest
 * Location: tests/mockAsyncStorage.js
 */

if (typeof global.localStorage === 'undefined') {
  const storage = new Map();
  global.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
    clear: () => storage.clear(),
  };
}

module.exports = {};
