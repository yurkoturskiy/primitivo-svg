import defaults from "../defaultParameters";
import { AnimateParameters, KeyPathParameters } from "../interfaces";

const setDefaults = (
  parameters: AnimateParameters,
  keyPathsParameters: KeyPathParameters
) => ({
  parameters: { ...defaults.parameters, ...parameters },
  keyPathsParameters: {
    ...defaults.keyPathsParameters,
    ...keyPathsParameters
  }
});

export default setDefaults;
