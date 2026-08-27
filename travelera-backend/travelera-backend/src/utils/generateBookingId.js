// Generates a human-readable booking id e.g. TE-2026-000123
function generateBookingId() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TE-${year}-${random}`;
}

module.exports = generateBookingId;
