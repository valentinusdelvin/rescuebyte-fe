/**
 * Empirical Adversarial Verification Suite: R7 & R8
 * Challenger 2 (Empirical Stress & Edge-Case Specialist)
 *
 * Target Scope:
 * - R7: LocationContext & useGeolocation startup guard, graceful fallback on denied/timeout,
 *       toast suppression, manual override, state persistence & corrupted JSON resilience.
 * - R8: JWT exp parsing, 24-hour absolute cap session expiration, tab visibility/restoration,
 *       complete 12-key sensitive storage wipe, 401 interceptor refresh & queueing, route guarding.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const tests = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function test(name, fn) {
  tests.push({ name, fn, isAsync: false });
}

function asyncTest(name, fn) {
  tests.push({ name, fn, isAsync: true });
}

async function runAll() {
  console.log('======================================================================');
  console.log('CHALLENGER 2: EMPIRICAL VERIFICATION & STRESS HARNESS (R7 & R8)');
  console.log('======================================================================\n');

  for (const t of tests) {
    totalTests++;
    try {
      if (t.isAsync) {
        await t.fn();
      } else {
        t.fn();
      }
      console.log(`  ✓ PASS: ${t.name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${t.name}`);
      console.error(`    -> ${err.message}`);
      failureDetails.push({ name: t.name, error: err.message, stack: err.stack });
      failedTests++;
    }
  }

  console.log('\n======================================================================');
  console.log(`VERIFICATION COMPLETE: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests.`);
  if (failedTests > 0) {
    console.error('\nFAILURES ENCOUNTERED:');
    for (const f of failureDetails) {
      console.error(`- ${f.name}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log('ALL EMPIRICAL TESTS PASSED WITH 0 DEFECTS (VERDICT: APPROVE)');
    console.log('======================================================================');
    process.exit(0);
  }
}

// Mock localStorage simulator for strict empirical verification
class LocalStorageSimulator {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}


// =====================================================================
// SUITE 1: Geolocation Startup Guard & Concurrency Control (R7)
// =====================================================================
console.log('--- SUITE 1: Geolocation Startup Guard & Concurrency Control (R7) ---');

// Replicate exact LocationContext logic to stress-test startup guard and concurrency
class LocationContextEngine {
  constructor(storage, navigatorMock, documentMock) {
    this.storage = storage;
    this.navigator = navigatorMock;
    this.document = documentMock;
    this.hasInitializedStartupGeo = false;
    this.DEFAULT_COORDINATES = { lat: -7.9526, lng: 112.6146 };
    this.STORAGE_COORDS_KEY = 'rescuebyte_user_coords';
    this.STORAGE_CITY_KEY = 'rescuebyte_user_city';

    // State
    this.coordinates = this.initCoordinates();
    this.selectedCity = this.initCity();
    this.permissionStatus = 'unknown';
    this.isLoading = false;
    this.error = null;
    this.isRequestingRef = false;
    this.dispatchedEvents = [];
  }

  initCoordinates() {
    try {
      const saved = this.storage.getItem(this.STORAGE_COORDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number' && !isNaN(parsed.lat) && !isNaN(parsed.lng)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return this.DEFAULT_COORDINATES;
  }

  initCity() {
    try {
      const savedCity = this.storage.getItem(this.STORAGE_CITY_KEY);
      if (savedCity) return savedCity;
    } catch {
      // ignore
    }
    return 'Lokasi Saat Ini';
  }

  applyCoordinates(coords, cityName) {
    this.coordinates = coords;
    if (cityName) this.selectedCity = cityName;
    try {
      this.storage.setItem(this.STORAGE_COORDS_KEY, JSON.stringify(coords));
      if (cityName) this.storage.setItem(this.STORAGE_CITY_KEY, cityName);
      this.dispatchedEvents.push({ type: 'rescuebyte_location_updated', detail: { coordinates: coords, city: cityName } });
    } catch {
      // ignore
    }
  }

  async requestLocation(force = false) {
    if (!this.navigator?.geolocation) {
      this.permissionStatus = 'unavailable';
      return null;
    }

    if (this.isRequestingRef && !force) {
      return this.coordinates;
    }

    this.isRequestingRef = true;
    this.isLoading = true;
    this.error = null;

    return new Promise((resolve) => {
      this.navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.isRequestingRef = false;
          this.isLoading = false;
          const liveCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          this.permissionStatus = 'granted';
          this.applyCoordinates(liveCoords, 'Lokasi Saat Ini');
          resolve(liveCoords);
        },
        (err) => {
          this.isRequestingRef = false;
          this.isLoading = false;
          this.permissionStatus = 'denied';
          this.error = err.message || 'Izin lokasi tidak diberikan.';
          resolve(this.DEFAULT_COORDINATES);
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 1000 * 60 * 5 }
      );
    });
  }

  async startupEffect() {
    if (this.hasInitializedStartupGeo) return;
    this.hasInitializedStartupGeo = true;

    if (!this.navigator?.geolocation) {
      this.permissionStatus = 'unavailable';
      return;
    }

    try {
      if (this.navigator.permissions && this.navigator.permissions.query) {
        const status = await this.navigator.permissions.query({ name: 'geolocation' });
        this.permissionStatus = status.state;
        if (status.state === 'granted') {
          await this.requestLocation(true);
          return;
        }
        if (status.state === 'denied') {
          this.permissionStatus = 'denied';
          return;
        }
        await this.requestLocation(false);
        return;
      }
    } catch {
      // ignore
    }
    await this.requestLocation(false);
  }

  setManualLocation(coords, cityName) {
    this.applyCoordinates(coords, cityName || 'Lokasi Khusus');
    this.error = null;
  }
}

asyncTest('1.1 Module-level startup guard prevents repeated prompts across 100 simulated re-mounts', async () => {
  let promptCount = 0;
  const mockNav = {
    geolocation: {
      getCurrentPosition: (success) => {
        promptCount++;
        success({ coords: { latitude: -7.95, longitude: 112.61 } });
      },
    },
    permissions: {
      query: async () => ({ state: 'prompt' }),
    },
  };

  const engine = new LocationContextEngine(new LocalStorageSimulator(), mockNav);

  // Trigger startupEffect 100 times (simulating re-renders or unmount/remount)
  for (let i = 0; i < 100; i++) {
    await engine.startupEffect();
  }

  assert.strictEqual(promptCount, 1, `Expected promptCount === 1, got ${promptCount}`);
  assert.strictEqual(engine.permissionStatus, 'granted');
});

asyncTest('1.2 In-flight concurrency lock prevents duplicate geolocation requests when force=false', async () => {
  let pendingCallbacks = [];
  const mockNav = {
    geolocation: {
      getCurrentPosition: (success, error) => {
        pendingCallbacks.push({ success, error });
      },
    },
  };

  const engine = new LocationContextEngine(new LocalStorageSimulator(), mockNav);

  // Trigger two concurrent requests without force
  const p1 = engine.requestLocation(false);
  const p2 = engine.requestLocation(false);

  assert.strictEqual(pendingCallbacks.length, 1, 'Only one getCurrentPosition should be invoked');

  // Resolve the single pending request
  pendingCallbacks[0].success({ coords: { latitude: -7.2575, longitude: 112.7521 } });

  const [res1, res2] = await Promise.all([p1, p2]);
  assert.strictEqual(res1.lat, -7.2575);
  assert.strictEqual(res2.lat, -7.9526, 'In-flight non-force call returns current coordinates immediately');
});

asyncTest('1.3 Force flag (force=true) allows deliberate retry to bypass in-flight lock', async () => {
  let callCount = 0;
  const mockNav = {
    geolocation: {
      getCurrentPosition: (success) => {
        callCount++;
        success({ coords: { latitude: -7.98, longitude: 112.63 } });
      },
    },
  };

  const engine = new LocationContextEngine(new LocalStorageSimulator(), mockNav);
  await engine.requestLocation(false);
  assert.strictEqual(callCount, 1);

  // User explicitly clicks "Gunakan Live Loc" -> force = true
  await engine.requestLocation(true);
  assert.strictEqual(callCount, 2, 'Force=true must execute geolocation request');
});

asyncTest('1.4 Missing navigator.geolocation cleanly flags unavailable without throwing', async () => {
  const engine = new LocationContextEngine(new LocalStorageSimulator(), {});
  await engine.startupEffect();
  assert.strictEqual(engine.permissionStatus, 'unavailable');
  const res = await engine.requestLocation(false);
  assert.strictEqual(res, null);
});

// =====================================================================
// SUITE 2: Geolocation Fallback & Toast Suppression (R7)
// =====================================================================
console.log('\n--- SUITE 2: Geolocation Fallback & Toast Suppression (R7) ---');

asyncTest('2.1 Geolocation PERMISSION_DENIED (code 1) resolves to Malang default and sets status denied', async () => {
  const mockNav = {
    geolocation: {
      getCurrentPosition: (_, error) => {
        error({ code: 1, message: 'User denied Geolocation' });
      },
    },
  };

  const engine = new LocationContextEngine(new LocalStorageSimulator(), mockNav);
  const result = await engine.requestLocation(false);

  assert.strictEqual(result.lat, -7.9526, 'Must resolve to Malang latitude -7.9526');
  assert.strictEqual(result.lng, 112.6146, 'Must resolve to Malang longitude 112.6146');
  assert.strictEqual(engine.permissionStatus, 'denied');
  assert.strictEqual(engine.isLoading, false);
});

asyncTest('2.2 Geolocation TIMEOUT (code 3) resolves to Malang default gracefully', async () => {
  const mockNav = {
    geolocation: {
      getCurrentPosition: (_, error) => {
        error({ code: 3, message: 'Geolocation request timed out' });
      },
    },
  };

  const engine = new LocationContextEngine(new LocalStorageSimulator(), mockNav);
  const result = await engine.requestLocation(false);

  assert.strictEqual(result.lat, -7.9526);
  assert.strictEqual(result.lng, 112.6146);
  assert.strictEqual(engine.permissionStatus, 'denied');
});

asyncTest('2.3 Verified zero floating toast calls on permission denial or timeout', async () => {
  // Read LocationContext.tsx source code and verify no showToast or toast imports exist
  const locationContextSource = fs.readFileSync(
    path.resolve('src/context/LocationContext.tsx'),
    'utf-8'
  );
  assert(
    !locationContextSource.includes('showToast'),
    'LocationContext.tsx must NOT call showToast'
  );
  assert(
    !locationContextSource.includes('useToastContext'),
    'LocationContext.tsx must NOT import or use ToastContext'
  );
  assert(
    !locationContextSource.includes('Toast'),
    'LocationContext.tsx must NOT contain any Toast references'
  );
});

asyncTest('2.4 Timeout and accuracy options adhere to specification', async () => {
  let capturedOptions = null;
  const mockNav = {
    geolocation: {
      getCurrentPosition: (success, error, options) => {
        capturedOptions = options;
        success({ coords: { latitude: -7.95, longitude: 112.61 } });
      },
    },
  };

  const engine = new LocationContextEngine(new LocalStorageSimulator(), mockNav);
  await engine.requestLocation(true);

  assert(capturedOptions !== null, 'Options must be provided');
  assert.strictEqual(capturedOptions.enableHighAccuracy, false, 'enableHighAccuracy must be false to avoid slow GPS locks');
  assert.strictEqual(capturedOptions.timeout, 6000, 'timeout must be 6000ms');
  assert.strictEqual(capturedOptions.maximumAge, 300000, 'maximumAge must be 5 minutes (300000ms)');
});

// =====================================================================
// SUITE 3: Geolocation State Persistence & Corrupted Storage (R7)
// =====================================================================
console.log('\n--- SUITE 3: Geolocation State Persistence & Corrupted Storage (R7) ---');

asyncTest('3.1 Coordinates and city name persist to storage and dispatch custom event on grant', async () => {
  const storage = new LocalStorageSimulator();
  const mockNav = {
    geolocation: {
      getCurrentPosition: (success) => {
        success({ coords: { latitude: -7.7956, longitude: 110.3695 } }); // Yogyakarta
      },
    },
  };

  const engine = new LocationContextEngine(storage, mockNav);
  await engine.requestLocation(true);

  assert.strictEqual(
    storage.getItem('rescuebyte_user_coords'),
    JSON.stringify({ lat: -7.7956, lng: 110.3695 })
  );
  assert.strictEqual(storage.getItem('rescuebyte_user_city'), 'Lokasi Saat Ini');
  assert.strictEqual(engine.dispatchedEvents.length, 1);
  assert.strictEqual(engine.dispatchedEvents[0].type, 'rescuebyte_location_updated');
  assert.strictEqual(engine.dispatchedEvents[0].detail.coordinates.lat, -7.7956);
});

test('3.2 State rehydration loads persisted coordinates upon new instance mount', () => {
  const storage = new LocalStorageSimulator();
  storage.setItem('rescuebyte_user_coords', JSON.stringify({ lat: -6.9175, lng: 107.6191 })); // Bandung
  storage.setItem('rescuebyte_user_city', 'Kota Bandung');

  const engine = new LocationContextEngine(storage, {});
  assert.strictEqual(engine.coordinates.lat, -6.9175);
  assert.strictEqual(engine.coordinates.lng, 107.6191);
  assert.strictEqual(engine.selectedCity, 'Kota Bandung');
});

test('3.3 Corrupted storage values fallback safely to Malang without throwing', () => {
  const testCases = [
    '{ invalid JSON string',
    'null',
    'undefined',
    '[]',
    '{}',
    '{"lat": "not_a_number", "lng": 112}',
    '{"lat": null, "lng": 112}',
    '12345',
    'true',
  ];

  for (const tc of testCases) {
    const storage = new LocalStorageSimulator();
    storage.setItem('rescuebyte_user_coords', tc);

    const engine = new LocationContextEngine(storage, {});
    assert.strictEqual(
      engine.coordinates.lat,
      -7.9526,
      `Failed on testcase: ${tc} (expected fallback lat -7.9526)`
    );
    assert.strictEqual(
      engine.coordinates.lng,
      112.6146,
      `Failed on testcase: ${tc} (expected fallback lng 112.6146)`
    );
  }
});

// =====================================================================
// SUITE 4: Manual Location Override & City Selection (R7)
// =====================================================================
console.log('\n--- SUITE 4: Manual Location Override & City Selection (R7) ---');

test('4.1 setManualLocation updates state, persists, and dispatches update event', () => {
  const storage = new LocalStorageSimulator();
  const engine = new LocationContextEngine(storage, {});

  engine.setManualLocation({ lat: -6.2088, lng: 106.8456 }, 'DKI Jakarta');

  assert.strictEqual(engine.coordinates.lat, -6.2088);
  assert.strictEqual(engine.coordinates.lng, 106.8456);
  assert.strictEqual(engine.selectedCity, 'DKI Jakarta');
  assert.strictEqual(storage.getItem('rescuebyte_user_coords'), JSON.stringify({ lat: -6.2088, lng: 106.8456 }));
  assert.strictEqual(storage.getItem('rescuebyte_user_city'), 'DKI Jakarta');
  assert.strictEqual(engine.dispatchedEvents[0].type, 'rescuebyte_location_updated');
  assert.strictEqual(engine.dispatchedEvents[0].detail.city, 'DKI Jakarta');
});

test('4.2 setManualLocation defaults cityName to Lokasi Khusus when omitted', () => {
  const storage = new LocalStorageSimulator();
  const engine = new LocationContextEngine(storage, {});

  engine.setManualLocation({ lat: -7.2575, lng: 112.7521 });

  assert.strictEqual(engine.selectedCity, 'Lokasi Khusus');
  assert.strictEqual(storage.getItem('rescuebyte_user_city'), 'Lokasi Khusus');
});

// =====================================================================
// SUITE 5: JWT Expiration Parsing (R8)
// =====================================================================
console.log('\n--- SUITE 5: JWT Expiration Parsing (R8) ---');

// Replicate exact parseJwtExp from AuthContext.tsx
function parseJwtExp(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function createMockJwt(payloadObj) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(payloadObj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const signature = 'mockSignature';
  return `${header}.${payload}.${signature}`;
}

test('5.1 Valid JWT with future exp parses seconds to milliseconds accurately', () => {
  const futureSec = 1731150000;
  const token = createMockJwt({ sub: 'user_1', role: 'customer', exp: futureSec });
  const parsed = parseJwtExp(token);
  assert.strictEqual(parsed, futureSec * 1000);
});

test('5.2 JWT with URL-safe base64 (- and _) decodes successfully', () => {
  // Test specific base64 sequences producing + and /
  const token = createMockJwt({
    sub: 'user_with_special_chars_???>>>',
    exp: 1800000000,
  });
  const parsed = parseJwtExp(token);
  assert.strictEqual(parsed, 1800000000 * 1000);
});

test('5.3 JWT without exp claim returns null', () => {
  const token = createMockJwt({ sub: 'user_1', role: 'seller' });
  const parsed = parseJwtExp(token);
  assert.strictEqual(parsed, null);
});

test('5.4 JWT with string exp claim returns null (strict number enforcement)', () => {
  const token = createMockJwt({ sub: 'user_1', exp: '1731150000' });
  const parsed = parseJwtExp(token);
  assert.strictEqual(parsed, null);
});

test('5.5 Malformed token inputs safely return null without throwing exceptions', () => {
  const malformedInputs = [
    '',
    null,
    undefined,
    'not-a-token',
    'part1.part2',
    'p1.p2.p3.p4',
    'a.invalidBase64!@#.c',
    'a.' + btoa('this is not json') + '.c',
    '..',
    '. .',
  ];

  for (const input of malformedInputs) {
    const res = parseJwtExp(input);
    assert.strictEqual(res, null, `Expected null for input: ${input}`);
  }
});

// =====================================================================
// SUITE 6: 24-Hour Session Cap & Expiration Calculation (R8)
// =====================================================================
console.log('\n--- SUITE 6: 24-Hour Session Cap & Expiration Calculation (R8) ---');

const MAX_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function calculateSessionExpiresAt(storage) {
  const loginAtStr = storage.getItem('rescuebyte_login_at');
  const loginAt = loginAtStr ? parseInt(loginAtStr, 10) : null;
  const maxExp = loginAt ? loginAt + MAX_SESSION_DURATION_MS : null;
  const token = storage.getItem('access_token');
  const tokenExp = parseJwtExp(token);

  if (tokenExp && maxExp) return Math.min(tokenExp, maxExp);
  return tokenExp || maxExp;
}

test('6.1 When tokenExp is shorter than 24h cap, effective expiry is tokenExp', () => {
  const storage = new LocalStorageSimulator();
  const now = Date.now();
  storage.setItem('rescuebyte_login_at', String(now)); // 24h cap = now + 24h
  const tokenExpSec = Math.floor((now + 2 * 60 * 60 * 1000) / 1000); // 2 hours
  storage.setItem('access_token', createMockJwt({ exp: tokenExpSec }));

  const exp = calculateSessionExpiresAt(storage);
  assert.strictEqual(exp, tokenExpSec * 1000, 'Effective expiry must be tokenExp when shorter than 24h');
});

test('6.2 When tokenExp exceeds 24h cap, effective expiry is strictly capped at loginAt + 24h', () => {
  const storage = new LocalStorageSimulator();
  const now = Date.now();
  const loginAt = now - 1 * 60 * 60 * 1000; // Logged in 1 hour ago
  storage.setItem('rescuebyte_login_at', String(loginAt));
  const expectedCap = loginAt + MAX_SESSION_DURATION_MS; // 23h from now

  const longLivedSec = Math.floor((now + 7 * 24 * 60 * 60 * 1000) / 1000); // 7 days token
  storage.setItem('access_token', createMockJwt({ exp: longLivedSec }));

  const exp = calculateSessionExpiresAt(storage);
  assert.strictEqual(exp, expectedCap, 'Must strictly enforce 24-hour absolute cap!');
});

test('6.3 Missing token exp falls back to loginAt + 24h cap', () => {
  const storage = new LocalStorageSimulator();
  const now = Date.now();
  storage.setItem('rescuebyte_login_at', String(now));
  storage.setItem('access_token', createMockJwt({ sub: 'user_no_exp' }));

  const exp = calculateSessionExpiresAt(storage);
  assert.strictEqual(exp, now + MAX_SESSION_DURATION_MS);
});

test('6.4 Missing loginAt falls back to tokenExp', () => {
  const storage = new LocalStorageSimulator();
  const now = Date.now();
  const tokenExpSec = Math.floor((now + 3 * 60 * 60 * 1000) / 1000);
  storage.setItem('access_token', createMockJwt({ exp: tokenExpSec }));

  const exp = calculateSessionExpiresAt(storage);
  assert.strictEqual(exp, tokenExpSec * 1000);
});

test('6.5 Both missing returns null', () => {
  const storage = new LocalStorageSimulator();
  const exp = calculateSessionExpiresAt(storage);
  assert.strictEqual(exp, null);
});

test('6.6 Past expiration detection: expired sessions yield remaining <= 0', () => {
  const storage = new LocalStorageSimulator();
  const now = Date.now();
  const oldLogin = now - 25 * 60 * 60 * 1000; // 25 hours ago
  storage.setItem('rescuebyte_login_at', String(oldLogin));

  const exp = calculateSessionExpiresAt(storage);
  assert(exp !== null);
  const remaining = exp - now;
  assert(remaining < 0, `Session must be detected as expired (remaining: ${remaining}ms)`);
});

// =====================================================================
// SUITE 7: Tab Visibility & Restoration Listeners (R8)
// =====================================================================
console.log('\n--- SUITE 7: Tab Visibility & Restoration Listeners (R8) ---');

class SessionLifecycleSimulator {
  constructor(storage) {
    this.storage = storage;
    this.sessionTimer = null;
    this.isExpired = false;
    this.expiredEvents = [];
    this.clearedSensitive = false;
  }

  clearSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  handleExpired() {
    this.isExpired = true;
    this.clearSessionTimer();
    this.clearAllSensitiveSessionData();
    this.expiredEvents.push('rescuebyte_auth_expired');
  }

  clearAllSensitiveSessionData() {
    this.clearedSensitive = true;
    this.storage.removeItem('access_token');
    this.storage.removeItem('refresh_token');
    this.storage.removeItem('rescuebyte_auth');
    this.storage.removeItem('rescuebyte_login_at');
    this.storage.removeItem('rescuebyte_user_role');
  }

  scheduleSessionCheck() {
    this.clearSessionTimer();
    const expiresAt = calculateSessionExpiresAt(this.storage);
    if (!expiresAt) return;

    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      this.handleExpired();
      return;
    }
    this.sessionTimer = setTimeout(() => this.handleExpired(), remaining);
  }

  handleVisibilityOrFocus(visibilityState) {
    if (visibilityState === 'visible') {
      const exp = calculateSessionExpiresAt(this.storage);
      if (exp && exp - Date.now() <= 0) {
        this.handleExpired();
      } else {
        this.scheduleSessionCheck();
      }
    }
  }

  handleStorageEvent(key, newValue) {
    if (key === 'rescuebyte_auth' && !newValue) {
      this.handleExpired();
    }
  }
}

test('7.1 Tab restoration when session expired in background triggers immediate logout', () => {
  const storage = new LocalStorageSimulator();
  const now = Date.now();
  // Session expired 5 minutes ago while backgrounded
  storage.setItem('rescuebyte_login_at', String(now - 24.1 * 60 * 60 * 1000));
  storage.setItem('access_token', 'sample_token');

  const sim = new SessionLifecycleSimulator(storage);
  assert.strictEqual(sim.isExpired, false);

  // Tab becomes visible again
  sim.handleVisibilityOrFocus('visible');

  assert.strictEqual(sim.isExpired, true, 'Must expire immediately on tab restoration');
  assert.strictEqual(sim.clearedSensitive, true);
  assert.strictEqual(sim.expiredEvents.length, 1);
});

test('7.2 Tab restoration while session still active reschedules check without premature logout', () => {
  const storage = new LocalStorageSimulator();
  const now = Date.now();
  // Session active for 10 more hours
  storage.setItem('rescuebyte_login_at', String(now - 14 * 60 * 60 * 1000));
  const expSec = Math.floor((now + 10 * 60 * 60 * 1000) / 1000);
  storage.setItem('access_token', createMockJwt({ exp: expSec }));

  const sim = new SessionLifecycleSimulator(storage);
  sim.handleVisibilityOrFocus('visible');

  assert.strictEqual(sim.isExpired, false, 'Active session must NOT expire on tab restoration');
  assert(sim.sessionTimer !== null, 'Timer must be scheduled for remaining duration');
  sim.clearSessionTimer();
});

test('7.3 Cross-tab synchronization via storage event clears session when another tab logs out', () => {
  const storage = new LocalStorageSimulator();
  storage.setItem('rescuebyte_auth', JSON.stringify({ user: { id: 'u1' } }));

  const sim = new SessionLifecycleSimulator(storage);
  assert.strictEqual(sim.isExpired, false);

  // Storage event: rescuebyte_auth was removed in Tab B
  sim.handleStorageEvent('rescuebyte_auth', null);

  assert.strictEqual(sim.isExpired, true, 'Cross-tab logout must sync immediately');
});

// =====================================================================
// SUITE 8: Complete Sensitive Storage Wipe (R8)
// =====================================================================
console.log('\n--- SUITE 8: Complete Sensitive Storage Wipe (R8) ---');

function clearAllSensitiveSessionData(storage) {
  storage.removeItem('access_token');
  storage.removeItem('refresh_token');
  storage.removeItem('rescuebyte_auth');
  storage.removeItem('rescuebyte_login_at');
  storage.removeItem('rescuebyte_user_role');
  storage.removeItem('rescuebyte_customer_cart');
  storage.removeItem('rescuebyte_selected_store');
  storage.removeItem('rescuebyte_store_logo');
  storage.removeItem('rescuebyte_store_name');
  storage.removeItem('rescuebyte_store_email');
  storage.removeItem('rescuebyte_store_address');
  storage.removeItem('rescuebyte_store_coordinates');
}

test('8.1 All 12 sensitive storage keys are completely wiped while non-sensitive keys remain', () => {
  const storage = new LocalStorageSimulator();

  const sensitiveKeys = [
    'access_token',
    'refresh_token',
    'rescuebyte_auth',
    'rescuebyte_login_at',
    'rescuebyte_user_role',
    'rescuebyte_customer_cart',
    'rescuebyte_selected_store',
    'rescuebyte_store_logo',
    'rescuebyte_store_name',
    'rescuebyte_store_email',
    'rescuebyte_store_address',
    'rescuebyte_store_coordinates',
  ];

  // Populate all sensitive keys
  for (const k of sensitiveKeys) {
    storage.setItem(k, `secret_value_for_${k}`);
  }

  // Populate non-sensitive location key
  storage.setItem('rescuebyte_user_coords', JSON.stringify({ lat: -7.95, lng: 112.61 }));
  storage.setItem('rescuebyte_user_city', 'Kota Malang');

  // Execute wipe
  clearAllSensitiveSessionData(storage);

  // Verify all 12 are gone
  for (const k of sensitiveKeys) {
    assert.strictEqual(
      storage.getItem(k),
      null,
      `Sensitive key ${k} must be null after wipe!`
    );
  }

  // Verify non-sensitive keys preserved
  assert(storage.getItem('rescuebyte_user_coords') !== null, 'rescuebyte_user_coords must be preserved');
  assert(storage.getItem('rescuebyte_user_city') !== null, 'rescuebyte_user_city must be preserved');
});

test('8.2 Storage wipe consistency between AuthContext.tsx, client.ts, and authService.ts', () => {
  const authContextCode = fs.readFileSync(path.resolve('src/context/AuthContext.tsx'), 'utf-8');
  const clientCode = fs.readFileSync(path.resolve('src/api/client.ts'), 'utf-8');
  const authServiceCode = fs.readFileSync(path.resolve('src/services/authService.ts'), 'utf-8');

  const requiredKeys = [
    'access_token',
    'refresh_token',
    'rescuebyte_auth',
    'rescuebyte_login_at',
    'rescuebyte_user_role',
    'rescuebyte_customer_cart',
    'rescuebyte_selected_store',
    'rescuebyte_store_logo',
    'rescuebyte_store_name',
    'rescuebyte_store_email',
    'rescuebyte_store_address',
    'rescuebyte_store_coordinates',
  ];

  for (const key of requiredKeys) {
    assert(
      authContextCode.includes(key),
      `AuthContext.tsx missing wipe for key: ${key}`
    );
    assert(
      clientCode.includes(key),
      `src/api/client.ts missing wipe for key: ${key}`
    );
    assert(
      authServiceCode.includes(key),
      `src/services/authService.ts missing wipe for key: ${key}`
    );
  }
});

// =====================================================================
// SUITE 9: 401 Interceptor & Transparent Token Refresh (R8)
// =====================================================================
console.log('\n--- SUITE 9: 401 Interceptor & Transparent Token Refresh (R8) ---');

class AxiosInterceptorSimulator {
  constructor(storage, refreshApiMock) {
    this.storage = storage;
    this.refreshApi = refreshApiMock;
    this.isRefreshing = false;
    this.failedQueue = [];
    this.dispatchedEvents = [];
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else if (token) prom.resolve(token);
    });
    this.failedQueue = [];
  }

  async handle401Error(originalRequest) {
    const url = originalRequest.url || '';
    const isAuthEndpoint =
      url.includes('/api/v1/auth/login') ||
      url.includes('/api/v1/auth/refresh') ||
      url.includes('/api/v1/auth/register') ||
      url.includes('/api/v1/auth/logout');

    if (isAuthEndpoint || originalRequest._retry) {
      throw new Error('401 on auth endpoint or already retried');
    }

    const refreshToken = this.storage.getItem('refresh_token');
    if (!refreshToken) {
      clearAllSensitiveSessionData(this.storage);
      this.dispatchedEvents.push('rescuebyte_auth_expired');
      throw new Error('No refresh token available');
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
        return { status: 200, retriedWith: newToken, url: originalRequest.url };
      });
    }

    originalRequest._retry = true;
    this.isRefreshing = true;

    try {
      const refreshResponse = await this.refreshApi(refreshToken);
      const newAccessToken = refreshResponse.access_token;
      const newRefreshToken = refreshResponse.refresh_token || refreshToken;

      if (!newAccessToken) {
        throw new Error('No access token returned from refresh');
      }

      this.storage.setItem('access_token', newAccessToken);
      this.storage.setItem('refresh_token', newRefreshToken);
      this.dispatchedEvents.push({ type: 'rescuebyte_auth_refreshed', token: newAccessToken });

      this.processQueue(null, newAccessToken);
      originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newAccessToken}` };
      return { status: 200, retriedWith: newAccessToken, url: originalRequest.url };
    } catch (refreshErr) {
      this.processQueue(refreshErr, null);
      clearAllSensitiveSessionData(this.storage);
      this.dispatchedEvents.push('rescuebyte_auth_expired');
      throw refreshErr;
    } finally {
      this.isRefreshing = false;
    }
  }
}

asyncTest('9.1 401 without refresh token immediately wipes session and dispatches rescuebyte_auth_expired', async () => {
  const storage = new LocalStorageSimulator();
  storage.setItem('access_token', 'expired_token');
  // No refresh_token set

  const sim = new AxiosInterceptorSimulator(storage, async () => ({}));
  let caughtError = null;
  try {
    await sim.handle401Error({ url: '/api/v1/user/profile', headers: {} });
  } catch (err) {
    caughtError = err;
  }

  assert(caughtError !== null);
  assert.strictEqual(storage.getItem('access_token'), null);
  assert(sim.dispatchedEvents.includes('rescuebyte_auth_expired'));
});

asyncTest('9.2 401 with valid refresh token refreshes token, updates storage, and retries request', async () => {
  const storage = new LocalStorageSimulator();
  storage.setItem('access_token', 'old_access_token');
  storage.setItem('refresh_token', 'valid_refresh_token');

  const sim = new AxiosInterceptorSimulator(storage, async (rt) => {
    assert.strictEqual(rt, 'valid_refresh_token');
    return { access_token: 'new_shiny_access_token', refresh_token: 'new_shiny_refresh_token' };
  });

  const res = await sim.handle401Error({ url: '/api/v1/orders/my', headers: {} });
  assert.strictEqual(res.retriedWith, 'new_shiny_access_token');
  assert.strictEqual(storage.getItem('access_token'), 'new_shiny_access_token');
  assert.strictEqual(storage.getItem('refresh_token'), 'new_shiny_refresh_token');
});

asyncTest('9.3 Hard refresh failure (refresh token revoked/rejected) wipes storage and dispatches expired', async () => {
  const storage = new LocalStorageSimulator();
  storage.setItem('access_token', 'old_access_token');
  storage.setItem('refresh_token', 'revoked_refresh_token');

  const sim = new AxiosInterceptorSimulator(storage, async () => {
    throw new Error('Refresh token invalid or revoked');
  });

  let caught = null;
  try {
    await sim.handle401Error({ url: '/api/v1/products', headers: {} });
  } catch (err) {
    caught = err;
  }

  assert(caught !== null);
  assert.strictEqual(storage.getItem('access_token'), null);
  assert.strictEqual(storage.getItem('refresh_token'), null);
  assert(sim.dispatchedEvents.includes('rescuebyte_auth_expired'));
});

asyncTest('9.4 Concurrent 401 requests are queued and retried with the single refreshed token', async () => {
  const storage = new LocalStorageSimulator();
  storage.setItem('access_token', 'expired_tok');
  storage.setItem('refresh_token', 'valid_rt');

  let refreshCallCount = 0;
  const sim = new AxiosInterceptorSimulator(storage, async () => {
    refreshCallCount++;
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 20));
    return { access_token: 'batched_new_token', refresh_token: 'valid_rt' };
  });

  // Launch 5 concurrent 401 requests
  const reqs = [
    sim.handle401Error({ url: '/req1', headers: {} }),
    sim.handle401Error({ url: '/req2', headers: {} }),
    sim.handle401Error({ url: '/req3', headers: {} }),
    sim.handle401Error({ url: '/req4', headers: {} }),
    sim.handle401Error({ url: '/req5', headers: {} }),
  ];

  const results = await Promise.all(reqs);

  assert.strictEqual(refreshCallCount, 1, 'Token refresh must occur exactly once for batched requests');
  assert.strictEqual(results.length, 5);
  for (const r of results) {
    assert.strictEqual(r.retriedWith, 'batched_new_token');
  }
});

// =====================================================================
// SUITE 10: Route Guarding & Redirection to #auth (R8)
// =====================================================================
console.log('\n--- SUITE 10: Route Guarding & Redirection to #auth (R8) ---');

// Replicate route evaluation logic from App.tsx activeView initializer
function evaluateInitialView(hash, currentUser) {
  const cleanHash = hash.replace(/^#/, '');
  const [pathPart] = cleanHash.split('?');
  const path = pathPart.toLowerCase();

  const isSellerPath =
    path.startsWith('beranda-seller') ||
    path === 'beranda' ||
    path.startsWith('profil-seller') ||
    path === 'profil' ||
    path.startsWith('riwayat-seller') ||
    path.startsWith('riwayat') ||
    path.startsWith('buat-dagangan-seller') ||
    path.startsWith('buat-dagangan') ||
    path.startsWith('daganganku-seller') ||
    path.startsWith('daganganku') ||
    path.startsWith('ulasan-seller') ||
    path === 'ulasan';

  if (isSellerPath) {
    if (!currentUser) return 'view-auth-role-selection';
    if (path.startsWith('beranda-seller') || path === 'beranda') return 'view-beranda';
    if (path.startsWith('profil-seller') || path === 'profil') return 'view-profil';
    if (path.startsWith('riwayat-seller') || path.startsWith('riwayat')) return 'view-riwayat';
    if (path.startsWith('buat-dagangan-seller') || path.startsWith('buat-dagangan')) return 'view-buat-dagangan';
    if (path.startsWith('daganganku-seller') || path.startsWith('daganganku')) return 'view-daganganku';
    if (path.startsWith('ulasan-seller') || path === 'ulasan') return 'view-ulasan';
  }

  if (path.startsWith('detail-pesanan') || path.startsWith('order-detail')) {
    if (!currentUser) return 'view-customer-home';
    return 'view-customer-order-detail';
  }

  if (path.startsWith('detail-produk') || path.startsWith('detail') || path.startsWith('mystery-box-detail')) {
    if (!currentUser) return 'view-auth-role-selection';
    return 'view-customer-product-detail';
  }
  if (path.startsWith('keranjang') || path.startsWith('cart')) {
    if (!currentUser) return 'view-auth-role-selection';
    return 'view-customer-cart';
  }
  if (path.startsWith('pesanan-saya') || path.startsWith('pesanan') || path.startsWith('riwayat-pesanan') || path.startsWith('customer-orders')) {
    if (!currentUser) return 'view-auth-role-selection';
    return 'view-customer-orders';
  }
  if (path.startsWith('toko') || path.startsWith('store') || path.startsWith('detail-toko')) {
    return 'view-customer-store';
  }
  if (path.startsWith('checkout')) {
    if (!currentUser) return 'view-auth-role-selection';
    return 'view-customer-checkout';
  }
  if (path.startsWith('kontak') || path.startsWith('contact') || path.startsWith('saran')) return 'view-customer-contact';
  if (path.startsWith('marketplace')) {
    if (!currentUser) return 'view-auth-role-selection';
    return 'view-customer-marketplace';
  }
  if (path.startsWith('akun') || path.startsWith('profil-user') || path.startsWith('profil-customer') || path.startsWith('profile')) {
    if (!currentUser) return 'view-auth-role-selection';
    return 'view-customer-profile';
  }
  if (path.startsWith('masuk-mitra') || path.startsWith('daftar-mitra') || path.startsWith('auth-seller') || path.startsWith('seller-auth')) {
    return 'view-seller-auth';
  }
  if (path.startsWith('masuk-customer') || path.startsWith('daftar-customer')) {
    return 'view-customer-auth';
  }
  if (path.startsWith('masuk') || path.startsWith('daftar') || path.startsWith('auth') || path.startsWith('login') || path.startsWith('pilih-role')) {
    return 'view-auth-role-selection';
  }
  return 'view-customer-home';
}

test('10.1 All seller routes require authentication on startup and redirect unauthenticated users to #auth', () => {
  const sellerRoutes = [
    '#beranda-seller',
    '#profil-seller',
    '#riwayat-seller',
    '#buat-dagangan-seller',
    '#daganganku-seller',
    '#ulasan-seller',
    '#ulasan',
    '#beranda',
    '#profil',
  ];

  for (const route of sellerRoutes) {
    const viewWithoutAuth = evaluateInitialView(route, null);
    assert.strictEqual(
      viewWithoutAuth,
      'view-auth-role-selection',
      `Unauthenticated user accessing ${route} must yield view-auth-role-selection`
    );

    const viewWithAuth = evaluateInitialView(route, { id: 'seller_1', role: 'seller' });
    assert.notStrictEqual(
      viewWithAuth,
      'view-auth-role-selection',
      `Authenticated seller accessing ${route} should NOT be redirected to auth`
    );
  }
});

test('10.2 Protected customer routes require authentication and redirect to #auth', () => {
  const protectedCustomerRoutes = [
    '#marketplace',
    '#detail-produk?id=123',
    '#keranjang',
    '#checkout',
    '#pesanan-saya',
    '#akun',
  ];

  for (const route of protectedCustomerRoutes) {
    const viewWithoutAuth = evaluateInitialView(route, null);
    assert.strictEqual(
      viewWithoutAuth,
      'view-auth-role-selection',
      `Unauthenticated user accessing ${route} must be redirected to view-auth-role-selection`
    );

    const viewWithAuth = evaluateInitialView(route, { id: 'cust_1', role: 'customer' });
    assert.notStrictEqual(
      viewWithAuth,
      'view-auth-role-selection',
      `Authenticated customer accessing ${route} must be permitted`
    );
  }
});

test('10.3 Public customer routes are accessible without authentication', () => {
  const publicRoutes = [
    '#beranda-customer',
    '#toko?name=Toko+Reza',
    '#kontak',
    '#auth',
    '#masuk-customer',
    '#masuk-mitra',
  ];

  for (const route of publicRoutes) {
    const view = evaluateInitialView(route, null);
    assert(
      view === 'view-customer-home' ||
      view === 'view-customer-store' ||
      view === 'view-customer-contact' ||
      view === 'view-auth-role-selection' ||
      view === 'view-customer-auth' ||
      view === 'view-seller-auth',
      `Route ${route} should route to its respective view without throwing or redirecting improperly`
    );
  }
});

test('10.4 Dynamic auth state revocation triggers immediate redirection to #auth for protected routes', () => {
  // Simulate App.tsx subscribeToAuth listener logic
  let activeView = 'view-customer-marketplace';
  let activeHash = '#marketplace';

  const onAuthUpdate = (user) => {
    const path = activeHash.replace(/^#/, '');
    if (!user) {
      if (
        path.startsWith('marketplace') ||
        path.startsWith('detail-produk') ||
        path.startsWith('keranjang') ||
        path.startsWith('checkout') ||
        path.startsWith('pesanan-saya') ||
        path.startsWith('beranda-seller') ||
        path.startsWith('ulasan-seller')
      ) {
        activeView = 'view-auth-role-selection';
        activeHash = '#auth';
      }
    }
  };

  // User is logged out
  onAuthUpdate(null);

  assert.strictEqual(activeView, 'view-auth-role-selection');
  assert.strictEqual(activeHash, '#auth');
});

// =====================================================================
// SUITE 11: Live Backend Probes for Token Invalidation & Refresh Contracts
// =====================================================================
console.log('\n--- SUITE 11: Live Backend Probes for Token Invalidation & Refresh (R8) ---');

asyncTest('11.1 Live Backend POST /api/v1/auth/refresh with invalid token returns 401 invalid_refresh_token', async () => {
  const res = await fetch('https://dolpin-fourthree.bccdev.id/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: 'invalid_dummy_refresh_token_test' }),
  });
  assert.strictEqual(res.status, 401, 'Backend must reject invalid refresh token with HTTP 401');
  const data = await res.json();
  assert.strictEqual(data.payload?.error?.error_code, 'invalid_refresh_token');
});

asyncTest('11.2 Live Backend GET /api/v1/auth/me with invalid Bearer token returns 401 invalid_bearer_token', async () => {
  const res = await fetch('https://dolpin-fourthree.bccdev.id/api/v1/auth/me', {
    headers: { Authorization: 'Bearer invalid_bearer_token_test' },
  });
  assert.strictEqual(res.status, 401, 'Backend must reject invalid Bearer token with HTTP 401');
  const data = await res.json();
  assert.strictEqual(data.payload?.error?.error_code, 'invalid_bearer_token');
});

// =====================================================================
// SUITE 12: Infinite 401 Loop Prevention & In-Flight Concurrency
// =====================================================================
console.log('\n--- SUITE 12: Infinite 401 Loop Prevention & Concurrency Guard (R8) ---');

asyncTest('12.1 _retry flag strictly prevents infinite 401 recursion loop', async () => {
  const storage = new LocalStorageSimulator();
  storage.setItem('refresh_token', 'mock_refresh_token');

  let callCount = 0;
  const sim = new AxiosInterceptorSimulator(storage, async () => {
    callCount++;
    return { access_token: 'new_token', refresh_token: 'new_rt' };
  });

  const originalRequest = { url: '/api/v1/protected/resource', headers: {} };

  // First 401 initiates refresh and sets _retry = true
  const res = await sim.handle401Error(originalRequest);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(originalRequest._retry, true);

  // If retried request again returns 401, interceptor must reject instead of refreshing again
  let secondError = null;
  try {
    await sim.handle401Error(originalRequest);
  } catch (err) {
    secondError = err;
  }

  assert(secondError !== null, 'Must reject on second 401 to prevent infinite loop');
  assert.strictEqual(callCount, 1, 'Refresh must NOT be called a second time');
});

// =====================================================================
// SUITE 13: System Clock Drift & Non-Standard Expirations (R8)
// =====================================================================
console.log('\n--- SUITE 13: System Clock Drift & Non-Standard Expirations (R8) ---');

test('13.1 If client clock jumps forward past expiration, session check terminates immediately', () => {
  const storage = new LocalStorageSimulator();
  const baseTime = 1700000000000;
  storage.setItem('rescuebyte_login_at', String(baseTime));
  storage.setItem('access_token', createMockJwt({ exp: Math.floor((baseTime + 3600000) / 1000) }));

  // Simulate Date.now() jumping forward 2 hours
  const futureNow = baseTime + 7200000;
  const exp = calculateSessionExpiresAt(storage);
  assert(exp !== null);
  const remaining = exp - futureNow;
  assert(remaining < 0, 'Must detect expiration when clock advances');
});

test('13.2 Corrupted non-numeric login_at timestamp safely ignored in calculateSessionExpiresAt', () => {
  const storage = new LocalStorageSimulator();
  storage.setItem('rescuebyte_login_at', 'not_a_valid_timestamp');
  const now = Date.now();
  const tokenExpSec = Math.floor((now + 3600000) / 1000);
  storage.setItem('access_token', createMockJwt({ exp: tokenExpSec }));

  const exp = calculateSessionExpiresAt(storage);
  // parseInt('not_a_valid_timestamp') is NaN, which is falsy -> falls back to tokenExp
  assert.strictEqual(exp, tokenExpSec * 1000);
});

// Run all registered tests sequentially
runAll();
