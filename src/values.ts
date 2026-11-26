export function rangeValue(
  value: number | undefined,
  min = 0,
  max = 100,
  step = 1,
): number {
  const lower = Number.isFinite(min) ? min : 0;
  const upper = Number.isFinite(max)
    ? Math.max(lower, max)
    : Math.max(lower, 100);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const bounded = Math.max(
    lower,
    Math.min(upper, Number.isFinite(value) ? value! : lower),
  );
  if (bounded === upper) return upper;
  return Math.max(
    lower,
    Math.min(
      upper,
      Number(
        (
          lower +
          Math.round((bounded - lower) / increment) * increment
        ).toPrecision(12),
      ),
    ),
  );
}

export function daysInMonth(year: number, month: number): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month, 0);
  return date.getUTCDate();
}

export function dateParts(
  value: string | undefined,
  fallback: Date,
  minYear: number,
  maxYear: number,
) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  const year = Math.min(
    maxYear,
    Math.max(minYear, match ? Number(match[1]) : fallback.getFullYear()),
  );
  const month = Math.min(
    12,
    Math.max(1, match ? Number(match[2]) : fallback.getMonth() + 1),
  );
  const day = Math.min(
    daysInMonth(year, month),
    Math.max(1, match ? Number(match[3]) : fallback.getDate()),
  );
  return { year, month, day };
}

export function timeParts(value: string | undefined) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value ?? "");
  return {
    hour: Math.min(23, Number(match?.[1] ?? 0)),
    minute: Math.min(59, Number(match?.[2] ?? 0)),
    second: Math.min(59, Number(match?.[3] ?? 0)),
  };
}

export function isoDate(value: {
  year: number;
  month: number;
  day: number;
}): string {
  return [
    String(value.year).padStart(4, "0"),
    String(value.month).padStart(2, "0"),
    String(value.day).padStart(2, "0"),
  ].join("-");
}

export function validDate(value: string | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}
