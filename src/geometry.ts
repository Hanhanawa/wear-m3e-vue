export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalizedPage(index: number, count: number): number {
  return Number.isFinite(index)
    ? clamp(Math.round(index), 0, Math.max(0, count - 1))
    : 0;
}

export function gestureAxis(
  dx: number,
  dy: number,
  slop: number,
): "x" | "y" | null {
  const x = Math.abs(dx);
  const y = Math.abs(dy);
  if (Math.max(x, y) < slop) return null;
  if (x > y * 1.3) return "x";
  if (y > x * 1.15 || Math.max(x, y) >= slop * 2) return "y";
  return null;
}

export function swipePage(
  dx: number,
  elapsed: number,
  width: number,
  unit: number,
): -1 | 0 | 1 {
  const distance = Math.abs(dx);
  const fling =
    distance >= unit * 24 && distance / Math.max(elapsed, 1) >= unit * 0.35;
  if (!fling && distance < Math.max(unit * 32, width * 0.21)) return 0;
  return dx < 0 ? 1 : -1;
}

interface ItemGeometry {
  center: number;
  height: number;
  width: number;
  diameter: number;
  edgeScale: number;
}

export function itemScale({
  center,
  height,
  width,
  diameter,
  edgeScale,
}: ItemGeometry): number {
  if (diameter <= 0 || width <= 0) return 1;

  const radius = diameter / 2;
  const distance = Math.abs(center - radius);
  const progress = clamp((distance / radius - 0.28) / 0.63, 0, 1);
  const easing = progress * progress * (3 - 2 * progress);
  const scale = 1 - (1 - clamp(edgeScale, 0.5, 1)) * easing;
  // Fit the inset content bounds inside the circle at the final scale.
  // Rounded corners can safely extend past that inset.
  const halfWidth = width * 0.44;
  const halfHeight = height * 0.44;
  const a = halfWidth ** 2 + halfHeight ** 2;
  const b = 2 * distance * halfHeight;
  const c = distance ** 2 - (radius * 0.98) ** 2;
  const fittedScale =
    (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
  return Math.min(scale, clamp(fittedScale, 0.5, 1));
}

/**
 * Dot placement used to live here as `arcPoint(index, count)` on a hard-coded
 * 110 unit radius inside a 240 unit viewBox, which is exactly what made a "6
 * unit" dot become 4.96 dp on a 192 screen and 6.2 dp on a 240 one. It is
 * replaced by `pageIndicatorGeometry` in `src/arcs.ts`, which works in logical
 * dp and derives its radius from the measured screen diameter.
 */
