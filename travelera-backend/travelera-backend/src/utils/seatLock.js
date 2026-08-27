// In-memory seat/slot lock store (single-instance dev use).
// In production, swap this for a Redis-backed lock (SETNX + TTL) so it works
// across multiple backend instances — see docs Section 8 "Concurrency Handling".
const { LOCK_TTL_SECONDS } = require("../config/env");

const locks = new Map(); // key -> expiryTimestamp

function buildKey(inventoryType, inventoryId, seatNumber) {
  return `${inventoryType}:${inventoryId}:${seatNumber}`;
}

function cleanExpired() {
  const now = Date.now();
  for (const [key, expiry] of locks.entries()) {
    if (expiry <= now) locks.delete(key);
  }
}

function acquireLock(inventoryType, inventoryId, seatNumbers = []) {
  cleanExpired();
  const conflicts = [];
  const keys = seatNumbers.map((s) => buildKey(inventoryType, inventoryId, s));

  for (const key of keys) {
    if (locks.has(key)) conflicts.push(key);
  }
  if (conflicts.length) {
    return { ok: false, conflicts };
  }

  const expiry = Date.now() + LOCK_TTL_SECONDS * 1000;
  keys.forEach((key) => locks.set(key, expiry));
  return { ok: true, keys };
}

function releaseLock(keys = []) {
  keys.forEach((key) => locks.delete(key));
}

module.exports = { acquireLock, releaseLock, buildKey };
