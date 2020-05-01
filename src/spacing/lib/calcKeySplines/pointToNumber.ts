var log = require("loglevel").getLogger("spacing-log");

const pointToNumber = (point: string): number[] => {
  log.debug("point to number", point);
  let p: string[] | number[] = point.split(",");
  p = [Number(p[0]), Number(p[1])];
  log.debug("converted point to number", p);
  return p;
};

export default pointToNumber;
