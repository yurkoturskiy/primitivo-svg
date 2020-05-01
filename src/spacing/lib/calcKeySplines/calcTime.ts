import solveCubicEquation from "./solveCubicEquation";
var log = require("loglevel").getLogger("spacing-log");

function calcTime(
  p1y: number,
  p2y: number,
  p3y: number,
  p4y: number,
  py: number
): number {
  const a = p4y - 3 * p3y + 3 * p2y - p1y;
  log.debug("a", a);
  const b = 3 * (p3y - 2 * p2y + p1y);
  log.debug("b", b);
  const c = 3 * (p2y - p1y);
  log.debug("c", c);
  const d = p1y - py;
  log.debug("d", d);
  const ts = solveCubicEquation(a, b, c, d);
  for (let t of ts) {
    if (t > 0 && t < 1) return t;
  }
  return ts[1];
}

export default calcTime;
