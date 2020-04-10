import r from "ramda";
import { Parameters } from "../../interfaces";
import { pipe } from "fp-ts/lib/pipeable";
import { Either, left, right } from "fp-ts/lib/Either";

const initKeySplinesArray = (numOfKeySplines: number): null[] =>
  Array(numOfKeySplines).fill(null, 0, numOfKeySplines - 1);

const format = (numOfKeySplines: number) => (keySplines: string[]): string[] =>
  pipe(
    initKeySplinesArray(numOfKeySplines),
    r.update(0, `${keySplines[0]}, ${keySplines[1]}`),
    r.update(-1, `${keySplines[2]}, ${keySplines[3]}`)
  );

const validate = (keySplines: string[]): string[] => {
  if (keySplines.length !== 4) throw "Wrong keySplines format";
  return keySplines;
};

const parseKeySplines = (
  keySplines: string,
  numOfKeySplines: number
): string[] =>
  pipe(r.split(",", keySplines), validate, format(numOfKeySplines));

export default (params: Parameters): Parameters =>
  r.type(params.keySplines) === "String"
    ? {
        ...params,
        keySplines: parseKeySplines(
          params.keySplines,
          (params.progression.length - 1) * 2
        ),
      }
    : params;
