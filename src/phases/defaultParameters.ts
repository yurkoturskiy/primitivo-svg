const numOfSegments = 4;
const x = 0;
const y = 0;
const width = window.innerWidth;
const height = window.innerHeight;
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
  incircle: true,
  groups: [
    {
      radius: 8,
      round: 1,
      adaptArms: true,
      smartRound: true
    },
    {
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
  incircle: false,
  groups: [
    {
      distance: 1,
      round: 0,
      adaptArms: true
    },
    {
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

const phaseOne = {
  duration: 0,
  parameters: {
    numOfSegments: () => numOfSegments,
    x: () => x,
    y: () => y,
    width: () => width,
    height: () => height,
    centerX: () => centerX,
    centerY: () => centerY,
    rotate: () => rotate,
    incircle: () => true,
    groups: () => [
      {
        type: () => "radial",
        radius: () => 10,
        round: () => 0
      },
      {
        type: () => "linear",
        radius: () => 10,
        round: () => 1
      }
    ]
  }
};

const phaseTwo = {
  duration: 0.1,
  parameters: {
    numOfSegments: () => numOfSegments,
    x: () => x,
    y: () => y,
    width: () => width,
    height: () => height,
    centerX: () => centerX,
    centerY: () => centerY,
    rotate: () => rotate,
    incircle: () => true,
    groups: () => [
      {
        type: () => "radial",
        radius: () => 40,
        round: () => 0
      },
      {
        type: () => "linear",
        radius: () => 40,
        round: () => 1
      }
    ]
  }
};

const phaseThree = {
  duration: 0.6,
  parameters: {
    numOfSegments: () => numOfSegments,
    x: () => x,
    y: () => y,
    width: () => width,
    height: () => height,
    centerX: () => centerX,
    centerY: () => centerY,
    rotate: () => rotate,
    incircle: () => true,
    groups: () => [
      {
        type: () => "radial",
        distance: () => 1,
        round: () => 0
      },
      {
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
