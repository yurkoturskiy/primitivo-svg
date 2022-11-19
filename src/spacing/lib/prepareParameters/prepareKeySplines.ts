import { update, split, type } from "ramda";
import { Parameters } from "../../interfaces";
import { pipe } from "fp-ts/lib/function";

const initKeySplinesArray = (numOfKeySplines: number): null[] =>
  Array(numOfKeySplines).fill(null, 0, numOfKeySplines - 1);

const format =
  (numOfKeySplines: number) =>
  (keySplines: string[]): string[] =>
    pipe(
      initKeySplinesArray(numOfKeySplines),
      update(0, `${keySplines[0]}, ${keySplines[1]}`),
      update(-1, `${keySplines[2]}, ${keySplines[3]}`)
    );

const validate = (keySplines: string[]): string[] => {
  if (keySplines.length !== 4) throw "Wrong keySplines format";
  return keySplines;
};

const parseKeySplines = (
  keySplines: string,
  numOfKeySplines: number
): string[] => pipe(split(",", keySplines), validate, format(numOfKeySplines));

export default (params: Parameters): Parameters =>
  type(params.keySplines) === "String"
    ? {
        ...params,
        keySplines: parseKeySplines(
          params.keySplines as string,
          (params.progression.length - 1) * 2
        ),
      }
    : params;
