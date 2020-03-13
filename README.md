# Primitivo-SVG (Alpha) - JavaScript library for SVG

Primitivo is a JavaScript library for SVG. That means it prepares data for the SVG and doesn't manipulate the DOM. Think about it as the SVG assistant. With it, you can create spinners, transitions effects, or elements for illustrations.

## What makes it unique

1. Morph paths via animate tag;
2. Powerful timing and spacing controls;
3. Phased animation;
4. Animate with SSR and turned off JS (except for interactive cases).

## Examples:

#### CodeSandboxes:

1. [Sequence of polygons](https://codesandbox.io/s/github/guandjoy/sequence-of-polygons)
2. [Smart round](https://codesandbox.io/s/github/guandjoy/smart-round)
3. [Noise of distance](https://codesandbox.io/s/github/guandjoy/noise-of-distance)
4. [Phased transition](https://codesandbox.io/s/github/guandjoy/phased-transition)
5. [Blobby Spinner](https://codesandbox.io/s/github/guandjoy/blobby-spinner)

#### Collections of examples:

- Project on Dribbble: https://dribbble.com/Guandjoy/projects/1539697-Primitivo-SVG
- Article on Dev.to: https://dev.to/guandjoy/primitivo-the-js-library-for-svg-set-of-examples-27g6

## Collections of design concepts:

1. Dribbble: <https://dribbble.com/Guandjoy/buckets/1504217-primitivo>
2. Pinterest: <https://www.pinterest.com/yurko_turskiy/primitivo/>

## Buy me a coffee :coffee:

Coffee will help me to develop Primitivo faster.

Bitcoin wallet: `19fxW81ApuCbAu2tW8WebxRQqaoje6YbhJ`

## Install:

```shell
npm install --save primitivo-svg
```

## Backlog:

1. Corners rounding and smoothing

## Path Layer

Draw a figure

### base parameters:

| Name                        | Description |
| --------------------------- | ----------- |
| numOfSegments?: number;     |             |
| depth?: number;             |             |
| x?: number;                 |             |
| y?: number;                 |             |
| width?: number;             |             |
| height?: number;            |             |
| centerX?: number;           |             |
| centerY?: number;           |             |
| rotate?: number;            |             |
| numOfGroups?: number;       |             |
| groups?: GroupParameters[]; |             |

### Group Parameters

| Name             | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| type             | linear or radial                                                 |
| incircle         |
| distance         |
| round            |
| smartRound       | Able to create perfect circle from a polygon with custom radians |
| lengthBasedRound | The longer distance from center the bigger round factor is       |
| adaptArms        | Keep arms always perpendicular to center                         |
| radius           |
| radians          | Custom radians for each point of a group                         |

## Morping Layer

Draw a sequence of paths

### parameters:

| Name          | Description                  |
| ------------- | ---------------------------- |
| numOfKeyPaths | Number of key paths (frames) |
| loop          | Loop the animation           |

### keyPathsParameters:

| Name          | Description                          |
| ------------- | ------------------------------------ |
| numOfSegments | Number of segments of the path frame |
| depth         | Pow the number of segments           |
| x             | X coordinate of the top left corner  |
| y             | Y coordinate of the top left corner  |
| width         | The width of the frame               |
| height        | The height of the frame              |
| centerX       | X coordinate of the center point     |
| centerY       | Y coordinate of the center point     |
| rotate        | Rotate the figure                    |
| numOfGroups   | Limit the number of groups           |
| groups:       | Array of groups settings             |
| - type        | Linear of radial                     |
| - distance    | Distance from center                 |
| - round       | Value of the round strength          |
| - incircle    | Keep points in circle's boundaries   |

## Spacing Layer

Calculate keySplines for a defined timing and spacing.

## Phases Layer

Make complex sequence of paths based on input parameters

### Parameters:

| Name          | Description                          |
| ------------- | ------------------------------------ |
| numOfSegments | Number of segments of the path frame |
| depth         | Pow the number of segments           |
| x             | X coordinate of the top left corner  |
| y             | Y coordinate of the top left corner  |
| width         | The width of the frame               |
| height        | The height of the frame              |
| centerX       | X coordinate of the center point     |
| centerY       | Y coordinate of the center point     |
| rotate        | Rotate the figure                    |
| numOfGroups   | Limit the number of groups           |
