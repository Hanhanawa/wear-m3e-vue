import assert from "node:assert/strict";
import test from "node:test";
import {
  dateParts,
  daysInMonth,
  rangeValue,
  timeParts,
  validDate,
  isoDate,
} from "../src/values.ts";

test("range values clamp and round fractional steps without floating point drift", () => {
  assert.equal(rangeValue(0.30000000000000004, 0, 1, 0.1), 0.3);
  assert.equal(rangeValue(-2, 0, 10, 2), 0);
  assert.equal(rangeValue(99, 0, 10, 3), 10);
  assert.equal(rangeValue(3, 2, 1), 2);
  assert.equal(rangeValue(Number.NaN, -5, 5), -5);
  assert.equal(rangeValue(2, 0, 10, 0), 2);
});

test("changing months and years respects leap days and short months", () => {
  assert.equal(daysInMonth(2024, 2), 29);
  assert.equal(daysInMonth(2025, 2), 28);
  assert.equal(daysInMonth(2000, 2), 29);
  assert.equal(daysInMonth(1900, 2), 28);
  const fallback = new Date(2024, 0, 31);
  assert.deepEqual(dateParts("2024-02-31", fallback, 2020, 2030), {
    year: 2024,
    month: 2,
    day: 29,
  });
  assert.deepEqual(dateParts("2025-02-29", fallback, 2020, 2030), {
    year: 2025,
    month: 2,
    day: 28,
  });
  assert.deepEqual(dateParts(undefined, fallback, 2020, 2030), {
    year: 2024,
    month: 1,
    day: 31,
  });
  assert.deepEqual(dateParts("2099-99-99", fallback, 2020, 2030), {
    year: 2030,
    month: 12,
    day: 31,
  });
});

test("time controls accept seconds and normalize invalid incoming values", () => {
  assert.deepEqual(timeParts("23:58:30"), { hour: 23, minute: 58, second: 30 });
  assert.deepEqual(timeParts("00:00"), { hour: 0, minute: 0, second: 0 });
  assert.deepEqual(timeParts("99:99:99"), { hour: 23, minute: 59, second: 59 });
  assert.deepEqual(timeParts("bad"), { hour: 0, minute: 0, second: 0 });
});

test("date bounds use complete valid ISO dates", () => {
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2025-02-29"), false);
  assert.equal(validDate("0000-01-01"), false);
  assert.equal(validDate("2024-13-01"), false);
  assert.equal(validDate("2024-01-32"), false);
  assert.equal(validDate(undefined), false);
  assert.equal(isoDate({ year: 7, month: 2, day: 3 }), "0007-02-03");
});
