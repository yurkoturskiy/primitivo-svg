# Primitivo - JavaScript SVG library

Primitivo is a JS SVG library, which generates and animates SVG shapes. You can use apply it for a wide variaty of things, like spinners, transitions effects, or as a part of illustrations.

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
