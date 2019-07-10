const round = (number: number): number => Math.round(number * 1e6) / 1e6;
const radToAngle = (rad: number): number => (rad * 180) / Math.PI;
const angleToRad = (angle: number): number => (angle * Math.PI) / 180;

/*****************
 * TS Interfaces *
 *****************/

interface Vertex {
  type?: string;
  group?: number;
  radians?: number;
  x?: number;
  y?: number;
  cosx?: number;
  siny?: number;
  x1?: number;
  y1?: number;
  cosx1?: number;
  siny1?: number;
  x2?: number;
  y2?: number;
  cosx2?: number;
  siny2?: number;
  d?: string;
}

interface PathData {
  frame: Frame;
  vertexes: Vertex[];
  groups: GroupParameters[];
  svgPathData?: string;
}

interface FrameParameters {
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rotate: number;
}

interface FrameVertex {
  cosx: number;
  siny: number;
  x: number;
  y: number;
  radians: number;
  angle: number;
}

interface Frame {
  vertexes: FrameVertex[];
  numOfVertexes: number;
}

interface PathData {
  frame: Frame;
  vertexes: Vertex[];
  svgPathData?: string;
}

interface GroupParameters {
  round: number;
  roundRandomRange?: number[];
  distance: number;
  distanceRandomRange?: number[];
}

/***********
 * Methods *
 ***********/

const generateFrame = (parameters: FrameParameters): Frame => {
  const { depth, rotate } = parameters;
  var numOfVertexes: number = 4 * Math.pow(2, depth);
  var vertexes = [];
  for (let i = 0; i < numOfVertexes; i++) {
    let radians = ((Math.PI * 2) / numOfVertexes) * i;
    radians += angleToRad(rotate);
    let angle = radToAngle(radians);
    let cosx = round(Math.cos(radians));
    let siny = round(Math.sin(radians));
    let x = cosx;
    let y = siny;
    vertexes[i] = {
      cosx,
      siny,
      x,
      y,
      radians,
      angle
    };
  }
  var frameObj = {
    vertexes,
    numOfVertexes: vertexes.length
  };
  return frameObj;
};

const generateVertexes = (
  frame: Frame,
  groups: GroupParameters[]
): Vertex[] => {
  const subdivisionDepth = groups.length - 1;
  const numOfPoints = 4 * Math.pow(2, subdivisionDepth);
  const numOfGroups = groups.length;
  var numOfVertexesPerSide = numOfPoints / frame.numOfVertexes;
  // Init root group from frame vertexes
  var vertexes: Vertex[] = frame.vertexes.map(vertex => ({
    ...vertex,
    type: "C",
    group: 0
  }));
  for (let group = 1; group < numOfGroups; group++) {
    var numOfNewVertexes = vertexes.length;
    for (let i = 1; i < numOfNewVertexes * 2; i += 2) {
      let protoVertex = {
        type: "C",
        group
      };
      vertexes.splice(i, 0, protoVertex); // Inser proto vertex in array
      let lastIndex = vertexes.length - 1;
      let prevVertexInd = i - 1;
      let nextVertexInd = i + 1;
      if (nextVertexInd > lastIndex) nextVertexInd = 0;
      // Calc X Y coords
      vertexes[i].x = vertexes[prevVertexInd].x - vertexes[nextVertexInd].x; // Substract adjacent points to get x
      vertexes[i].x *= 0.5; // Make x twice closer to center
      vertexes[i].x += vertexes[nextVertexInd].x; // Position x inbetween of adjacent points
      vertexes[i].y = vertexes[prevVertexInd].y - vertexes[nextVertexInd].y; // Make the same with Y
      vertexes[i].y *= 0.5;
      vertexes[i].y += vertexes[nextVertexInd].y;
      vertexes[i].radians = Math.atan2(vertexes[i].y, vertexes[i].x);
    }
  }

  return vertexes;
};

const remapVertexes = (vertexes: Vertex[]): Vertex[] => {
  /*
   * Add "M" vertex to the array at the start
   * Move first vertex to the end
   */

  var newArray = [];
  vertexes[vertexes.length] = vertexes[0];
  vertexes[0] = { ...vertexes[0], type: "M" };
  return vertexes;
};

const setControlPoints = (
  vertexes: Vertex[],
  groups: GroupParameters[]
): Vertex[] => {
  var numOfPoints = vertexes.length - 1; // Minus "M" vertex
  for (let i = 1; i < vertexes.length; i++) {
    let firstArmLength, secondArmLength;
    firstArmLength = secondArmLength =
      (4 / 3) * Math.tan(Math.PI / (2 * numOfPoints));
    firstArmLength *= groups[vertexes[i - 1].group].round;
    secondArmLength *= groups[vertexes[i].group].round;
    let firstArmRadians = vertexes[i - 1].radians + Math.PI / 2; // angle + 90 from the previous point angle
    let firstArmAngle = radToAngle(firstArmRadians);
    let secondArmRadians = vertexes[i].radians - Math.PI / 2; // angle + 90 from cur point
    let secondArmAngle = radToAngle(secondArmRadians);
    let cosx1 = round(Math.cos(firstArmRadians));
    let cosx2 = round(Math.cos(secondArmRadians));
    let siny1 = round(Math.sin(firstArmRadians));
    let siny2 = round(Math.sin(secondArmRadians));
    let x1 = cosx1 * firstArmLength + vertexes[i - 1].x;
    let x2 = cosx2 * secondArmLength + vertexes[i].x;
    let y1 = siny1 * firstArmLength + vertexes[i - 1].y;
    let y2 = siny2 * secondArmLength + vertexes[i].y;
    vertexes[i] = {
      ...vertexes[i],
      x1,
      x2,
      y1,
      y2,
      cosx1,
      cosx2,
      siny1,
      siny2
    };
  }
  return vertexes;
};

const scaleToOne = (path: PathData): PathData => {
  var maxX = 0;
  var maxY = 0;
  path.vertexes.forEach(vertex => {
    if (vertex.x > maxX) maxX = vertex.x;
    if (vertex.y > maxY) maxY = vertex.y;
  });
  var factorX = 1 / maxX;
  var factorY = 1 / maxY;
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x *= factorX;
    vertex.y *= factorY;
    if (vertex.type === "C") {
      vertex.x1 *= factorX;
      vertex.x2 *= factorX;
      vertex.y1 *= factorY;
      vertex.y2 *= factorY;
    }
    return vertex;
  });
  return path;
};

const setCenter = (frameParams: FrameParameters, path: PathData): PathData => {
  var factorX = 1 - frameParams.centerX / (frameParams.width / 2);
  var factorY = 1 - frameParams.centerY / (frameParams.height / 2);
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x += factorX;
    vertex.y += factorY;
    if (vertex.type === "C") {
      vertex.x1 += factorX;
      vertex.x2 += factorX;
      vertex.y1 += factorY;
      vertex.y2 += factorY;
    }
    return vertex;
  });
  return path;
};

const setDistance = (path: PathData): PathData => {
  var distanceFactors: number[] = [];
  const randomFactor = (min: number, max: number): number =>
    Math.random() * (max - min) + min;
  var { vertexes, groups } = path;
  path.vertexes = path.vertexes.map((ver, i) => {
    // Calc factor
    var group = groups[ver.group];
    console.log("random", group.distanceRandomRange);
    var factor = group.distanceRandomRange
      ? randomFactor(group.distanceRandomRange[0], group.distanceRandomRange[1])
      : group.distance;
    factor = i === vertexes.length - 1 ? distanceFactors[0] : factor;
    // Setup distance
    distanceFactors[i] = factor;
    ver.x *= factor;
    ver.y *= factor;
    console.log("factor", factor);

    if (ver.type === "C") {
      // Calc factor
      let prevGroup = groups[vertexes[i - 1].group];
      let prevFactor = distanceFactors[i - 1];
      // Setup distance
      ver.x1 *= prevFactor;
      ver.y1 *= prevFactor;
      ver.x2 *= factor;
      ver.y2 *= factor;
    }
    console.log("vertex", ver);
    return ver;
  });
  return path;
};

const setPosition = (
  frameParams: FrameParameters,
  path: PathData
): PathData => {
  var factorX = frameParams.centerX / (frameParams.width / 2);
  var factorY = frameParams.centerY / (frameParams.height / 2);
  path.frame.vertexes = path.frame.vertexes.map(vertex => {
    vertex.x += factorX;
    vertex.y += factorY;
    return vertex;
  });
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x += factorX;
    vertex.y += factorY;
    if (vertex.type === "C") {
      vertex.x1 += factorX;
      vertex.y1 += factorY;
      vertex.x2 += factorX;
      vertex.y2 += factorY;
    }
    return vertex;
  });
  return path;
};

const setScale = (path: PathData, frameParams: FrameParameters): PathData => {
  path.frame.vertexes = path.frame.vertexes.map(vertex => {
    vertex.x *= frameParams.width / 2;
    vertex.y *= frameParams.height / 2;
    return vertex;
  });
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x *= frameParams.width / 2;
    vertex.y *= frameParams.height / 2;
    if (vertex.type === "C") {
      vertex.x1 *= frameParams.width / 2;
      vertex.y1 *= frameParams.height / 2;
      vertex.x2 *= frameParams.width / 2;
      vertex.y2 *= frameParams.height / 2;
    }
    return vertex;
  });
  return path;
};

const shift = (path: PathData, frameParams: FrameParameters): PathData => {
  const { x, y } = frameParams;
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x += x;
    vertex.y += y;
    if (vertex.type === "C") {
      vertex.x1 += x;
      vertex.x2 += x;
      vertex.y1 += y;
      vertex.y2 += y;
    }
    return vertex;
  });
  return path;
};

const generateD = (path: PathData): PathData => {
  path.vertexes = path.vertexes.map(vertex => {
    switch (vertex.type) {
      case "M":
        vertex.d = `${vertex.type} ${vertex.x} ${vertex.y}`;
        break;
      case "C":
        vertex.d = `${vertex.type}\n${vertex.x1} ${vertex.y1},\n${vertex.x2} ${
          vertex.y2
        },\n${vertex.x} ${vertex.y}`;
        break;
      default:
        vertex.d = ``;
    }
    return vertex;
  });
  var svgPathData = "";
  path.vertexes.forEach((vertex, i) => {
    svgPathData += "\n\n" + vertex.d;
  });
  svgPathData += "\n\nZ";
  path.svgPathData = svgPathData;
  return path;
};

const generateSVGPathData = (path: PathData): PathData => {
  var array = [];
  path.vertexes.forEach((vertex, index) => {
    if (index === 0) {
      array[path.vertexes.length] = vertex;
    }
  });
  path.svgPathData;
  return path;
};

/********
 * Root *
 ********/

const generateShape = (
  frameParams: FrameParameters = defaults.frameParams,
  groups: GroupParameters[] = [defaults.group]
): PathData => {
  // Setup defaults
  frameParams = { ...defaults.frameParams, ...frameParams };
  groups = groups.map(group => ({ ...defaults.group, ...group }));
  // Generate shape
  var frame: Frame = generateFrame(frameParams);
  var vertexes: Vertex[] = generateVertexes(frame, groups);
  vertexes = remapVertexes(vertexes);
  vertexes = setControlPoints(vertexes, groups);

  var path: PathData = { frame, vertexes, groups };
  path = scaleToOne(path);
  path = setCenter(frameParams, path);
  path = setDistance(path);
  path = setPosition(frameParams, path);
  path = setScale(path, frameParams);
  path = shift(path, frameParams);
  path = generateD(path);
  return path;
};

let defaults = {
  frameParams: {
    depth: 0,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    centerX: 50,
    centerY: 50,
    rotate: 0
  },
  group: {
    round: 0.5,
    distance: 1
  }
};

export default generateShape;
