# Primitivo - JavaScript SVG library

Primitivo is a JS SVG library, which generates and animates SVG shapes. You can use it for a wide variaty of things, like spinners, transitions effects, or as a part of illustrations.

## Path Layer

Draw a figure

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
| incircle      | Keep points in circle's boundaries   |
| groups:       | Array of groups settings             |
| - type        | Linear of radial                     |
| - distance    | Distance from center                 |
| - round       | Value of the round strength          |

## Spacing Layer

Calculate keySplines for a defined timing and spacing.

## Phases Layer

Make complex sequence of paths based on input parameters
