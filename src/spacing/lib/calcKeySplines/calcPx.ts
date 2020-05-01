function calcPx(
  p1x: number,
  p2x: number,
  p3x: number,
  p4x: number,
  t: number
): number {
  const p =
    p1x * Math.pow(1 - t, 3) +
    3 * p2x * t * Math.pow(1 - t, 2) +
    3 * p3x * Math.pow(t, 2) * (1 - t) +
    p4x * Math.pow(t, 3);
  return p;
}

export default calcPx;
