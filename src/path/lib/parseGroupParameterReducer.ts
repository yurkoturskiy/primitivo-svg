const parseGroupParameterReducer = (
  key: string,
  value: any,
  vertexIndex: number
): any => {
  switch (key) {
    case "round":
      if (typeof value === "object" && value.length > 2)
        value = value[vertexIndex];
      if (typeof value === "number") value = [value, value];
      break;
    default:
      // code...
      break;
  }
  return value;
};

export default parseGroupParameterReducer;
