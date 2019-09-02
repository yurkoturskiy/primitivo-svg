const numOfSegments = 4;
const x = 0;
const y = 0;
const width = 1000;
const height = 700;
const centerX = 200;
const centerY = 100;
const rotate = 45;

const startPath = {
  numOfSegments,
  x,
  y,
  width,
  height,
  centerX,
  centerY,
  rotate,
  groups: [
    {
      incircle: true,
      radius: 8,
      round: 1,
      adaptArms: true,
      smartRound: true
    },
    {
      incircle: true,
      type: "radial",
      radius: 8,
      round: 1,
      adaptArms: true,
      smartRound: true
    }
  ]
};

const endPath = {
  numOfSegments,
  x,
  y,
  width,
  height,
  centerX,
  centerY,
  rotate,
  groups: [
    {
      incircle: false,
      distance: 1,
      round: 0,
      adaptArms: true
    },
    {
      incircle: false,
      type: "linear",
      distance: 1,
      round: 1,
      adaptArms: false
    }
  ]
};

///////////////
// Phase one //
///////////////

var progressionsPhaseScope = (params: any): number[] => {
  let numOfVertexes = params.endPath.vertexes.length;
  let progressions: number[] = Array(numOfVertexes);
  progressions.fill(1, 0, numOfVertexes);
  return progressions;
};

var progressionsGeneralScope = (params: any): number[] => {
  let numOfVertexes = params.endPath.vertexes.length;
  let progressions: number[] = Array(numOfVertexes);
  progressions.fill(params.duration, 0, numOfVertexes);
  return progressions;
};

const phaseOne = {
  duration: 0.1,
  progressionsPhaseScope,
  progressionsGeneralScope,
  parameters: {
    numOfSegments: () => numOfSegments,
    x: () => x,
    y: () => y,
    width: () => width,
    height: () => height,
    centerX: () => centerX,
    centerY: () => centerY,
    rotate: () => rotate,
    groups: [
      {
        incircle: () => true,
        type: () => "radial",
        radius: () => 10,
        round: () => 0
      },
      {
        incircle: () => true,
        type: () => "linear",
        radius: () => 10,
        round: () => 1
      }
    ]
  }
};

var progressionsPhaseScope = (params: any): number[] => {
  let progressions: number[] = [];
  const { endPath } = params;
  params.endPath.vertexes.forEach((vertex: any, index: any) => {
    let maxLength = endPath.parameters.maxLengthByGroup[vertex.group];
    let delta = maxLength / vertex.length;
    progressions.push(1 / delta);
  });
  return progressions;
};

var progressionsGeneralScope = (params: any): number[] => {
  const { duration, endPath, prevPhaseProgressions } = params;
  let progressions: number[] = [];
  params.endPath.vertexes.forEach((vertex: any, index: any) => {
    let maxLength = endPath.parameters.maxLengthByGroup[vertex.group];
    let delta = maxLength / vertex.length;
    progressions.push(duration / delta + prevPhaseProgressions[index]);
  });
  return progressions;
};

const phaseTwo = {
  duration: 0.5,
  progressionsPhaseScope,
  progressionsGeneralScope,
  parameters: {
    numOfSegments: () => numOfSegments,
    x: () => x,
    y: () => y,
    width: () => width,
    height: () => height,
    centerX: () => centerX,
    centerY: () => centerY,
    rotate: () => rotate,
    groups: [
      {
        incircle: () => true,
        type: () => "radial",
        radius: () => 40,
        round: () => 0
      },
      {
        incircle: () => true,
        type: () => "linear",
        radius: () => 40,
        round: () => 1
      }
    ]
  }
};

const phaseThree = {
  duration: 0.4,
  progressionsPhaseScope,
  progressionsGeneralScope,
  parameters: {
    numOfSegments: () => numOfSegments,
    x: () => x,
    y: () => y,
    width: () => width,
    height: () => height,
    centerX: () => centerX,
    centerY: () => centerY,
    rotate: () => rotate,
    groups: [
      {
        incircle: () => true,
        type: () => "radial",
        distance: () => 1,
        round: () => 0
      },
      {
        incircle: () => true,
        type: () => "linear",
        distance: () => 1,
        round: () => 1
      }
    ]
  }
};

export default {
  startPath,
  endPath,
  phases: [{ ...phaseOne }, { ...phaseTwo }, { ...phaseThree }]
};
