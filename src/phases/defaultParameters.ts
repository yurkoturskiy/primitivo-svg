const startPath = {
  numOfSegments: 4,
  x: 0,
  y: 0,
  width: window.innerWidth,
  height: window.innerWidth,
  centerX: 200,
  centerY: 100,
  rotate: 45,
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
  numOfSegments: 4,
  x: 0,
  y: 0,
  width: window.innerWidth,
  height: window.innerHeight,
  centerX: 200,
  centerY: 100,
  rotate: 45,
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

const phaseOne = {
  duration: 0,
  parameters: {
    numOfSegments: () => 4,
    x: () => 0,
    y: () => 0,
    width: () => 400,
    height: () => 400,
    centerX: () => 200,
    centerY: () => 200,
    rotate: () => 0,
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
    numOfSegments: () => 4,
    x: () => 0,
    y: () => 0,
    width: () => 400,
    height: () => 400,
    centerX: () => 200,
    centerY: () => 200,
    rotate: () => 0,
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
    numOfSegments: () => 4,
    x: () => 0,
    y: () => 0,
    width: () => 400,
    height: () => 400,
    centerX: () => 200,
    centerY: () => 200,
    rotate: () => 0,
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
